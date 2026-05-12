from sqlalchemy.orm import Session
from typing import Optional
from app.models.models import ModelTag
from app.schemas.schemas import ModelTagCreate, ModelTagUpdate


def get_tag_by_id(db: Session, tag_id: int) -> Optional[ModelTag]:
    return db.query(ModelTag).filter(ModelTag.id == tag_id).first()


def get_tag_by_name(db: Session, name: str) -> Optional[ModelTag]:
    return db.query(ModelTag).filter(ModelTag.name == name).first()


def create_tag(db: Session, tag_in: ModelTagCreate) -> ModelTag:
    tag = ModelTag(
        name=tag_in.name,
        description=tag_in.description
    )
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def update_tag(db: Session, tag: ModelTag, tag_in: ModelTagUpdate) -> ModelTag:
    update_data = tag_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tag, field, value)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def get_tags(db: Session, skip: int = 0, limit: int = 100, is_active: Optional[bool] = None) -> tuple:
    query = db.query(ModelTag)
    if is_active is not None:
        query = query.filter(ModelTag.is_active == (1 if is_active else 0))
    total = query.count()
    tags = query.offset(skip).limit(limit).all()
    return total, tags


def delete_tag(db: Session, tag: ModelTag) -> None:
    db.delete(tag)
    db.commit()
