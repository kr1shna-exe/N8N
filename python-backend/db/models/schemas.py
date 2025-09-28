from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel

from db.models.models import Platform, TriggerType


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


class PostmarkHeader(BaseModel):
    Name: str
    Value: str


class PostmarkAttachment(BaseModel):
    Name: str
    Content: str
    ContentType: str
    ContentLength: int
    ContentID: str


class PostmarkInbound(BaseModel):
    FromName: str
    MessageStream: str
    From: str
    To: str
    Cc: Optional[str] = None
    Bcc: Optional[str] = None
    OriginalRecipient: str
    Subject: str
    MessageID: str
    ReplyTo: Optional[str] = None
    MailboxHash: str
    Date: str
    HtmlBody: Optional[str] = None
    TextBody: Optional[str] = None
    StrippedTextReply: Optional[str] = None
    Tag: Optional[str] = None
    Headers: List[PostmarkHeader]
    Attachments: List[PostmarkAttachment]
