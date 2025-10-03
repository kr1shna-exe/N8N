from typing import Any, Dict

node_details = {
    "type": "form",
    "name": "Form",
    "description": "Pauses the workflow and waits for a user to submit a form.",
    "category": "Triggers",
    "icon": "📝",
}


async def run_form(
    credential_id: str, template: Dict[str, Any], context: Dict[str, Any]
):
    print("Form node encountered. Workflow will be paused.")
    return None
