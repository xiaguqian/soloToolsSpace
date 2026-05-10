from datetime import datetime
import json
from app.database import (
    TaskType, StepType, TaskStatus,
    Task, TaskStep, Schedule, ScheduleTask, ExecutionLog,
    SessionLocal
)
from app.executors.desktop_executor import DesktopExecutor
from app.executors.browser_executor import BrowserExecutor
from app.config import Config
import redis

class TaskExecutor:
    def __init__(self):
        self.desktop_executor = DesktopExecutor()
        self.browser_executor = None
        self.redis_client = redis.Redis(
            host=Config.REDIS_HOST,
            port=Config.REDIS_PORT,
            db=Config.REDIS_DB,
            password=Config.REDIS_PASSWORD,
            decode_responses=True
        )
    
    def _publish_status(self, message):
        try:
            self.redis_client.publish(
                Config.TASK_STATUS_CHANNEL,
                json.dumps(message, ensure_ascii=False, default=str)
            )
        except Exception:
            pass
    
    def _create_log(self, db, schedule_id=None, task_id=None, step_id=None, 
                   status=TaskStatus.PENDING, message=''):
        log = ExecutionLog(
            schedule_id=schedule_id,
            task_id=task_id,
            step_id=step_id,
            status=status,
            message=message,
            started_at=datetime.now()
        )
        db.add(log)
        db.flush()
        return log
    
    def _update_log(self, db, log, status, message=''):
        log.status = status
        log.message = message
        log.completed_at = datetime.now()
        db.flush()
    
    def execute_schedule(self, schedule_id):
        db = SessionLocal()
        try:
            schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
            if not schedule:
                raise ValueError(f'日程不存在: {schedule_id}')
            
            self._publish_status({
                'type': 'schedule_start',
                'schedule_id': schedule_id,
                'schedule_name': schedule.name,
                'timestamp': datetime.now().isoformat()
            })
            
            schedule_tasks = db.query(ScheduleTask).filter(
                ScheduleTask.schedule_id == schedule_id
            ).order_by(ScheduleTask.task_order).all()
            
            for st in schedule_tasks:
                task = db.query(Task).filter(Task.id == st.task_id).first()
                if task and task.is_active:
                    try:
                        self.execute_task(task.id, schedule_id=schedule_id, db=db)
                    except Exception as e:
                        self._publish_status({
                            'type': 'task_error',
                            'schedule_id': schedule_id,
                            'task_id': task.id,
                            'task_name': task.name,
                            'error': str(e),
                            'timestamp': datetime.now().isoformat()
                        })
                        raise
            
            self._publish_status({
                'type': 'schedule_complete',
                'schedule_id': schedule_id,
                'schedule_name': schedule.name,
                'timestamp': datetime.now().isoformat()
            })
            
            return {'success': True, 'schedule_id': schedule_id}
            
        finally:
            if self.browser_executor:
                self.browser_executor.close()
                self.browser_executor = None
            db.close()
    
    def execute_task(self, task_id, schedule_id=None, db=None):
        need_close_db = False
        if db is None:
            db = SessionLocal()
            need_close_db = True
        
        try:
            task = db.query(Task).filter(Task.id == task_id).first()
            if not task:
                raise ValueError(f'任务不存在: {task_id}')
            
            self._publish_status({
                'type': 'task_start',
                'schedule_id': schedule_id,
                'task_id': task_id,
                'task_name': task.name,
                'task_type': task.task_type.value,
                'timestamp': datetime.now().isoformat()
            })
            
            task_log = self._create_log(
                db,
                schedule_id=schedule_id,
                task_id=task_id,
                status=TaskStatus.RUNNING,
                message=f'开始执行任务: {task.name}'
            )
            
            steps = db.query(TaskStep).filter(
                TaskStep.task_id == task_id
            ).order_by(TaskStep.step_order).all()
            
            try:
                for step in steps:
                    step_log = self._create_log(
                        db,
                        schedule_id=schedule_id,
                        task_id=task_id,
                        step_id=step.id,
                        status=TaskStatus.RUNNING,
                        message=f'执行步骤: {step.step_name or step.step_type.value}'
                    )
                    
                    try:
                        self._publish_status({
                            'type': 'step_start',
                            'schedule_id': schedule_id,
                            'task_id': task_id,
                            'step_id': step.id,
                            'step_name': step.step_name,
                            'step_type': step.step_type.value,
                            'timestamp': datetime.now().isoformat()
                        })
                        
                        result = self._execute_step(step, task.task_type)
                        
                        self._update_log(
                            db, step_log, 
                            TaskStatus.COMPLETED, 
                            message=f'步骤执行完成: {step.step_name or step.step_type.value}'
                        )
                        
                        self._publish_status({
                            'type': 'step_complete',
                            'schedule_id': schedule_id,
                            'task_id': task_id,
                            'step_id': step.id,
                            'step_name': step.step_name,
                            'step_type': step.step_type.value,
                            'result': result,
                            'timestamp': datetime.now().isoformat()
                        })
                        
                    except Exception as e:
                        self._update_log(
                            db, step_log, 
                            TaskStatus.FAILED, 
                            message=f'步骤执行失败: {str(e)}'
                        )
                        
                        self._publish_status({
                            'type': 'step_error',
                            'schedule_id': schedule_id,
                            'task_id': task_id,
                            'step_id': step.id,
                            'step_name': step.step_name,
                            'error': str(e),
                            'timestamp': datetime.now().isoformat()
                        })
                        raise
                
                self._update_log(
                    db, task_log, 
                    TaskStatus.COMPLETED, 
                    message=f'任务执行完成: {task.name}'
                )
                
                self._publish_status({
                    'type': 'task_complete',
                    'schedule_id': schedule_id,
                    'task_id': task_id,
                    'task_name': task.name,
                    'timestamp': datetime.now().isoformat()
                })
                
                return {'success': True, 'task_id': task_id}
                
            except Exception as e:
                self._update_log(
                    db, task_log, 
                    TaskStatus.FAILED, 
                    message=f'任务执行失败: {str(e)}'
                )
                raise
            
        finally:
            db.commit()
            if need_close_db:
                if self.browser_executor:
                    self.browser_executor.close()
                    self.browser_executor = None
                db.close()
    
    def _execute_step(self, step, task_type):
        if task_type == TaskType.DESKTOP:
            return self.desktop_executor.execute_step(step)
        elif task_type == TaskType.BROWSER:
            if self.browser_executor is None:
                self.browser_executor = BrowserExecutor()
            return self.browser_executor.execute_step(step)
        else:
            raise ValueError(f'不支持的任务类型: {task_type}')
    
    def get_mouse_position(self):
        return self.desktop_executor.get_mouse_position()
    
    def get_screen_size(self):
        return self.desktop_executor.get_screen_size()
    
    def take_screenshot(self, region=None):
        return self.desktop_executor.take_screenshot(region=region)
