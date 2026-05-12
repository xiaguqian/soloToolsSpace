from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.models import User
from app.schemas.schemas import (
    ModelTagCreate, ModelTagUpdate, ModelTagBase, ModelTagListResponse
)
from app.crud.crud_tag import (
    get_tag_by_id, get_tag_by_name, create_tag, update_tag, get_tags, delete_tag
)

router = APIRouter()


@router.get("", response_model=ModelTagListResponse)
def list_tags(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    total, tags = get_tags(db, skip=skip, limit=limit, is_active=is_active)
    items = [{**t.__dict__, "is_active": t.is_active == 1} for t in tags]
    return {"total": total, "items": items}


@router.post("", response_model=ModelTagBase, status_code=201)
def create_new_tag(
    tag_in: ModelTagCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if get_tag_by_name(db, tag_in.name):
        raise HTTPException(status_code=400, detail="标签名称已存在")
    tag = create_tag(db, tag_in)
    return {**tag.__dict__, "is_active": tag.is_active == 1}


@router.put("/{tag_id}", response_model=ModelTagBase)
def update_existing_tag(
    tag_id: int,
    tag_in: ModelTagUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    tag = get_tag_by_id(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="标签不存在")
    
    if tag_in.name and tag_in.name != tag.name:
        if get_tag_by_name(db, tag_in.name):
            raise HTTPException(status_code=400, detail="标签名称已存在")
    
    tag = update_tag(db, tag, tag_in)
    return {**tag.__dict__, "is_active": tag.is_active == 1}


@router.delete("/{tag_id}")
def delete_existing_tag(
    tag_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    tag = get_tag_by_id(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="标签不存在")
    delete_tag(db, tag)
    return {"message": "标签已删除"}


@router.post("/{tag_id}/toggle")
def toggle_tag(
    tag_id: int,
    enable: bool = Query(..., description="是否启用标签"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    tag = get_tag_by_id(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="标签不存在")
    
    tag.is_active = 1 if enable else 0
    db.add(tag)
    db.commit()
    return {"message": f"标签已{'启用' if enable else '停用'}", "enabled": enable}
