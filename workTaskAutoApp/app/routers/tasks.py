from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db, Task, TaskStep, StepType
from app.schemas import TaskCreate, TaskUpdate, Task as TaskSchema, ResponseModel

router = APIRouter(prefix='/api/tasks', tags=['tasks'])

@router.get('', response_model=ResponseModel)
def list_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).order_by(Task.created_at.desc()).all()
    task_list = []
    for task in tasks:
        step_count = db.query(TaskStep).filter(TaskStep.task_id == task.id).count()
        task_data = {
            'id': task.id,
            'name': task.name,
            'description': task.description,
            'task_type': task.task_type,
            'is_active': task.is_active,
            'created_at': task.created_at,
            'updated_at': task.updated_at,
            'step_count': step_count
        }
        task_list.append(task_data)
    return ResponseModel(data=task_list)

@router.get('/step-types', response_model=ResponseModel)
def get_step_types():
    return ResponseModel(data=[s.value for s in StepType])

@router.get('/{task_id}', response_model=ResponseModel)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail='任务不存在')
    return ResponseModel(data=TaskSchema.from_orm(task))

@router.post('', response_model=ResponseModel)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    task = Task(
        name=task_data.name,
        description=task_data.description,
        task_type=task_data.task_type
    )
    db.add(task)
    db.flush()
    
    if task_data.steps:
        for step_data in task_data.steps:
            step = TaskStep(
                task_id=task.id,
                step_order=step_data.step_order,
                step_type=step_data.step_type,
                step_name=step_data.step_name,
                parameters=step_data.parameters
            )
            db.add(step)
    
    db.commit()
    db.refresh(task)
    return ResponseModel(message='任务创建成功', data=TaskSchema.from_orm(task))

@router.put('/{task_id}', response_model=ResponseModel)
def update_task(task_id: int, task_data: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail='任务不存在')
    
    if task_data.name is not None:
        task.name = task_data.name
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.task_type is not None:
        task.task_type = task_data.task_type
    if task_data.is_active is not None:
        task.is_active = task_data.is_active
    
    if task_data.steps is not None:
        db.query(TaskStep).filter(TaskStep.task_id == task_id).delete()
        for step_data in task_data.steps:
            step = TaskStep(
                task_id=task.id,
                step_order=step_data.step_order,
                step_type=step_data.step_type,
                step_name=step_data.step_name,
                parameters=step_data.parameters
            )
            db.add(step)
    
    db.commit()
    db.refresh(task)
    return ResponseModel(message='任务更新成功', data=TaskSchema.from_orm(task))

@router.delete('/{task_id}', response_model=ResponseModel)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail='任务不存在')
    
    db.delete(task)
    db.commit()
    return ResponseModel(message='任务删除成功')
