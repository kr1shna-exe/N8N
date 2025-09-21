from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

from sqlmodel import JSON, Column, Field, Relationship, SQLModel


class Platform(str, Enum):
    TELEGRAM = "Telegram"
    RESEND_EMAIL = "ResendEmail"
    GEMINI = "Gemini"


class TriggerType(str, Enum):
    MANUAL = "Manual"
    WEBHOOK = "Webhook"


class ExecutionStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True)
    password: str
    credentials: List["Credentials"] = Relationship(back_populates="user")
    workflow: List["Workflow"] = Relationship(back_populates="user")


class Webhook(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    secret: Optional[str] = None

    workflow: Optional["Workflow"] = Relationship(back_populates="webhook")


class Credentials(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    platform: Platform
    data: Dict[str, Any] = Field(sa_column=Column(JSON))
    user_id: UUID = Field(foreign_key="user.id")

    user: User = Relationship(back_populates="credentials")


class Workflow(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    enabled: bool = Field(default=False)
    nodes: Dict[str, Any] = Field(sa_column=Column(JSON))
    connections: Dict[str, Any] = Field(sa_column=Column(JSON))
    trigger_type: TriggerType
    user_id: UUID = Field(foreign_key="user.id")
    webhook_id: Optional[UUID] = Field(foreign_key="webhook.id")

    user: User = Relationship(back_populates="workflow")
    webhook: Optional[Webhook] = Relationship(back_populates="workflow")
    nodes_list: List["Node"] = Relationship(back_populates="workflow")
    execution: List["Execution"] = Relationship(back_populates="workflow")


class Node(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    enabled: bool = Field(default=False)
    workflow_id: UUID = Field(foreign_key="workflow.id")

    workflow: Workflow = Relationship(back_populates="nodes_list")


class Execution(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    status: ExecutionStatus = Field(default=ExecutionStatus.RUNNING)
    tasks_done: int = Field(default=0)
    total_tasks: Optional[int] = None
    result: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    workflow_id: UUID = Field(foreign_key="workflow.id")

    workflow: Workflow = Relationship(back_populates="execution")
