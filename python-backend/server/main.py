from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db.database import create_tables

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)


@app.on_event("startup")
def startup():
    create_tables()
