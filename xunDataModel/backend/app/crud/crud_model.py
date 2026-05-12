from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from app.models.models import Model, ModelProvider, APIType, ModelTag, ModelTagRelation


def get_model_by_id(db: Session, model_id: int) -> Optional[Model]:
    return db.query(Model).filter(Model.id == model_id).first()


def get_or_create_provider(db: Session, provider_name: str) -> ModelProvider:
    provider = db.query(ModelProvider).filter(ModelProvider.name == provider_name).first()
    if not provider:
        provider = ModelProvider(name=provider_name)
        db.add(provider)
        db.commit()
        db.refresh(provider)
    return provider


def create_model(db: Session, model_data: dict, owner_id: int) -> Model:
    provider_name = model_data.pop("provider_name", None)
    tag_ids = model_data.pop("tag_ids", [])
    
    if provider_name:
        provider = get_or_create_provider(db, provider_name)
        model_data["provider_id"] = provider.id
    
    model = Model(owner_id=owner_id, **model_data)
    db.add(model)
    db.commit()
    db.refresh(model)
    
    if tag_ids:
        for tag_id in tag_ids:
            relation = ModelTagRelation(model_id=model.id, tag_id=tag_id)
            db.add(relation)
        db.commit()
    
    return model


def update_model_tags(db: Session, model: Model, tag_ids: List[int]) -> None:
    db.query(ModelTagRelation).filter(ModelTagRelation.model_id == model.id).delete()
    for tag_id in tag_ids:
        relation = ModelTagRelation(model_id=model.id, tag_id=tag_id)
        db.add(relation)
    db.commit()


def update_model(db: Session, model: Model, update_data: dict) -> Model:
    provider_name = update_data.pop("provider_name", None)
    tag_ids = update_data.pop("tag_ids", None)
    
    if provider_name:
        provider = get_or_create_provider(db, provider_name)
        update_data["provider_id"] = provider.id
    
    for field, value in update_data.items():
        if value is not None:
            setattr(model, field, value)
    
    db.add(model)
    db.commit()
    
    if tag_ids is not None:
        update_model_tags(db, model, tag_ids)
    
    db.refresh(model)
    return model


def get_models(
    db: Session,
    owner_id: Optional[int] = None,
    team_id: Optional[int] = None,
    is_enabled: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
) -> tuple:
    query = db.query(Model).options(
        joinedload(Model.tags).joinedload(ModelTagRelation.tag)
    )
    
    conditions = []
    if owner_id is not None:
        conditions.append(Model.owner_id == owner_id)
    if team_id is not None:
        conditions.append((Model.team_id == team_id) & (Model.is_team_shared == 1))
    if is_enabled is not None:
        conditions.append(Model.is_enabled == (1 if is_enabled else 0))
    
    if conditions:
        from sqlalchemy import or_
        query = query.filter(or_(*conditions) if len(conditions) > 1 else conditions[0])
    
    total = query.count()
    models = query.offset(skip).limit(limit).all()
    return total, models


def get_available_models_for_user(db: Session, user_id: int, team_ids: Optional[List[int]] = None) -> List[Model]:
    from sqlalchemy import or_
    query = db.query(Model).filter(Model.is_enabled == 1)
    
    conditions = [Model.owner_id == user_id]
    if team_ids:
        conditions.append((Model.is_team_shared == 1) & Model.team_id.in_(team_ids))
    
    query = query.filter(or_(*conditions))
    return query.options(joinedload(Model.tags).joinedload(ModelTagRelation.tag)).all()


def delete_model(db: Session, model: Model) -> None:
    db.delete(model)
    db.commit()


def increment_request_count(db: Session, model: Model) -> None:
    model.request_count += 1
    if model.has_free_quota and model.remaining_quota is not None and model.remaining_quota > 0:
        model.remaining_quota -= 1
    db.add(model)
    db.commit()
