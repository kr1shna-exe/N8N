"""Update
Revision ID: 94943e2fd798
Revises: aaef2e30a7f6
Create Date: 2025-09-27 10:29:43.756862

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision: str = '94943e2fd798'
down_revision: Union[str, Sequence[str], None] = 'aaef2e30a7f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add GROQ to the platform enum
    op.execute("ALTER TYPE platform ADD VALUE 'GROQ'")


def downgrade() -> None:
    """Downgrade schema."""
    # Note: PostgreSQL doesn't support removing enum values directly
    # This would require recreating the enum type with the old values
    pass
