from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from db.database import get_session
from db.models.models import Execution, ExecutionStatus, Workflow
from server.redis.index import addToQueue

router = APIRouter()


@router.post("/resume/{execution_id}")
async def resume_workflow(
    execution_id: str, data: Dict[str, Any], db: Session = Depends(get_session)
):
    try:
        execution = db.get(Execution, execution_id)
        if not execution:
            raise HTTPException(status_code=400, detail="Execution not found")
        if execution.status != ExecutionStatus.PAUSED:
            raise HTTPException(status_code=400, detail="Execution is not paused")
        execution.status = ExecutionStatus.RUNNING
        paused_node_id = execution.paused_node_id
        execution.paused_node_id = None
        db.add(execution)
        db.commit()
        workflow = db.get(Workflow, execution.workflow_id)
        if not workflow:
            raise HTTPException(status_code=400, detail="Workflow not found")
        if not paused_node_id:
            raise HTTPException(
                status_code=400, detail="No paused node found in workflow"
            )
        nodes = workflow.nodes
        connections = workflow.connections
        original_context = {}
        node_results = execution.result.get("nodeResults", {})
        for node_id, node_result in node_results.items():
            original_context.update(node_result.get("result", {}))
        next_node_ids = connections.get(paused_node_id, [])
        for next_node_id in next_node_ids:
            next_node_data = nodes.get(next_node_id)
            if not next_node_data:
                continue
            job = {
                "id": f"{next_node_id}-{execution.id}",
                "type": next_node_data.get("type", "").lower(),
                "data": {
                    "executionId": str(execution.id),
                    "workflowId": str(execution.workflow_id),
                    "nodeId": next_node_id,
                    "credentialId": next_node_data.get("credentials"),
                    "nodeData": next_node_data,
                    "context": {
                        **original_context,
                        "data": data,
                    },
                    "connections": connections.get(next_node_id, []),
                },
            }
            await addToQueue(job)
        return {"message": "Workflow Resumed"}
    except Exception as e:
        print(f"Error while resuming the workflow: {e}")
        raise HTTPException(status_code=500, detail="Error when resuming")
