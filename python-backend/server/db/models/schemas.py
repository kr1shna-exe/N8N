from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel
from server.db.models.models import Platform, TriggerType


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
