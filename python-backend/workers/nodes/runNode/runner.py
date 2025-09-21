from typing import Any, Dict

from fastapi import HTTPException
from ..email import send_Email
from ..telegram import send_Telegram_Msg
from ..form import run_form


async def runNode(node: Any, context: Dict[str, Any]):
    try:
        node_type = node.get("type")
        if node_type == "email":
            return await send_Email(node["credentialId"], node["template"], context)
        elif node_type == "telegram":
            return await send_Telegram_Msg(
                node["credentialId"], node["template"], context
            )
        elif node_type == "form":
            return await run_form(node["credentialId"], node["template"], context)
        else:
            raise HTTPException(
                status_code=400, detail=f"Node type is not found: {node_type}"
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500, detail="Internal server error while running code"
        )
