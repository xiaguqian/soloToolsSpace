from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.schemas import ComponentResponse, ComponentUpdate
from app.services.component_service import component_service

router = APIRouter(prefix="/api/components", tags=["components"])

@router.get("/", response_model=List[ComponentResponse])
def get_components(db: Session = Depends(get_db)):
    return component_service.get_all_components(db)

@router.get("/{component_id}", response_model=ComponentResponse)
def get_component(component_id: int, db: Session = Depends(get_db)):
    component = component_service.get_component_by_id(db, component_id)
    if not component:
        raise HTTPException(status_code=404, detail="组件不存在")
    return component

@router.put("/{component_id}", response_model=ComponentResponse)
def update_component(
    component_id: int,
    update_data: ComponentUpdate,
    db: Session = Depends(get_db)
):
    component = component_service.update_component(db, component_id, update_data)
    if not component:
        raise HTTPException(status_code=404, detail="组件不存在")
    return component

@router.delete("/{component_id}")
def delete_component(component_id: int, db: Session = Depends(get_db)):
    success = component_service.delete_component(db, component_id)
    if not success:
        raise HTTPException(status_code=400, detail="删除失败，组件可能不存在或是预设组件")
    return {"message": "删除成功"}
