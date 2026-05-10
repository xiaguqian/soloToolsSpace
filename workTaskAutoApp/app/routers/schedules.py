from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from typing import List
from app.database import (
    get_db, Schedule, ScheduleTask, Task, TaskType, 
    ScheduleStatus, ScheduleType, ExecutionLog, TaskStatus
)
from app.schemas import ScheduleCreate, ScheduleUpdate, ResponseModel

router = APIRouter(prefix='/api/schedules', tags=['schedules'])

def deactivate_other_schedules(db: Session, exclude_schedule_id: int = None):
    """将除指定日程外的所有日程设为作废"""
    query = db.query(Schedule).filter(Schedule.status == ScheduleStatus.ACTIVE)
    if exclude_schedule_id:
        query = query.filter(Schedule.id != exclude_schedule_id)
    schedules = query.all()
    for schedule in schedules:
        schedule.status = ScheduleStatus.CANCELLED
    db.flush()

@router.get('', response_model=ResponseModel)
def list_schedules(db: Session = Depends(get_db)):
    schedules = db.query(Schedule).order_by(Schedule.created_at.desc()).all()
    result = []
    for schedule in schedules:
        task_count = db.query(ScheduleTask).filter(ScheduleTask.schedule_id == schedule.id).count()
        schedule_data = {
            'id': schedule.id,
            'name': schedule.name,
            'description': schedule.description,
            'schedule_type': schedule.schedule_type.value,
            'schedule_time': schedule.schedule_time,
            'schedule_date': schedule.schedule_date.isoformat() if schedule.schedule_date else None,
            'status': schedule.status.value,
            'created_at': schedule.created_at.isoformat(),
            'updated_at': schedule.updated_at.isoformat(),
            'task_count': task_count
        }
        result.append(schedule_data)
    return ResponseModel(data=result)

@router.get('/today', response_model=ResponseModel)
def get_today_schedule(db: Session = Depends(get_db)):
    today = date.today()
    
    active_schedule = db.query(Schedule).filter(
        Schedule.status == ScheduleStatus.ACTIVE
    ).first()
    
    if not active_schedule:
        return ResponseModel(data=None, message='今日无可用日程')
    
    today_logs = db.query(ExecutionLog).filter(
        ExecutionLog.schedule_id == active_schedule.id,
        func.date(ExecutionLog.started_at) == today
    ).all()
    
    schedule_data = {
        'id': active_schedule.id,
        'name': active_schedule.name,
        'description': active_schedule.description,
        'schedule_type': active_schedule.schedule_type.value,
        'schedule_time': active_schedule.schedule_time,
        'status': active_schedule.status.value,
        'tasks': [],
        'today_executions': len(today_logs)
    }
    
    schedule_tasks = db.query(ScheduleTask).filter(
        ScheduleTask.schedule_id == active_schedule.id
    ).order_by(ScheduleTask.task_order).all()
    
    for st in schedule_tasks:
        task = db.query(Task).filter(Task.id == st.task_id).first()
        if task:
            schedule_data['tasks'].append({
                'id': task.id,
                'name': task.name,
                'task_type': task.task_type.value,
                'order': st.task_order
            })
    
    return ResponseModel(data=schedule_data)

@router.get('/{schedule_id}', response_model=ResponseModel)
def get_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail='日程不存在')
    
    schedule_data = {
        'id': schedule.id,
        'name': schedule.name,
        'description': schedule.description,
        'schedule_type': schedule.schedule_type.value,
        'schedule_time': schedule.schedule_time,
        'schedule_date': schedule.schedule_date.isoformat() if schedule.schedule_date else None,
        'status': schedule.status.value,
        'created_at': schedule.created_at.isoformat(),
        'updated_at': schedule.updated_at.isoformat(),
        'tasks': []
    }
    
    schedule_tasks = db.query(ScheduleTask).filter(
        ScheduleTask.schedule_id == schedule.id
    ).order_by(ScheduleTask.task_order).all()
    
    for st in schedule_tasks:
        task = db.query(Task).filter(Task.id == st.task_id).first()
        if task:
            schedule_data['tasks'].append({
                'id': task.id,
                'name': task.name,
                'task_type': task.task_type.value,
                'order': st.task_order
            })
    
    return ResponseModel(data=schedule_data)

