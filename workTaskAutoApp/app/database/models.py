from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class TaskType(str, enum.Enum):
    DESKTOP = 'desktop'
    BROWSER = 'browser'

class ScheduleType(str, enum.Enum):
    DAILY = 'daily'
    WEEKLY = 'weekly'
    MONTHLY = 'monthly'
    QUARTERLY = 'quarterly'

class TaskStatus(str, enum.Enum):
    PENDING = 'pending'
    RUNNING = 'running'
    COMPLETED = 'completed'
    FAILED = 'failed'

class ScheduleStatus(str, enum.Enum):
    ACTIVE = 'active'
    INACTIVE = 'inactive'
    CANCELLED = 'cancelled'

class StepType(str, enum.Enum):
    MOUSE_CLICK = 'mouse_click'
    MOUSE_DOUBLE_CLICK = 'mouse_double_click'
    MOUSE_MOVE = 'mouse_move'
    MOUSE_SCROLL = 'mouse_scroll'
    KEY_PRESS = 'key_press'
    KEY_RELEASE = 'key_release'
    KEY_TYPE = 'key_type'
    HOTKEY = 'hotkey'
    IMAGE_RECOGNIZE = 'image_recognize'
    OCR_RECOGNIZE = 'ocr_recognize'
    SLEEP = 'sleep'
    
    BROWSER_OPEN = 'browser_open'
    BROWSER_CLOSE = 'browser_close'
    BROWSER_GOTO = 'browser_goto'
    BROWSER_FIND_ELEMENT = 'browser_find_element'
    BROWSER_CLICK = 'browser_click'
    BROWSER_INPUT = 'browser_input'
    BROWSER_GET_TEXT = 'browser_get_text'
    BROWSER_SWITCH_WINDOW = 'browser_switch_window'
    BROWSER_SWITCH_FRAME = 'browser_switch_frame'
    BROWSER_EXECUTE_JS = 'browser_execute_js'
    BROWSER_SCREENSHOT = 'browser_screenshot'

class Task(Base):
    __tablename__ = 'tasks'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    task_type = Column(Enum(TaskType), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    is_active = Column(Boolean, default=True)
    
    steps = relationship('TaskStep', back_populates='task', cascade='all, delete-orphan')
    schedule_tasks = relationship('ScheduleTask', back_populates='task')

class TaskStep(Base):
    __tablename__ = 'task_steps'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey('tasks.id'), nullable=False)
    step_order = Column(Integer, nullable=False)
    step_type = Column(Enum(StepType), nullable=False)
    step_name = Column(String(100))
    parameters = Column(JSON)
    created_at = Column(DateTime, default=datetime.now)
    
    task = relationship('Task', back_populates='steps')

class Schedule(Base):
    __tablename__ = 'schedules'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    schedule_type = Column(Enum(ScheduleType), nullable=False)
    schedule_time = Column(String(50), nullable=False)
    schedule_date = Column(DateTime)
    status = Column(Enum(ScheduleStatus), default=ScheduleStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    schedule_tasks = relationship('ScheduleTask', back_populates='schedule', cascade='all, delete-orphan')
    execution_logs = relationship('ExecutionLog', back_populates='schedule')

class ScheduleTask(Base):
    __tablename__ = 'schedule_tasks'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    schedule_id = Column(Integer, ForeignKey('schedules.id'), nullable=False)
    task_id = Column(Integer, ForeignKey('tasks.id'), nullable=False)
    task_order = Column(Integer, nullable=False)
    
    schedule = relationship('Schedule', back_populates='schedule_tasks')
    task = relationship('Task', back_populates='schedule_tasks')

class ExecutionLog(Base):
    __tablename__ = 'execution_logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    schedule_id = Column(Integer, ForeignKey('schedules.id'))
    task_id = Column(Integer)
    step_id = Column(Integer)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    message = Column(Text)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    schedule = relationship('Schedule', back_populates='execution_logs')
