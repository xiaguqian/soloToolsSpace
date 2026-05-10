from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from app.database import TaskType, ScheduleType, TaskStatus, ScheduleStatus, StepType

class TaskStepBase(BaseModel):
    step_order: int
    step_type: StepType
    step_name: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class TaskStepCreate(TaskStepBase):
    pass

class TaskStepUpdate(TaskStepBase):
    id: Optional[int] = None

class TaskStep(TaskStepBase):
    id: int
    task_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    task_type: TaskType

class TaskCreate(TaskBase):
    steps: Optional[List[TaskStepCreate]] = None

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[TaskType] = None
    is_active: Optional[bool] = None
    steps: Optional[List[TaskStepUpdate]] = None

class Task(TaskBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    steps: List[TaskStep] = []

    class Config:
        from_attributes = True

class TaskList(TaskBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    step_count: int

    class Config:
        from_attributes = True

class ScheduleTaskBase(BaseModel):
    task_id: int
    task_order: int

class ScheduleTaskCreate(ScheduleTaskBase):
    pass

class ScheduleTask(ScheduleTaskBase):
    id: int
    schedule_id: int
    task: Optional[Task] = None

    class Config:
        from_attributes = True

class ScheduleBase(BaseModel):
    name: str
    description: Optional[str] = None
    schedule_type: ScheduleType
    schedule_time: str
    schedule_date: Optional[datetime] = None

class ScheduleCreate(ScheduleBase):
    tasks: Optional[List[ScheduleTaskCreate]] = None

class ScheduleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    schedule_type: Optional[ScheduleType] = None
    schedule_time: Optional[str] = None
    schedule_date: Optional[datetime] = None
    status: Optional[ScheduleStatus] = None
    tasks: Optional[List[ScheduleTaskCreate]] = None

class Schedule(ScheduleBase):
    id: int
    status: ScheduleStatus
    created_at: datetime
    updated_at: datetime
    schedule_tasks: List[ScheduleTask] = []

    class Config:
        from_attributes = True

class ExecutionLogBase(BaseModel):
    status: TaskStatus = TaskStatus.PENDING
    message: Optional[str] = None

class ExecutionLogCreate(ExecutionLogBase):
    schedule_id: Optional[int] = None
    task_id: Optional[int] = None
    step_id: Optional[int] = None

class ExecutionLog(ExecutionLogBase):
    id: int
    schedule_id: Optional[int] = None
    task_id: Optional[int] = None
    step_id: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ResponseModel(BaseModel):
    success: bool = True
    message: str = "操作成功"
    data: Optional[Any] = None
