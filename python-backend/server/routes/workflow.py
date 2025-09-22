from typing import Any, Dict
from uuid import UUID

from db.database import get_session
from db.models.models import Execution, ExecutionStatus, User, Workflow
from db.models.schemas import WorkflowCreate
from fastapi import APIRouter, Depends, HTTPException
from server.redis.redis import addToQueue
from server.routes.user import authenticate_user
from sqlmodel import Session, select

router = APIRouter()


@router.post("/workflows/{workflow_id}")
async def execute_workflow(
    workflow_id: str, context: Dict[str, Any], db: Session = Depends(get_session)
):
    try:
        statement = select(Workflow).where(Workflow.id == workflow_id)
        workflow = db.exec(statement).first()
        if not workflow:
            raise HTTPException(
                status_code=400, detail="No workflow found for the id provided"
            )
        nodes: Dict[str, Any] = workflow.nodes
        connections: Dict[str, Any] = workflow.connections
        total_tasks = len(nodes)
        execution = Execution(
            workflow_id=UUID(workflow_id),
            status=ExecutionStatus.RUNNING,
            tasks_done=0,
            total_tasks=total_tasks,
            result={"triggerPyload": context, "nodeResults": {}},
        )
        db.add(execution)
        db.commit()
        db.refresh(execution)
        starting_node = find_starting_node(nodes, connections)
        for node_id in starting_node:
            node_data = nodes[node_id]
            job = {
                "id": f"{node_id}-{execution.id}",
                "type": node_data.get("type", "").lower(),
                "data": {
                    "executionId": str(execution.id),
                    "workflowId": str(execution.workflow_id),
                    "nodeId": node_id,
                    "credentialId": node_data.get("credentials"),
                    "nodeData": node_data,
                    "context": context,
                    "connections": connections.get(node_id, []),
                },
            }
            await addToQueue(job)
        return {
            "message": "Workflow execution started",
            "executionId": str(execution.id),
            "workflowId": workflow_id,
            "totalTasks": total_tasks,
        }
    except Exception as error:
        print(f"Error while running the workflow: {error}")
        raise HTTPException(status_code=400, detail="Error occured")


@router.get("/workflows")
async def get_workflows(db: Session = Depends(get_session)):
    try:
        workflows = db.exec(select(Workflow)).all()
        return workflows
    except Exception as e:
        print(f"Error getting workflows: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str, db: Session = Depends(get_session)):
    try:
        statement = select(Workflow).where(Workflow.id == workflow_id)
        workflow = db.exec(statement).first()
        if not workflow:
            raise HTTPException(status_code=400, detail="Workflow not found")
        return workflow
    except Exception as e:
        print(f"Error while fetching the workflow: {e}")


@router.post("/workflows")
async def create_workflow(
    workflow: WorkflowCreate,
    db: Session = Depends(get_session),
    user: User = Depends(authenticate_user),
):
    try:
        new_workflow = Workflow(
            title=workflow.title,
            nodes=workflow.nodes,
            connections=workflow.connections,
            trigger_type=workflow.trigger_type,
            user_id=user.id,
            webhook_id=None,
        )
        db.add(new_workflow)
        db.commit()
        db.refresh(new_workflow)
        return new_workflow
    except Exception as e:
        print(f"Error while adding workflow to db: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/workflows/{workflow_id}")
async def update_worflow(
    workflow_id: str,
    workflow_data: WorkflowCreate,
    db: Session = Depends(get_session),
    user: User = Depends(authenticate_user),
):
    try:
        workflow = db.get(Workflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=400, detail="No workflow found")
        if workflow.user_id != user.id:
            raise HTTPException(status_code=400, detail="User is not authorized")
        workflow.title = workflow_data.title
        workflow.nodes = {
            node_id: node.dict() for node_id, node in workflow_data.nodes.items()
        }
        workflow.connections = workflow_data.connections
        workflow.trigger_type = workflow_data.trigger_type
        db.add(workflow)
        db.commit()
        db.refresh(workflow)
    except Exception as e:
        print(f"Error while updating workflow: {e}")


def find_starting_node(nodes: Dict[str, Any], connections: Dict[str, Any]):
    has_incoming = set()
    for values in connections.values():
        for v in values:
            has_incoming.add(v)
    return [node_id for node_id in nodes.keys() if node_id not in has_incoming]
