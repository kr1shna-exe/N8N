import json
from typing import Any, Dict
from exports.redis import redis_client
QUEUE_NAME = "workflow-queue"


async def addToQueue(job: Dict[str, Any]):
    try:
        job_data = {"id": job["id"], "type": job["type"], "data": job["data"]}
        redis_client.lpush(QUEUE_NAME, json.dumps(job_data))
        print(f"Job of {job['id']} added to queue: {job['type']}")
    except Exception as error:
        print(f"Error while entering the queue: {error}")


async def getFromQueue(timeout: int = 0):
    try:
        res = redis_client.brpop(QUEUE_NAME, timeout)
        if res:
            return json.loads(res[1])
        return None
    except Exception as error:
        print(f"Error while getting from queue: {error}")


async def clearQueue():
    try:
        redis_client.delete(QUEUE_NAME)
        print(f"Queue {QUEUE_NAME} successfully deleted")
    except Exception as error:
        print(f"Error while clearing the queue: {error}")
