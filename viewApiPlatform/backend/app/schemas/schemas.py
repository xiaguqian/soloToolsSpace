from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class ComponentBase(BaseModel):
    name: str
    chinese_name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = "general"
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]

class ComponentCreate(ComponentBase):
    code: str
    is_preset: Optional[bool] = False

class ComponentUpdate(BaseModel):
    chinese_name: Optional[str] = None
    description: Optional[str] = None

class ComponentResponse(ComponentBase):
    id: int
    is_preset: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SpiderTaskBase(BaseModel):
    name: str
    task_id: str
    description: Optional[str] = None
    flow_data: Dict[str, Any]
    schedule_type: Optional[str] = "manual"
    cron_expression: Optional[str] = None

class SpiderTaskCreate(SpiderTaskBase):
    pass

class SpiderTaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    flow_data: Optional[Dict[str, Any]] = None
    schedule_type: Optional[str] = None
    cron_expression: Optional[str] = None
    status: Optional[str] = None

class SpiderTaskResponse(SpiderTaskBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskExecution(BaseModel):
    task_id: int
    execution_id: str
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

class TestRequest(BaseModel):
    flow_data: Dict[str, Any]
    context: Optional[Dict[str, Any]] = {}

class TestResponse(BaseModel):
    success: bool
    message: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