@router.post('', response_model=ResponseModel)
def create_schedule(schedule_data: ScheduleCreate, db: Session = Depends(get_db)):
    deactivate_other_schedules(db)
    
    schedule = Schedule(
        name=schedule_data.name,
        description=schedule_data.description,
        schedule_type=schedule_data.schedule_type,
        schedule_time=schedule_data.schedule_time,
        schedule_date=schedule_data.schedule_date,
        status=ScheduleStatus.ACTIVE
    )
    db.add(schedule)
    db.flush()
    
    if schedule_data.tasks:
        for task_data in schedule_data.tasks:
            task = db.query(Task).filter(Task.id == task_data.task_id).first()
            if not task:
                raise HTTPException(status_code=404, detail=f'任务ID {task_data.task_id} 不存在')
            
            st = ScheduleTask(
                schedule_id=schedule.id,
                task_id=task_data.task_id,
                task_order=task_data.task_order
            )
            db.add(st)
    
    db.commit()
    db.refresh(schedule)
    return ResponseModel(message='日程创建成功，其余日程已作废', data=schedule.id)

@router.put('/{schedule_id}', response_model=ResponseModel)
def update_schedule(schedule_id: int, schedule_data: ScheduleUpdate, db: Session = Depends(get_db)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail='日程不存在')
    
    if schedule_data.name is not None:
        schedule.name = schedule_data.name
    if schedule_data.description is not None:
        schedule.description = schedule_data.description
    if schedule_data.schedule_type is not None:
        schedule.schedule_type = schedule_data.schedule_type
    if schedule_data.schedule_time is not None:
        schedule.schedule_time = schedule_data.schedule_time
    if schedule_data.schedule_date is not None:
        schedule.schedule_date = schedule_data.schedule_date
    if schedule_data.status is not None:
        if schedule_data.status == ScheduleStatus.ACTIVE:
            deactivate_other_schedules(db, exclude_schedule_id=schedule_id)
        schedule.status = schedule_data.status
    
    if schedule_data.tasks is not None:
        db.query(ScheduleTask).filter(ScheduleTask.schedule_id == schedule_id).delete()
        for task_data in schedule_data.tasks:
            task = db.query(Task).filter(Task.id == task_data.task_id).first()
            if not task:
                raise HTTPException(status_code=404, detail=f'任务ID {task_data.task_id} 不存在')
            
            st = ScheduleTask(
                schedule_id=schedule.id,
                task_id=task_data.task_id,
                task_order=task_data.task_order
            )
            db.add(st)
    
    db.commit()
    db.refresh(schedule)
    return ResponseModel(message='日程更新成功', data=schedule.id)

@router.delete('/{schedule_id}', response_model=ResponseModel)
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail='日程不存在')
    
    db.delete(schedule)
    db.commit()
    return ResponseModel(message='日程删除成功')

@router.post('/{schedule_id}/activate', response_model=ResponseModel)
def activate_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail='日程不存在')
    
    deactivate_other_schedules(db, exclude_schedule_id=schedule_id)
    schedule.status = ScheduleStatus.ACTIVE
    
    db.commit()
    return ResponseModel(message='日程已激活，其余日程已作废')

@router.get('/{schedule_id}/logs', response_model=ResponseModel)
def get_schedule_logs(schedule_id: int, db: Session = Depends(get_db)):
    logs = db.query(ExecutionLog).filter(
        ExecutionLog.schedule_id == schedule_id
    ).order_by(ExecutionLog.started_at.desc()).limit(100).all()
    
    log_list = []
    for log in logs:
        log_list.append({
            'id': log.id,
            'task_id': log.task_id,
            'step_id': log.step_id,
            'status': log.status.value,
            'message': log.message,
            'started_at': log.started_at.isoformat() if log.started_at else None,
            'completed_at': log.completed_at.isoformat() if log.completed_at else None
        })
    
    return ResponseModel(data=log_list)
