from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_admin_user
from app.models.models import User, AccessControlType
from app.schemas.schemas import (
    AccessControlCreate, AccessControlUpdate, AccessControlBase, AccessControlListResponse
)
from app.crud.crud_access import (
    get_access_by_id, get_access_by_ip, create_access, get_access_list, delete_access
)

router = APIRouter()


@router.get("", response_model=AccessControlListResponse)
def list_access(
    type: Optional[AccessControlType] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    total, items = get_access_list(db, type=type, skip=skip, limit=limit)
    return {"total": total, "items": items}


@router.post("", response_model=AccessControlBase, status_code=201)
def create_access_rule(
    access_in: AccessControlCreate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    if get_access_by_ip(db, access_in.ip_address, access_in.type):
        raise HTTPException(status_code=400, detail="该IP已在名单中")
    
    return create_access(db, access_in)


@router.put("/{access_id}", response_model=AccessControlBase)
def update_access_rule(
    access_id: int,
    access_in: AccessControlUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    access = get_access_by_id(db, access_id)
    if not access:
        raise HTTPException(status_code=404, detail="规则不存在")
    
    if access_in.description:
        access.description = access_in.description
        db.add(access)
        db.commit()
        db.refresh(access)
    
    return access


@router.delete("/{access_id}")
def delete_access_rule(
    access_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    access = get_access_by_id(db, access_id)
    if not access:
        raise HTTPException(status_code=404, detail="规则不存在")
    
    delete_access(db, access)
    return {"message": "规则已删除"}
