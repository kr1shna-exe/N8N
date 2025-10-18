"""Add created_at to execution

Revision ID: 1a2b3c4d5e6f
Revises: 94943e2fd798
Create Date: 2025-10-18 08:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1a2b3c4d5e6f'
down_revision: Union[str, Sequence[str], None] = '94943e2fd798'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add created_at column to execution table."""
    op.add_column('execution',
        sa.Column('created_at', sa.DateTime(), nullable=False,
                  server_default=sa.text('NOW()'))
    )


def downgrade() -> None:
    """Remove created_at column from execution table."""
    op.drop_column('execution', 'created_at')
