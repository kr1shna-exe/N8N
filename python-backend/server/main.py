from contextlib import asynccontextmanager

from db.database import create_tables
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.credentials import router as credentials_router
from routes.user import router as user_router

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

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
