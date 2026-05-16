from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Enum, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    team_admin = "team_admin"
    user = "user"


class AccessControlType(str, enum.Enum):
    whitelist = "whitelist"
    blacklist = "blacklist"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100))
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False, index=True)
    is_active = Column(Integer, default=1, nullable=False)
    last_login_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owned_teams = relationship("Team", back_populates="owner", foreign_keys="Team.owner_id")
    owned_models = relationship("Model", back_populates="owner", foreign_keys="Model.owner_id")
    request_logs = relationship("APIRequestLog", back_populates="user")


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    is_active = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owner = relationship("User", back_populates="owned_teams")
    shared_models = relationship("Model", back_populates="team")


class ModelTag(Base):
    __tablename__ = "model_tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    is_active = Column(Integer, default=1, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    models = relationship("ModelTagRelation", back_populates="tag")


class ModelProvider(Base):
    __tablename__ = "model_providers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    is_active = Column(Integer, default=1, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class APIType(Base):
    __tablename__ = "api_types"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    is_active = Column(Integer, default=1, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Model(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    provider_id = Column(Integer, ForeignKey("model_providers.id"), nullable=False, index=True)
    version = Column(String(100))
    api_type_id = Column(Integer, ForeignKey("api_types.id"), nullable=False)
    request_url = Column(String(500), nullable=False)
    api_key = Column(String(500), nullable=False)
    organization_id = Column(String(255))
    proxy_url = Column(String(500))
    default_params = Column(JSON)
    description = Column(Text)
    is_enabled = Column(Integer, default=0, nullable=False, index=True)
    has_free_quota = Column(Integer, default=0, nullable=False)
    remaining_quota = Column(Integer)
    request_count = Column(Integer, default=0, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    is_team_shared = Column(Integer, default=0, nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owner = relationship("User", back_populates="owned_models")
    team = relationship("Team", back_populates="shared_models")
    tags = relationship("ModelTagRelation", back_populates="model", cascade="all, delete-orphan")
    request_logs = relationship("APIRequestLog", back_populates="model")


class ModelTagRelation(Base):
    __tablename__ = "model_tag_relations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_id = Column(Integer, ForeignKey("models.id", ondelete="CASCADE"), nullable=False, index=True)
    tag_id = Column(Integer, ForeignKey("model_tags.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    model = relationship("Model", back_populates="tags")
    tag = relationship("ModelTag", back_populates="models")


class APIGateway(Base):
    __tablename__ = "api_gateway"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    path = Column(String(255), nullable=False, index=True)
    method = Column(String(20), default="POST", nullable=False)
    description = Column(Text)
    is_enabled = Column(Integer, default=1, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class APIRequestLog(Base):
    __tablename__ = "api_request_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), index=True)
    model_id = Column(Integer, ForeignKey("models.id", ondelete="SET NULL"), index=True)
    request_path = Column(String(500), nullable=False)
    request_method = Column(String(20), nullable=False)
    source_ip = Column(String(50), index=True)
    user_agent = Column(String(500))
    status_code = Column(Integer)
    response_time = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="request_logs")
    model = relationship("Model", back_populates="request_logs")


class AccessControl(Base):
    __tablename__ = "access_control"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(Enum(AccessControlType), nullable=False, index=True)
    ip_address = Column(String(50), nullable=False, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    setting_key = Column(String(100), unique=True, nullable=False, index=True)
    setting_value = Column(Text)
    description = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class ShortcutType(str, enum.Enum):
    official = "official"
    documentation = "documentation"
    api_reference = "api_reference"
    pricing = "pricing"
    status = "status"


class ModelShortcut(Base):
    __tablename__ = "model_shortcuts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_id = Column(Integer, ForeignKey("models.id", ondelete="CASCADE"), nullable=False, index=True)
    shortcut_type = Column(Enum(ShortcutType), nullable=False, index=True)
    url = Column(String(1000), nullable=False)
    name = Column(String(100))
    description = Column(Text)
    is_active = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    model = relationship("Model")
