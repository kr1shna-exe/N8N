import httpx
from fastapi import APIRouter, HTTPException

from db.models.schemas import PostmarkInbound

router = APIRouter()


@router.post("/")
async def postmark_inbound_webhook(payload: PostmarkInbound):
    subject = payload.Subject
    try:
        execution_id = subject.split("[")[1].split("]")[0]
    except IndexError:
        raise HTTPException(
            status_code=400, detail="Could not find executionId in subject"
        )

    email_body = payload.TextBody
    if payload.StrippedTextReply:
        email_body = payload.StrippedTextReply

    resume_data = {
        "email_from": payload.From,
        "email_subject": payload.Subject,
        "email_body": email_body,
    }

    base_url = "http://localhost:8000"
    resume_url = f"{base_url}/api/resume/{execution_id}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(resume_url, json=resume_data)
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Failed to resume workflow: {e.response.text}",
            )

    return {"status": "success"}
