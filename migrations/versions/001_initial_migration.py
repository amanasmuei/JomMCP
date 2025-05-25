"""Initial migration - create all tables

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('is_verified', sa.Boolean(), nullable=False),
        sa.Column('role', sa.Enum('ADMIN', 'USER', 'VIEWER', name='userrole'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Create api_registrations table
    op.create_table('api_registrations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('base_url', sa.String(length=2048), nullable=False),
        sa.Column('api_type', sa.Enum('REST', 'GRAPHQL', 'SOAP', 'GRPC', 'WEBSOCKET', name='apitype'), nullable=False),
        sa.Column('authentication_type', sa.Enum('NONE', 'API_KEY', 'BEARER_TOKEN', 'BASIC_AUTH', 'OAUTH2', 'CUSTOM', name='authenticationtype'), nullable=False),
        sa.Column('encrypted_credentials', sa.Text(), nullable=True),
        sa.Column('specification', sa.JSON(), nullable=True),
        sa.Column('configuration', sa.JSON(), nullable=True),
        sa.Column('health_check_url', sa.String(length=2048), nullable=True),
        sa.Column('health_check_interval_seconds', sa.Integer(), nullable=True),
        sa.Column('owner_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_api_registrations_id'), 'api_registrations', ['id'], unique=False)
    op.create_index(op.f('ix_api_registrations_name'), 'api_registrations', ['name'], unique=False)
    op.create_index(op.f('ix_api_registrations_owner_id'), 'api_registrations', ['owner_id'], unique=False)

    # Create mcp_servers table
    op.create_table('mcp_servers',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'GENERATING', 'BUILDING', 'READY', 'DEPLOYING', 'RUNNING', 'STOPPED', 'ERROR', 'FAILED', name='mcpserverstatus'), nullable=False),
        sa.Column('generated_code_path', sa.String(length=1024), nullable=True),
        sa.Column('docker_image_name', sa.String(length=512), nullable=True),
        sa.Column('docker_image_tag', sa.String(length=128), nullable=True),
        sa.Column('mcp_config', sa.JSON(), nullable=True),
        sa.Column('generation_logs', sa.Text(), nullable=True),
        sa.Column('build_logs', sa.Text(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('api_registration_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('owner_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['api_registration_id'], ['api_registrations.id'], ),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_mcp_servers_api_registration_id'), 'mcp_servers', ['api_registration_id'], unique=False)
    op.create_index(op.f('ix_mcp_servers_id'), 'mcp_servers', ['id'], unique=False)
    op.create_index(op.f('ix_mcp_servers_name'), 'mcp_servers', ['name'], unique=False)
    op.create_index(op.f('ix_mcp_servers_owner_id'), 'mcp_servers', ['owner_id'], unique=False)
    op.create_index(op.f('ix_mcp_servers_status'), 'mcp_servers', ['status'], unique=False)

    # Create deployments table
    op.create_table('deployments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'DEPLOYING', 'RUNNING', 'SCALING', 'UPDATING', 'STOPPING', 'STOPPED', 'FAILED', 'ERROR', name='deploymentstatus'), nullable=False),
        sa.Column('container_name', sa.String(length=255), nullable=True),
        sa.Column('container_id', sa.String(length=255), nullable=True),
        sa.Column('namespace', sa.String(length=255), nullable=True),
        sa.Column('deployment_name', sa.String(length=255), nullable=True),
        sa.Column('service_name', sa.String(length=255), nullable=True),
        sa.Column('cpu_limit', sa.String(length=50), nullable=True),
        sa.Column('memory_limit', sa.String(length=50), nullable=True),
        sa.Column('replicas', sa.Integer(), nullable=False),
        sa.Column('port', sa.Integer(), nullable=False),
        sa.Column('external_url', sa.String(length=2048), nullable=True),
        sa.Column('environment_variables', sa.JSON(), nullable=True),
        sa.Column('deployment_config', sa.JSON(), nullable=True),
        sa.Column('deployment_logs', sa.Text(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('health_check_path', sa.String(length=255), nullable=False),
        sa.Column('mcp_server_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('owner_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['mcp_server_id'], ['mcp_servers.id'], ),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_deployments_id'), 'deployments', ['id'], unique=False)
    op.create_index(op.f('ix_deployments_mcp_server_id'), 'deployments', ['mcp_server_id'], unique=False)
    op.create_index(op.f('ix_deployments_name'), 'deployments', ['name'], unique=False)
    op.create_index(op.f('ix_deployments_owner_id'), 'deployments', ['owner_id'], unique=False)
    op.create_index(op.f('ix_deployments_status'), 'deployments', ['status'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index(op.f('ix_deployments_status'), table_name='deployments')
    op.drop_index(op.f('ix_deployments_owner_id'), table_name='deployments')
    op.drop_index(op.f('ix_deployments_name'), table_name='deployments')
    op.drop_index(op.f('ix_deployments_mcp_server_id'), table_name='deployments')
    op.drop_index(op.f('ix_deployments_id'), table_name='deployments')
    op.drop_table('deployments')
    
    op.drop_index(op.f('ix_mcp_servers_status'), table_name='mcp_servers')
    op.drop_index(op.f('ix_mcp_servers_owner_id'), table_name='mcp_servers')
    op.drop_index(op.f('ix_mcp_servers_name'), table_name='mcp_servers')
    op.drop_index(op.f('ix_mcp_servers_id'), table_name='mcp_servers')
    op.drop_index(op.f('ix_mcp_servers_api_registration_id'), table_name='mcp_servers')
    op.drop_table('mcp_servers')
    
    op.drop_index(op.f('ix_api_registrations_owner_id'), table_name='api_registrations')
    op.drop_index(op.f('ix_api_registrations_name'), table_name='api_registrations')
    op.drop_index(op.f('ix_api_registrations_id'), table_name='api_registrations')
    op.drop_table('api_registrations')
    
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS deploymentstatus')
    op.execute('DROP TYPE IF EXISTS mcpserverstatus')
    op.execute('DROP TYPE IF EXISTS authenticationtype')
    op.execute('DROP TYPE IF EXISTS apitype')
    op.execute('DROP TYPE IF EXISTS userrole')
