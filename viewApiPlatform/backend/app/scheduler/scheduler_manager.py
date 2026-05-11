from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from typing import Dict, Callable, Any
from datetime import datetime

class SchedulerManager:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self._jobs = {}
        self._is_running = False
    
    def start(self):
        if not self._is_running:
            self.scheduler.start()
            self._is_running = True
    
    def shutdown(self):
        if self._is_running:
            self.scheduler.shutdown()
            self._is_running = False
    
    def add_cron_job(self, job_id: str, func: Callable, cron_expression: str, args: tuple = None, kwargs: dict = None) -> bool:
        try:
            trigger = CronTrigger.from_crontab(cron_expression)
            
            job = self.scheduler.add_job(
                func,
                trigger=trigger,
                id=job_id,
                args=args,
                kwargs=kwargs,
                replace_existing=True
            )
            
            self._jobs[job_id] = {
                "job": job,
                "func": func.__name__,
                "cron_expression": cron_expression,
                "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None
            }
            
            return True
        except Exception as e:
            print(f"添加定时任务失败: {e}")
            return False
    
    def remove_job(self, job_id: str) -> bool:
        try:
            self.scheduler.remove_job(job_id)
            if job_id in self._jobs:
                del self._jobs[job_id]
            return True
        except Exception:
            return False
    
    def pause_job(self, job_id: str) -> bool:
        try:
            self.scheduler.pause_job(job_id)
            return True
        except Exception:
            return False
    
    def resume_job(self, job_id: str) -> bool:
        try:
            self.scheduler.resume_job(job_id)
            return True
        except Exception:
            return False
    
    def get_jobs(self) -> Dict[str, Any]:
        jobs_info = {}
        for job in self.scheduler.get_jobs():
            jobs_info[job.id] = {
                "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger)
            }
        return jobs_info

scheduler_manager = SchedulerManager()
