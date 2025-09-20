from uuid import UUID
from db.database import get_session
from db.models.models import Credentials, User
from db.models.schemas import CredentialsSchema
from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError
from server.routes.user import authenticate_user
from sqlmodel import Session, select

router = APIRouter()


@router.post("/credentials")
async def create_credentials(
    credentials: CredentialsSchema,
    db: Session = Depends(get_session),
    current_user: User = Depends(authenticate_user),
):
    new_credentials = Credentials(
        title=credentials.title,
        platform=credentials.platform,
        data=credentials.data,
        user_id=current_user.id,
    )
    db.add(new_credentials)
    db.commit()
    db.refresh(new_credentials)
    return {
        "message": "Successfully added credentials",
        "credentials": {
            "id": str(new_credentials.id),
            "title": new_credentials.title,
            "platform": new_credentials.platform,
            "data": new_credentials.data,
        },
    }


@router.get("/credentials")
async def get_credentials(
    current_user: User = Depends(authenticate_user), db: Session = Depends(get_session)
):
    statement = select(Credentials).where(Credentials.user_id == current_user.id)
    credentials = db.exec(statement).all()
    credentials_list = [
        {
            "id": str(cred.id),
            "title": cred.title,
            "platform": cred.platform,
            "data": cred.data,
        }
        for cred in credentials
    ]
    return {
        "message": "Successfuly fetched credentials",
        "credentials": credentials_list,
    }


@router.delete("/credentials/{credential_id}")
async def delete_credential(
    credential_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(authenticate_user),
):
    try:
        credential_uuid = UUID(credential_id)
    except ValidationError:
        raise HTTPException(status_code=404, detail="Invalid credential Id")
    statement = select(Credentials).where(
        Credentials.id == credential_uuid, Credentials.user_id == current_user.id
    )
    credential = db.exec(statement).first()
    if not credential:
        raise HTTPException(status_code=400, detail="Credential not found")
    db.delete(credential)
    db.commit()
    return {
        "message": "Credential deleted Successfully",
        "credential_deleted": {"id": str(credential.id), "title": credential.title},
    }


@router.put("/credentials/{credential_id}")
async def update_credentials(
    credential_id: str,
    credentials: CredentialsSchema,
    db: Session = Depends(get_session),
    current_user: User = Depends(authenticate_user),
):
    try:
        credential_uuid = UUID(credential_id)
    except ValidationError:
        raise HTTPException(status_code=404, detail="Invalid credential id")
    statement = select(Credentials).where(
        Credentials.id == credential_uuid, Credentials.user_id == current_user.id
    )
    credential = db.exec(statement).first()
    if not credential:
        raise HTTPException(status_code=400, detail="Credential Not found")
    credential.title = credentials.title
    credential.platform = credentials.platform
    credential.data = credentials.data
    db.add(credential)
    db.commit()
    db.refresh(credential)

    return {
        "message": "Credentials updated successfuly",
        "updated_credentials": {
            "id": str(credential.id),
            "title": credential.title,
            "platform": credential.platform,
            "data": credential.data,
        },
    }
