import os
from typing import Generator

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL,echo=True)

def create_tables():
    SQLModel.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yeild session
