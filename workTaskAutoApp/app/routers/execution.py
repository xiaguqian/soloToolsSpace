from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db, Task, TaskStep, Schedule, ScheduleStatus
from app.schemas import ResponseModel
from app.executors import TaskExecutor
from app.celery_app import execute_schedule_task, execute_task_task

router = APIRouter(prefix='/api/execution', tags=['execution'])

@router.get('/mouse-position', response_model=ResponseModel)
def get_mouse_position():
    executor = TaskExecutor()
    pos = executor.get_mouse_position()
    return ResponseModel(data=pos)

@router.get('/screen-size', response_model=ResponseModel)
def get_screen_size():
    executor = TaskExecutor()
    size = executor.get_screen_size()
    return ResponseModel(data=size)

@router.post('/task/{task_id}/run', response_model=ResponseModel)
def run_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail='任务不存在')
    
    result = execute_task_task.delay(task_id)
    return ResponseModel(message=f'任务已提交执行', data={'task_id': task_id, 'celery_task_id': str(result.id)})

@router.post('/task/{task_id}/run-now', response_model=ResponseModel)
def run_task_now(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail='任务不存在')
    
    executor = TaskExecutor()
    try:
        result = executor.execute_task(task_id)
        return ResponseModel(message='任务执行完成', data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'任务执行失败: {str(e)}')

@router.post('/schedule/{schedule_id}/run', response_model=ResponseModel)
def run_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail='日程不存在')
    
    result = execute_schedule_task.delay(schedule_id)
    return ResponseModel(message=f'日程已提交执行', data={'schedule_id': schedule_id, 'celery_task_id': str(result.id)})

@router.post('/schedule/{schedule_id}/run-now', response_model=ResponseModel)
def run_schedule_now(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail='日程不存在')
    
    executor = TaskExecutor()
    try:
        result = executor.execute_schedule(schedule_id)
        return ResponseModel(message='日程执行完成', data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'日程执行失败: {str(e)}')

@router.post('/today/run-now', response_model=ResponseModel)
def run_today_schedule_now(db: Session = Depends(get_db)):
    schedule = db.query(Schedule).filter(
        Schedule.status == ScheduleStatus.ACTIVE
    ).first()
    
    if not schedule:
        return ResponseModel(success=False, message='今日无可用日程')
    
    executor = TaskExecutor()
    try:
        result = executor.execute_schedule(schedule.id)
        return ResponseModel(message='今日日程执行完成', data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'日程执行失败: {str(e)}')
