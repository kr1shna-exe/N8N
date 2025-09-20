import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import create_tables
from server.routes.credentials import router as credentials_router
from server.routes.executions import router as execution_router
from server.routes.user import router as user_router
from server.routes.workflow import execute_workflow
from server.routes.workflow import router as workflow_router

app = FastAPI()


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)
app.include_router(user_router, prefix="/api/user", tags=["users"])
app.include_router(credentials_router, prefix="/api/user", tags=["credentials"])
app.include_router(workflow_router, prefix="/api", tags=["workflows"])
app.include_router(execution_router, prefix="/api", tags=["executions"])
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
