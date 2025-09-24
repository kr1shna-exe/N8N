from os import stat
from typing import Any, Dict
from uuid import UUID, uuid4

from db.database import get_session
from db.models.models import (
    Execution,
    ExecutionStatus,
    TriggerType,
    User,
    Webhook,
    Workflow,
)
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
        executable_node_types = {"email", "telegram", "form", "webhook"}
        total_tasks = sum(
            1
            for node in nodes.values()
            if node.get("type", "").lower() in executable_node_types
            or node.get("data", {}).get("nodeType", "").lower() in executable_node_types
        )
        execution = Execution(
            workflow_id=UUID(workflow_id),
            status=ExecutionStatus.RUNNING,
            tasks_done=0,
            total_tasks=total_tasks,
            result={"triggerPayload": context, "nodeResults": {}},
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
        webhook_id = None
        if workflow.trigger_type == TriggerType.WEBHOOK:
            new_webhook = Webhook(
                title="Default Webhook",
                id=uuid4(),
            )
            db.add(new_webhook)
            db.commit()
            db.refresh(new_webhook)
            webhook_id = new_webhook.id
        new_workflow = Workflow(
            title=workflow.title,
            nodes=workflow.nodes,
            connections=workflow.connections,
            trigger_type=workflow.trigger_type,
            user_id=user.id,
            webhook_id=webhook_id,
        )
        db.add(new_workflow)
        db.commit()
        db.refresh(new_workflow)
        return new_workflow
    except Exception as e:
        print(f"Error while adding workflow to db: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/workflows/{workflow_id}")
async def update_workflow(
    workflow_id: str,
    workflow_data: WorkflowCreate,
    db: Session = Depends(get_session),
    user: User = Depends(authenticate_user),
):
    try:
        workflow = db.get(Workflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        if workflow.user_id != user.id:
            raise HTTPException(
                status_code=403, detail="Not authorized to update this workflow"
            )
        if workflow.trigger_type == TriggerType.WEBHOOK and not workflow.webhook_id:
            new_Webhook = Webhook(title="Default Webhook", id=uuid4())
            db.add(new_Webhook)
            db.commit()
            db.refresh(new_Webhook)
        workflow.title = workflow_data.title
        workflow.nodes = {
            node_id: node.dict() for node_id, node in workflow_data.nodes.items()
        }
        workflow.connections = workflow_data.connections
        workflow.trigger_type = workflow_data.trigger_type
        db.add(workflow)
        db.commit()
        db.refresh(workflow)
        return workflow
    except Exception as e:
        print(f"Error while updating workflow: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.delete("/workflows/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    db: Session = Depends(get_session),
    user: User = Depends(authenticate_user),
):
    try:
        workflow = db.get(Workflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        if workflow.user_id != user.id:
            raise HTTPException(
                status_code=403, detail="Not authorized to delete this workflow"
            )

        # First, delete all executions associated with this workflow
        executions = db.exec(
            select(Execution).where(Execution.workflow_id == workflow_id)
        ).all()
        for execution in executions:
            db.delete(execution)

        db.delete(workflow)
        db.commit()
        return {"message": "Workflow deleted successfully"}
    except Exception as e:
        print(f"Error while deleting workflow: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


def find_starting_node(nodes: Dict[str, Any], connections: Dict[str, Any]):
    has_incoming = set()
    for values in connections.values():
        for v in values:
            has_incoming.add(v)
    return [node_id for node_id in nodes.keys() if node_id not in has_incoming]
