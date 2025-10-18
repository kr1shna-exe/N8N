import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import create_tables
from server.routes.credentials import router as credentials_router
from server.routes.executions import router as execution_router
from server.routes.nodes import router as nodes_router
from server.routes.postmark_webhook import router as postmark_router
from server.routes.resume_workflow import router as resume_router
from server.routes.user import router as user_router
from server.routes.webhook import router as webhook_router
from server.routes.workflow import router as workflow_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)
app.include_router(user_router, prefix="/api/user", tags=["users"])
app.include_router(credentials_router, prefix="/api/user", tags=["credentials"])
app.include_router(workflow_router, prefix="/api", tags=["workflows"])
app.include_router(execution_router, prefix="/api", tags=["executions"])
app.include_router(nodes_router, prefix="/api", tags=["nodes"])
app.include_router(webhook_router, prefix="/api", tags=["webhook"])
app.include_router(postmark_router, prefix="/api/postmark", tags=["postmark"])
app.include_router(resume_router, prefix="/api", tags=["resume"])
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
