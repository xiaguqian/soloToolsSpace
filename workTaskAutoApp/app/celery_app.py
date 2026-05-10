from celery import Celery
from celery.schedules import crontab
from app.config import Config
from app.database import (
    SessionLocal, Schedule, ScheduleTask, Task, 
    ScheduleStatus, ScheduleType
)
from datetime import datetime, date

celery_app = Celery(
    'task_auto_app',
    broker=Config.CELERY_BROKER_URL,
    backend=Config.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Shanghai',
    enable_utc=False,
)

def _should_execute_schedule(schedule, today):
    """检查日程是否应该在今天执行"""
    if schedule.status != ScheduleStatus.ACTIVE:
        return False
    
    if schedule.schedule_type == ScheduleType.DAILY:
        return True
    
    elif schedule.schedule_type == ScheduleType.WEEKLY:
        weekday = today.weekday()
        return schedule.schedule_date and schedule.schedule_date.weekday() == weekday
    
    elif schedule.schedule_type == ScheduleType.MONTHLY:
        day = today.day
        return schedule.schedule_date and schedule.schedule_date.day == day
    
    elif schedule.schedule_type == ScheduleType.QUARTERLY:
        day = today.day
        month = today.month
        return (schedule.schedule_date and 
                schedule.schedule_date.day == day and 
                (month - schedule.schedule_date.month) % 3 == 0)
    
    return False

@celery_app.task(name='execute_schedule')
def execute_schedule_task(schedule_id):
    from app.executors import TaskExecutor
    executor = TaskExecutor()
    return executor.execute_schedule(schedule_id)

@celery_app.task(name='execute_task')
def execute_task_task(task_id):
    from app.executors import TaskExecutor
    executor = TaskExecutor()
    return executor.execute_task(task_id)

@celery_app.task(name='check_and_execute_schedules')
def check_and_execute_schedules():
    db = SessionLocal()
    try:
        today = date.today()
        now = datetime.now()
        current_time = now.strftime('%H:%M')
        
        active_schedule = db.query(Schedule).filter(
            Schedule.status == ScheduleStatus.ACTIVE
        ).first()
        
        if not active_schedule:
            return {'message': '无激活的日程'}
        
        if not _should_execute_schedule(active_schedule, today):
            return {'message': f'今日不执行该日程: {active_schedule.name}'}
        
        schedule_time = active_schedule.schedule_time
        
        if schedule_time and current_time == schedule_time:
            execute_schedule_task.delay(active_schedule.id)
            return {'message': f'已触发日程: {active_schedule.name}', 'schedule_id': active_schedule.id}
        
        return {'message': f'时间未到: {current_time} != {schedule_time}'}
        
    finally:
        db.close()

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        60.0,
        check_and_execute_schedules.s(),
        name='每分钟检查日程'
    )
