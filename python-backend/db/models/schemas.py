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


class WorkflowSchema(BaseModel):
    title: str
    enabled: bool
    nodes: Dict[str, Any]
    connections: Dict[str, Any]
    trigger_type: TriggerType
    webhook_id: Optional[UUID] = None
