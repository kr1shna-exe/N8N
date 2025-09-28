from typing import Any, Dict

node_details = {
    "type": "waitForReply",
    "name": "Wait For Reply",
    "description": "Pause the workflow and waits for an external event to resume it",
    "category": "Control",
}


async def run_node(
    credential_id: str, template: Dict[str, Any], context: Dict[str, Any]
):
    print("Waiting for reply node ")
    return {"status": "paused"}
