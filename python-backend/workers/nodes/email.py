import asyncio
from typing import Any, Dict

import pystache
import resend
from db.database import get_db_session
from db.models.models import Credentials
from fastapi import HTTPException
from sqlmodel import select


async def send_Email(
    credential_id: str, template: Dict[str, Any], context: Dict[str, Any]
):
    db = get_db_session()
    statement = select(Credentials).where(Credentials.id == credential_id)
    credential = db.exec(statement).first()
    if not credential:
        raise HTTPException(status_code=400, detail="Credential not found")
    data = credential.data
    api_Key: str = data.get("apiKey")
    if not api_Key:
        raise HTTPException(status_code=400, detail="You have not provided the api key")
    to = pystache.render(template.get("to", ""), context)
    subject = pystache.render(template.get("subject", ""), context)
    body = pystache.render(template.get("body", ""), context)
    params = {
        "from": "onboarding@resend.dev",
        "to": to,
        "subject": subject,
        "html": body,
    }
    try:

        def _send_email():
            resend.api_key = api_Key
            return resend.Emails.send(params)

        res = await asyncio.to_thread(_send_email)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to send the email: {exc}")
    return {"to": to, "subject": subject, "body": body, "message_sent": res}
