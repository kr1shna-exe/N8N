import os
from typing import Generator

from alembic import command
from alembic.config import Config
from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)


def run_migrations():
    """Run Alembic migrations."""
    alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "alembic.ini"))
    command.upgrade(alembic_cfg, "head")


def create_tables():
    SQLModel.metadata.create_all(engine)
    # Run migrations to handle schema changes
    try:
        run_migrations()
    except Exception as e:
        print(f"Warning: Migration failed: {e}")


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

def get_db_session() -> Session:
    return Session(engine)