import os
from typing import Any, Dict, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Request
from sqlmodel import Session

from db.database import get_session
from db.models.models import Workflow
from server.controller.webhook import handle_webhook_call
from server.routes.user import authenticate_user

router = APIRouter()


@router.post("/webhook/{webhook_id}")
async def initiate_webhook(
    webhook_id: UUID, request: Request, db: Session = Depends(get_session)
):
    try:
        query_params = dict(request.query_params)
        headers = dict(request.headers)
        body = await request.body()
        result = await handle_webhook_call(
            db=db,
            webhook_id=webhook_id,
            query_params=query_params,
            headers=headers,
            body=body,
        )

        execution_id = result["execution_id"]
        has_form = result["has_form"]
        frontend_url = os.getenv("FRONTEND_URL")
        if not frontend_url:
            base_url = os.getenv("BASE_URL", "http://localhost:8000")
            frontend_url = base_url.replace(":8000", ":8080")

        response = {
            "status": "success",
            "message": "Workflow triggered successfully",
            "execution_id": execution_id,
            "workflow_id": result["workflow_id"],
        }

        if has_form:
            form_url = f"{frontend_url}/form/{execution_id}"
            response["form_url"] = form_url
            response["message"] = (
                "Workflow will pause at form. Share the form URL below."
            )
            response["instructions"] = (
                "The workflow will pause when it reaches the form node. Share the form_url with users to collect input."
            )

        return response
    except Exception as e:
        print(f"Error while handling webhook: {e}")
