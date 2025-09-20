from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import Optional
from db.database import get_session
from db.models.models import Execution

router = APIRouter()

@router.get("/executions")
async def get_executions(db: Session = Depends(get_session), workflow_id: Optional[str] = None):
    try:
        if workflow_id:
            statement = select(Execution).where(Execution.workflow_id == workflow_id)
        else:
            statement = select(Execution)
        executions = db.exec(statement).all()
        return {
                "executions": [
                    {
                        "id": str(execution.id),
                        "workflow_id": execution.workflow_id,
                        "status": execution.status,
                        "tasks_done": execution.tasks_done,
                        "total_tasks": execution.total_tasks,
                        "result": execution.result
                    }
                    for execution in executions
                ],
                "total": len(executions)
            }
    except Exception as exe:
        print(f"Error while getting executions: {exe}")
