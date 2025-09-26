import json
from typing import Dict
from uuid import UUID

from db.models.models import Execution, ExecutionStatus, Workflow
from exports.redis import redis_client
from fastapi import HTTPException
from server.redis.index import addToQueue
from sqlmodel import Session, select


async def handle_webhook_call(
    webhook_id: UUID, db: Session, headers: Dict, body: bytes, query_params: Dict
):
    try:
        statement = select(Workflow).where(Workflow.id == webhook_id)
        workflow = db.exec(statement).first()
        if not workflow:
            raise HTTPException(
                status_code=404, detail="No workflow found for the Id provided"
            )
        nodes = workflow.nodes or {}
        connections = workflow.connections or {}
        trigger_node_id = None
        for node_id, node_data in nodes.items():
            if node_data.get("type") == "webhook":
                trigger_node_id = node_id
                break
        if not trigger_node_id:
            raise HTTPException(status_code=500, detail="Workflow has not webhook id")
        new_execution = Execution(
            workflow_id=workflow.id,
            status=ExecutionStatus.PENDING,
            total_tasks=len(nodes),
        )
        db.add(new_execution)
        db.commit()
        db.refresh(new_execution)
        try:
            body_data = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError:
            body_data = body.decode("utf-8", errors="ignore")
        webhook_data = {
            "headers": headers,
            "body": body_data,
            "query_params": query_params,
        }
        initial_job = {
            "id": f"{trigger_node_id}-{new_execution.id}",
            "type": "webhook",
            "data": {
                "executionId": str(new_execution.id),
                "workflowId": str(workflow.id),
                "nodeId": trigger_node_id,
                "nodeData": nodes[trigger_node_id],
                "context": webhook_data,
                "connections": connections.get(trigger_node_id, []),
            },
        }
        await addToQueue(initial_job)
        return new_execution.id
    except Exception as e:
        print(f"Error while handling webhook call: {e}")
