from typing import Any, Dict

import httpx
import pystache
from db.database import get_db_session
from db.models.models import Credentials
from fastapi import HTTPException
from sqlmodel import select


async def send_Telegram_Msg(
    credential_id: str, template: Dict[str, Any], context: Dict[str, Any]
):
    db = get_db_session()
    statement = select(Credentials).where(Credentials.id == credential_id)
    credential = db.exec(statement).first()
    if not credential:
        raise HTTPException(status_code=400, detail="Telegram credential not found")
    data = credential.data
    api_Key: str = data.get("apiKey")
    chat_id: str = data.get("chatId")
    if not api_Key or not chat_id:
        raise HTTPException(
            status_code=404, detail="You have not provided both the botToken and chatId"
        )
    message_text = pystache.render(template.get("message", ""), context)
    url = f"https://api.telegram.org/bot{api_Key}/sendMessage"
    payload = {"chat_id": chat_id, "text": message_text}
    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=payload)
        text = res.text
        if res.status_code != 200:
            raise HTTPException(status_code=502, detail="Telegram api error")
        return {"msg": message_text, "msg_sent": text}
