from datetime import timedelta
from os import stat
from typing import Any, Dict, List

from controller.user import create_access_token, verify_token
from db.database import get_session
from db.models.models import User
from db.models.schemas import UserSchema
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBasicCredentials, HTTPBearer
from passlib.context import CryptContext
from sqlmodel import Session, select

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def authenticate_user(
    credentials: HTTPBasicCredentials = Depends(security),
    db: Session = Depends(get_session),
) -> User:
    token = credentials.credentials
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid Token")
    statement = select(User).where(User.email == email)
    user = db.exec(statement).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    return user


@router.post("/register")
async def user_signup(user: UserSchema, db: Session = Depends(get_session)):
    statement = select(User).where(User.email == user.email)
    existing_user = db.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = pwd_context.hash(user.password)
    new_user = User(email=user.email, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = create_access_token(data={"sub": new_user.email})
    return {
        "message": "User registration successful",
        "user": {"id": new_user.id, "email": new_user.email},
        "access_token": access_token,
    }


@router.post("/signin")
async def user_signin(user: UserSchema, db: Session = Depends(get_session)):
    statement = select(User).where(User.email == user.email)
    existing_user = db.exec(statement).first()
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid email")
    if not pwd_context.verify(user.password, existing_user.password):
        raise HTTPException(status_code=400, detail="Password does not match")
    access_token = create_access_token(data={"sub": existing_user.email})
    return {"access_token": access_token, "message": "Logged In Successfully"}
