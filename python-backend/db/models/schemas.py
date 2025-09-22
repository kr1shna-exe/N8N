from typing import Any, Dict, Optional
from uuid import UUID

from db.models.models import Platform, TriggerType
from pydantic import BaseModel


class UserSchema(BaseModel):
    email: str
    password: str


class Position(BaseModel):
    x: float
    y: float


class NodeData(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]
    position: Position
    className: Optional[str] = None
    style: Optional[Dict[str, Any]] = None
    measured: Optional[Dict[str, Any]] = None


class CredentialsSchema(BaseModel):
    title: str
    platform: Platform
    data: Dict[str, Any]


class WorkflowCreate(BaseModel):
    title: str
    nodes: Dict[str, NodeData]
    connections: Dict[str, Any]
    trigger_type: TriggerType


class ExecutionSchema(BaseModel):
    status: bool
    tasks_done: int
    total_tasks: Optional[int] = None
    result: Dict[str, Any]
    workflow_id: Optional[UUID] = None

