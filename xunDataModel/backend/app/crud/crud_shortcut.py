from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.models import ModelShortcut, ShortcutType
from app.schemas.schemas import ModelShortcutCreate, ModelShortcutUpdate


def get_shortcut(db: Session, shortcut_id: int) -> Optional[ModelShortcut]:
    return db.query(ModelShortcut).filter(ModelShortcut.id == shortcut_id).first()


def get_shortcuts_by_model(db: Session, model_id: int) -> List[ModelShortcut]:
    return db.query(ModelShortcut)\
        .filter(ModelShortcut.model_id == model_id)\
        .order_by(ModelShortcut.shortcut_type)\
        .all()


def get_shortcuts(db: Session, skip: int = 0, limit: int = 100) -> List[ModelShortcut]:
    return db.query(ModelShortcut)\
        .order_by(desc(ModelShortcut.created_at))\
        .offset(skip)\
        .limit(limit)\
        .all()


def get_shortcuts_count(db: Session) -> int:
    return db.query(ModelShortcut).count()


def create_shortcut(db: Session, shortcut: ModelShortcutCreate) -> ModelShortcut:
    db_shortcut = ModelShortcut(
        model_id=shortcut.model_id,
        shortcut_type=shortcut.shortcut_type,
        url=shortcut.url,
        name=shortcut.name,
        description=shortcut.description,
        is_active=1 if shortcut.is_active else 0
    )
    db.add(db_shortcut)
    db.commit()
    db.refresh(db_shortcut)
    return db_shortcut


def update_shortcut(db: Session, shortcut_id: int, shortcut: ModelShortcutUpdate) -> Optional[ModelShortcut]:
    db_shortcut = get_shortcut(db, shortcut_id)
    if db_shortcut:
        if shortcut.url is not None:
            db_shortcut.url = shortcut.url
        if shortcut.name is not None:
            db_shortcut.name = shortcut.name
        if shortcut.description is not None:
            db_shortcut.description = shortcut.description
        if shortcut.is_active is not None:
            db_shortcut.is_active = 1 if shortcut.is_active else 0
        db.commit()
        db.refresh(db_shortcut)
    return db_shortcut


def delete_shortcut(db: Session, shortcut_id: int) -> bool:
    db_shortcut = get_shortcut(db, shortcut_id)
    if db_shortcut:
        db.delete(db_shortcut)
        db.commit()
        return True
    return False


def get_shortcut_by_model_and_type(db: Session, model_id: int, shortcut_type: ShortcutType) -> Optional[ModelShortcut]:
    return db.query(ModelShortcut)\
        .filter(ModelShortcut.model_id == model_id)\
        .filter(ModelShortcut.shortcut_type == shortcut_type)\
        .first()
