from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import SpiderTask
from app.schemas.schemas import SpiderTaskCreate, SpiderTaskUpdate

class TaskService:
    @staticmethod
    def get_all_tasks(db: Session) -> List[SpiderTask]:
        return db.query(SpiderTask).order_by(SpiderTask.updated_at.desc()).all()
    
    @staticmethod
    def get_task_by_id(db: Session, task_id: int) -> Optional[SpiderTask]:
        return db.query(SpiderTask).filter(SpiderTask.id == task_id).first()
    
    @staticmethod
    def get_task_by_task_id(db: Session, task_id: str) -> Optional[SpiderTask]:
        return db.query(SpiderTask).filter(SpiderTask.task_id == task_id).first()
    
    @staticmethod
    def create_task(db: Session, task_data: SpiderTaskCreate) -> SpiderTask:
        task = SpiderTask(
            name=task_data.name,
            task_id=task_data.task_id,
            description=task_data.description,
            flow_data=task_data.flow_data,
            schedule_type=task_data.schedule_type,
            cron_expression=task_data.cron_expression,
            status="stopped"
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task
    
    @staticmethod
    def update_task(db: Session, task_id: int, update_data: SpiderTaskUpdate) -> Optional[SpiderTask]:
        task = db.query(SpiderTask).filter(SpiderTask.id == task_id).first()
        if not task:
            return None
        
        if update_data.name is not None:
            task.name = update_data.name
        if update_data.description is not None:
            task.description = update_data.description
        if update_data.flow_data is not None:
            task.flow_data = update_data.flow_data
        if update_data.schedule_type is not None:
            task.schedule_type = update_data.schedule_type
        if update_data.cron_expression is not None:
            task.cron_expression = update_data.cron_expression
        if update_data.status is not None:
            task.status = update_data.status
        
        db.commit()
        db.refresh(task)
        return task
    
    @staticmethod
    def delete_task(db: Session, task_id: int) -> bool:
        task = db.query(SpiderTask).filter(SpiderTask.id == task_id).first()
        if not task:
            return False
        
        db.delete(task)
        db.commit()
        return True
    
    @staticmethod
    def start_task(db: Session, task_id: int) -> Optional[SpiderTask]:
        task = db.query(SpiderTask).filter(SpiderTask.id == task_id).first()
        if not task:
            return None
        
        task.status = "running"
        db.commit()
        db.refresh(task)
        return task
    
    @staticmethod
    def stop_task(db: Session, task_id: int) -> Optional[SpiderTask]:
        task = db.query(SpiderTask).filter(SpiderTask.id == task_id).first()
        if not task:
            return None
        
        task.status = "stopped"
        db.commit()
        db.refresh(task)
        return task

task_service = TaskService()
