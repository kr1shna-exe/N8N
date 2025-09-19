from typing import Any, Dict, Optional
from uuid import UUID

from db.models.models import Platform, TriggerType
from pydantic import BaseModel


class UserSchema(BaseModel):
    email: str
    password: str


class CredentialsSchema(BaseModel):
    title: str
    platform: Platform
    data: Dict[str, Any]

class ExecutionSchema(BaseModel):
    status: bool
    tasks_done: int
    total_tasks: Optional[int] = None
    result: Dict[str, Any]
    workflow_id: Optional[UUID] = None