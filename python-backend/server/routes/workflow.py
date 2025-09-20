from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from server.redis.redis import addToQueue
from sqlmodel import Session, select
from db.database import get_session
from db.models.models import Execution, Workflow

router = APIRouter()

@router.post("/workflow/{workflow_id}")
async def execute_workflow(
        workflow_id: str,
        context: Dict[str, Any],
        db: Session = Depends(get_session)
):
    try:
        statement = select(Workflow).where(Workflow.id == workflow_id)
        workflow = db.exec(statement).first()
        if not workflow:
            raise HTTPException(status_code=400, detail="No workflow found for the id provided")
        nodes: Dict[str, Any]  = workflow.nodes
        connections: Dict[str, Any] = workflow.connections
        total_tasks = len(nodes)
        execution = Execution(
            workflow_id = workflow_id,
            status = False,
            tasks_done = 0,
            total_tasks = total_tasks,
            result = { "triggerPyload": context, "nodeResults": {}}
        )
        db.add(execution)
        db.commit()
        db.refresh(execution)
        starting_node = find_starting_node(nodes, connections)
        for node_id in starting_node:
            node_data = nodes[node_id]
            job = {
                "id": f"{node_id}-{execution.id}",
                "type": node_data.get("type","").lower(),
                "data": {
                "executionId": str(execution.id),
                "workflowId": str(execution.workflow_id),
                "nodeId": node_id,
                "credentialId": node_data.get("credentials"),
                "nodeData": node_data,
                "context": context,
                "connections": connections.get(node_id, [])
                }
            }
            await addToQueue(job)
        return {
            "message": "Workflow execution started",
            "executionId": str(execution.id),
            "workflowId": workflow_id,
            "totalTasks": total_tasks
            }
    except Exception as error:
        print(f"Error while running the workflow: {error}")
        raise HTTPException(status_code=400, detail="Error occured")



def find_starting_node(nodes: Dict[str, Any], connections: Dict[str, Any]):
    has_incoming = set()
    for values in connections.values():
        for v in values:
            has_incoming.add(v)
    return [node_id for node_id in nodes.keys() if node_id not in has_incoming]
