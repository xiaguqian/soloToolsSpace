from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Component(Base):
    __tablename__ = "components"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    chinese_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="general")
    input_schema = Column(JSON, nullable=False)
    output_schema = Column(JSON, nullable=False)
    code = Column(Text, nullable=False)
    is_preset = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SpiderTask(Base):
    __tablename__ = "spider_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    task_id = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    flow_data = Column(JSON, nullable=False)
    status = Column(String(20), default="stopped")
    schedule_type = Column(String(20), default="manual")
    cron_expression = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TaskExecutionLog(Base):
    __tablename__ = "task_execution_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("spider_tasks.id"))
    execution_id = Column(String(50), unique=True, index=True, nullable=False)
    status = Column(String(20), default="running")
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    result = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
