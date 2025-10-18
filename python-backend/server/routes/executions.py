from typing import Any, Dict, Optional

from db.database import get_session
from db.models.models import Execution, ExecutionStatus, Workflow
from fastapi import APIRouter, Depends, HTTPException
from server.redis.index import addToQueue
from sqlmodel import Session, select

router = APIRouter()


@router.get("/executions")
async def get_executions(db: Session = Depends(get_session)):
    try:
        executions = db.exec(select(Execution)).all()
        if not executions:
            raise HTTPException(status_code=400, detail="Execution not found")
        return {
            "executions": [
                {
                    "id": str(execution.id),
                    "workflow_id": execution.workflow_id,
                    "status": execution.status,
                    "tasks_done": execution.tasks_done,
                    "total_tasks": execution.total_tasks,
                    "result": execution.result,
                }
                for execution in executions
            ],
            "total": len(executions),
        }
    except Exception as exe:
        print(f"Error while getting executions: {exe}")


@router.get("/executions/{execution_id}")
async def get_execution_by_id(execution_id: str, db: Session = Depends(get_session)):
    try:
        execution = db.get(Execution, execution_id)
        if not execution:
            raise HTTPException(status_code=404, detail="Execution not found")
        return {
            "id": str(execution.id),
            "workflow_id": execution.workflow_id,
            "status": execution.status,
            "tasks_done": execution.tasks_done,
            "total_tasks": execution.total_tasks,
            "result": execution.result,
            "paused_node_id": execution.paused_node_id,
        }
    except Exception as exe:
        print(f"Error while getting execution: {exe}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/executions/{execution_id}/resume")
async def resume_workflow(
    execution_id: str, data: Dict[str, Any], db: Session = Depends(get_session)
):
    try:
        execution = db.get(Execution, execution_id)
        if not execution:
            raise HTTPException(status_code=404, detail="Execution not found")
        if execution.status != ExecutionStatus.PAUSED:
            raise HTTPException(status_code=400, detail="Execution is not paused")

        execution.status = ExecutionStatus.RUNNING
        execution.result["form_data"] = data
        paused_node_id = execution.paused_node_id
        execution.paused_node_id = None
        db.add(execution)
        db.commit()

        workflow = db.get(Workflow, execution.workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        if not paused_node_id:
            raise HTTPException(
                status_code=400, detail="No paused node found in execution"
            )

        nodes = workflow.nodes
        connections = workflow.connections
        original_context = {}
        node_results = execution.result.get("nodeResults", {})
        for node_id, node_result in node_results.items():
            node_data = nodes.get(node_id, {})
            if node_data.get("type") == "webhook":
                original_context = node_result.get("result", {})
                break
        next_node_ids = connections.get(paused_node_id, [])
        for next_node_id in next_node_ids:
            next_node_data = nodes.get(next_node_id)
            if not next_node_data:
                continue

            # Get node type from the correct location
            node_type = (
                next_node_data.get("type", "")
                or next_node_data.get("data", {}).get("nodeType", "")
            ).lower()

            job = {
                "id": f"{next_node_id}-{execution.id}",
                "type": node_type,
                "data": {
                    "executionId": str(execution.id),
                    "workflowId": str(execution.workflow_id),
                    "nodeId": next_node_id,
                    "credentialId": next_node_data.get("credentials"),
                    "nodeData": next_node_data,
                    "context": {
                        **original_context,
                        "form": data,
                    },
                    "connections": connections.get(next_node_id, []),
                },
            }
            await addToQueue(job)

        return {"message": "Workflow resumed"}
    except Exception as e:
        print(f"Error resuming workflow: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
