from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User
from app.schemas.schemas import (
    ModelShortcutCreate,
    ModelShortcutUpdate,
    ModelShortcutBase,
    ModelShortcutListResponse
)
from app.crud.crud_shortcut import (
    get_shortcut,
    get_shortcuts,
    get_shortcuts_by_model,
    get_shortcuts_count,
    create_shortcut,
    update_shortcut,
    delete_shortcut
)

router = APIRouter()


@router.get("/", response_model=ModelShortcutListResponse)
def read_shortcuts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = get_shortcuts_count(db)
    shortcuts = get_shortcuts(db, skip=skip, limit=limit)
    return {"total": total, "items": shortcuts}


@router.get("/model/{model_id}", response_model=List[ModelShortcutBase])
def read_shortcuts_by_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shortcuts = get_shortcuts_by_model(db, model_id=model_id)
    return shortcuts


@router.get("/{shortcut_id}", response_model=ModelShortcutBase)
def read_shortcut(
    shortcut_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shortcut = get_shortcut(db, shortcut_id=shortcut_id)
    if shortcut is None:
        raise HTTPException(status_code=404, detail="快捷入口不存在")
    return shortcut


@router.post("/", response_model=ModelShortcutBase, status_code=status.HTTP_201_CREATED)
def create_shortcut_endpoint(
    shortcut: ModelShortcutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_shortcut(db=db, shortcut=shortcut)


@router.put("/{shortcut_id}", response_model=ModelShortcutBase)
def update_shortcut_endpoint(
    shortcut_id: int,
    shortcut: ModelShortcutUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_shortcut = update_shortcut(db=db, shortcut_id=shortcut_id, shortcut=shortcut)
    if db_shortcut is None:
        raise HTTPException(status_code=404, detail="快捷入口不存在")
    return db_shortcut


@router.delete("/{shortcut_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shortcut_endpoint(
    shortcut_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = delete_shortcut(db=db, shortcut_id=shortcut_id)
    if not success:
        raise HTTPException(status_code=404, detail="快捷入口不存在")
