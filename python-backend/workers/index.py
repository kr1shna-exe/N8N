import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import asyncio
from typing import Any
from workers.nodes.runNode.runner import runNode
from sqlmodel import Session
from db.database import get_session
from db.models.models import Execution, ExecutionStatus, Workflow
from server.redis.redis import addToQueue, getFromQueue


async def update_execution(execution_id: str, node_id: str, node_result: Any, db: Session):
    execution = db.get(Execution, execution_id)
    if not execution:
        return
    cur_result = execution.result or {"nodeResults": {}}
    new_tasks_done = (execution.tasks_done or 0) + 1
    total_tasks = execution.total_tasks or 0
    is_complete = new_tasks_done >= total_tasks
    node_results = cur_result.get("nodeResults", {})
    node_results[node_id] = {
        "result": node_result,
        "completedAt": asyncio.get_event_loop().time()
    }
    new_result = {
        **cur_result,
        "nodeResults": node_results
    }
    if is_complete:
        new_result["completedAt"] = asyncio.get_event_loop().time()
        execution.status = ExecutionStatus.COMPLETED
    execution.tasks_done = new_tasks_done
    execution.result = new_result
    db.add(execution)
    db.commit()
    print(f"Execution completed: {execution_id}, {new_tasks_done}, {total_tasks}")

async def process_jobs():
    print("Worker started...")
    while True:
        try:
            job = await getFromQueue(2)
            if not job:
                await asyncio.sleep(0.1)
                continue

            job_type = job.get("type")
            with next(get_session()) as db:
                if job_type == "form":
                    try:
                        execution = db.get(Execution, job["data"]["executionId"])
                        if execution:
                            execution.status = ExecutionStatus.PAUSED
                            execution.paused_node_id = job["data"]["nodeId"]
                            db.add(execution)
                            db.commit()
                            print(f"Execution {execution.id} paused for form input at node {job['data']['nodeId']}.")
                    finally:
                        db.close()
                    continue

                node = {
                        "type": job_type,
                        "template": job["data"]["nodeData"].get("template"),
                        "credentialId": job["data"].get("credentialId")
                    }
                node_result = await runNode(node, job["data"].get("context", {}))
                
                try:
                    await update_execution(job["data"]["executionId"], job["data"]["nodeId"], node_result,db)
                    workflow = db.get(Workflow, job["data"]["workflowId"])
                    if workflow and job["data"].get("connections"):
                            nodes = workflow.nodes or {}
                            connections = workflow.connections or {}
                            updated_context = {**job["data"].get("context", {}), **(node_result or {})}
                            for next_node_id in job["data"]["connections"]:
                                next_node_data = nodes.get(next_node_id)
                                if not next_node_data:
                                    continue
                                next_job = {
                                    "id": f"{next_node_id}-{job['data']['executionId']}",
                                    "type": next_node_data.get("type", "").lower(),
                                    "data": {
                                        **job["data"],
                                        "nodeId": next_node_id,
                                        "nodeData": next_node_data,
                                        "credentialId": next_node_data.get("credentials"),
                                        "context": updated_context,
                                        "connections": connections.get(next_node_id, []),
                                    }
                                }
                                await addToQueue(next_job)
                finally:
                    db.close()
        except Exception as exe:
            print(f"Error occured while processing the job: {exe}")
asyncio.run(process_jobs())