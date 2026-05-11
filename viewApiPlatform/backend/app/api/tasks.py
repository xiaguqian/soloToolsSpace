from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.schemas import SpiderTaskResponse, SpiderTaskCreate, SpiderTaskUpdate, TestRequest, TestResponse
from app.services.task_service import task_service
from app.services.flow_executor import execute_test_flow, execute_spider_task
from app.scheduler.scheduler_manager import scheduler_manager

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("/", response_model=List[SpiderTaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return task_service.get_all_tasks(db)

@router.get("/{task_id}", response_model=SpiderTaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = task_service.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task

@router.post("/", response_model=SpiderTaskResponse)
def create_task(task_data: SpiderTaskCreate, db: Session = Depends(get_db)):
    existing = task_service.get_task_by_task_id(db, task_data.task_id)
    if existing:
        raise HTTPException(status_code=400, detail="任务ID已存在")
    return task_service.create_task(db, task_data)

@router.put("/{task_id}", response_model=SpiderTaskResponse)
def update_task(task_id: int, update_data: SpiderTaskUpdate, db: Session = Depends(get_db)):
    task = task_service.update_task(db, task_id, update_data)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = task_service.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    scheduler_manager.remove_job(f"task_{task_id}")
    
    success = task_service.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=500, detail="删除失败")
    
    return {"message": "删除成功"}

@router.post("/{task_id}/start")
def start_task(task_id: int, db: Session = Depends(get_db)):
    task = task_service.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task_service.start_task(db, task_id)
    
    if task.schedule_type == "scheduled" and task.cron_expression:
        scheduler_manager.add_cron_job(
            job_id=f"task_{task_id}",
            func=execute_spider_task,
            cron_expression=task.cron_expression,
            args=(db, task_id, task.flow_data)
        )
    
    return {"message": "任务已启动", "status": "running"}

@router.post("/{task_id}/stop")
def stop_task(task_id: int, db: Session = Depends(get_db)):
    task = task_service.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task_service.stop_task(db, task_id)
    
    scheduler_manager.remove_job(f"task_{task_id}")
    
    return {"message": "任务已停止", "status": "stopped"}

@router.post("/{task_id}/run-now")
def run_task_now(task_id: int, db: Session = Depends(get_db)):
    task = task_service.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    try:
        result = execute_spider_task(db, task_id, task.flow_data)
        return {
            "success": True,
            "message": "任务执行成功",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test", response_model=TestResponse)
def test_flow(test_request: TestRequest, db: Session = Depends(get_db)):
    try:
        result = execute_test_flow(
            db=db,
            flow_data=test_request.flow_data,
            initial_context=test_request.context
        )
        return TestResponse(
            success=True,
            message="测试执行成功",
            result=result
        )
    except Exception as e:
        return TestResponse(
            success=False,
            message="测试执行失败",
            error=str(e)
        )

@router.post("/execute/{task_id}")
def execute_task_external(task_id: str, db: Session = Depends(get_db)):
    task = task_service.get_task_by_task_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    try:
        result = execute_spider_task(db, task.id, task.flow_data)
        return {
            "success": True,
            "message": "执行成功",
            "task_id": task.task_id,
            "task_name": task.name,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
