from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.models import UserRole, AccessControlType


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None


class UserBase(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    last_login_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    total: int
    items: List[UserBase]


class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class TeamBase(BaseModel):
    id: int
    name: str
    description: Optional[str]
    owner_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TeamListResponse(BaseModel):
    total: int
    items: List[TeamBase]


class ModelTagCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ModelTagUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ModelTagBase(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ModelTagListResponse(BaseModel):
    total: int
    items: List[ModelTagBase]


class ModelProviderBase(BaseModel):
    id: int
    name: str
    is_active: bool

    class Config:
        from_attributes = True


class APITypeBase(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


class ModelCreate(BaseModel):
    name: str
    provider_name: str
    version: Optional[str] = None
    api_type_id: int
    request_url: str
    api_key: str
    organization_id: Optional[str] = None
    proxy_url: Optional[str] = None
    default_params: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    has_free_quota: bool = False
    remaining_quota: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    is_team_shared: bool = False
    team_id: Optional[int] = None


class ModelUpdate(BaseModel):
    name: Optional[str] = None
    provider_name: Optional[str] = None
    version: Optional[str] = None
    api_type_id: Optional[int] = None
    request_url: Optional[str] = None
    api_key: Optional[str] = None
    organization_id: Optional[str] = None
    proxy_url: Optional[str] = None
    default_params: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    has_free_quota: Optional[bool] = None
    remaining_quota: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    is_team_shared: Optional[bool] = None
    team_id: Optional[int] = None


class ModelTestRequest(BaseModel):
    message: str = "你好，请回复一条测试消息"


class ModelBase(BaseModel):
    id: int
    name: str
    provider_name: Optional[str] = None
    version: Optional[str]
    api_type_name: Optional[str] = None
    request_url: str
    description: Optional[str]
    is_enabled: bool
    has_free_quota: bool
    remaining_quota: Optional[int]
    request_count: int
    owner_id: int
    is_team_shared: bool
    team_id: Optional[int]
    tags: List[ModelTagBase] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ModelListResponse(BaseModel):
    total: int
    items: List[ModelBase]


class APIGatewayCreate(BaseModel):
    name: str
    path: str
    method: str = "POST"
    description: Optional[str] = None


class APIGatewayUpdate(BaseModel):
    name: Optional[str] = None
    path: Optional[str] = None
    method: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None


class APIGatewayBase(BaseModel):
    id: int
    name: str
    path: str
    method: str
    description: Optional[str]
    is_enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True


class APIGatewayListResponse(BaseModel):
    total: int
    items: List[APIGatewayBase]


class APIRequestLogBase(BaseModel):
    id: int
    user_id: Optional[int]
    model_id: Optional[int]
    model_name: Optional[str] = None
    request_path: str
    request_method: str
    source_ip: Optional[str]
    status_code: Optional[int]
    response_time: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class APIRequestLogListResponse(BaseModel):
    total: int
    items: List[APIRequestLogBase]


class AccessControlCreate(BaseModel):
    type: AccessControlType
    ip_address: str
    description: Optional[str] = None


class AccessControlUpdate(BaseModel):
    description: Optional[str] = None


class AccessControlBase(BaseModel):
    id: int
    type: AccessControlType
    ip_address: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AccessControlListResponse(BaseModel):
    total: int
    items: List[AccessControlBase]


class GatewayRequest(BaseModel):
    model_id: Optional[int] = None
    auto_route: bool = True
    messages: Optional[List[Dict[str, Any]]] = None
    prompt: Optional[str] = None
    stream: bool = False
    parameters: Optional[Dict[str, Any]] = None


class SystemSettingUpdate(BaseModel):
    setting_value: str


class SystemSettingBase(BaseModel):
    id: int
    setting_key: str
    setting_value: str
    description: Optional[str]

    class Config:
        from_attributes = True


class ChangePassword(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)
