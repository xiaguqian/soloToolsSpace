from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_admin_user
from app.models.models import User, UserRole
from app.schemas.schemas import (
    UserBase, UserListResponse, UserUpdate, SystemSettingBase, SystemSettingUpdate
)
from app.crud.crud_user import (
    get_user_by_id, get_users, update_user, get_user_by_username, get_user_by_email
)
from app.crud.crud_gateway import get_system_setting, update_system_setting

router = APIRouter()


@router.get("/users", response_model=UserListResponse)
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[str] = Query(None),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    total, users = get_users(db, skip=skip, limit=limit, role=role)
    return {"total": total, "items": users}


@router.get("/users/{user_id}", response_model=UserBase)
def get_user(
    user_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user


@router.put("/users/{user_id}", response_model=UserBase)
def update_user_info(
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    update_data = user_in.model_dump(exclude_unset=True)
    
    if "email" in update_data:
        existing = get_user_by_email(db, update_data["email"])
        if existing and existing.id != user_id:
            raise HTTPException(status_code=400, detail="邮箱已被使用")
    
    return update_user(db, user, user_in)


@router.get("/settings/{key}", response_model=SystemSettingBase)
def get_setting(
    key: str,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    setting = get_system_setting(db, key)
    if not setting:
        raise HTTPException(status_code=404, detail="设置项不存在")
    return setting


@router.put("/settings/{key}", response_model=SystemSettingBase)
def update_setting(
    key: str,
    setting_in: SystemSettingUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return update_system_setting(db, key, setting_in.setting_value)


@router.post("/settings/system/toggle")
def toggle_system_access(
    enable: bool = Query(..., description="是否启用系统访问"),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    update_system_setting(db, "system_enabled", "1" if enable else "0")
    return {"message": f"系统访问已{'启用' if enable else '暂停'}", "enabled": enable}
