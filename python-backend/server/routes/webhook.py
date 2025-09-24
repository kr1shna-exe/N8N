from typing import Any, Dict, Optional
from uuid import UUID

from db.database import get_session
from db.models.models import Workflow
from fastapi import APIRouter, Depends, Request
from server.controller.webhook import handle_webhook_call
from server.routes.user import authenticate_user
from sqlmodel import Session

router = APIRouter()

router.post("/webhook/{webhook_id}")


async def initiate_webhook(
    webhook_id: UUID, request: Request, db: Session = Depends(get_session)
):
    try:
        query_params = dict(request.query_params)
        headers = dict(request.headers)
        body = await request.body()
        execution_id = await handle_webhook_call(
            db=db,
            webhook_id=webhook_id,
            query_params=query_params,
            headers=headers,
            body=body,
        )
        return {"status": "Workflow triggered", "execution_id": execution_id}
    except Exception as e:
        print(f"Error while handling webhook: {e}")
