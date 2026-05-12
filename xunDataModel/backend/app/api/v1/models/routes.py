from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.models import User, ModelProvider, APIType
from app.schemas.schemas import (
    ModelCreate, ModelUpdate, ModelBase, ModelListResponse, ModelTestRequest,
    ModelProviderBase, APITypeBase
)
from app.crud.crud_model import (
    get_model_by_id, create_model, update_model, get_models, delete_model,
    get_or_create_provider, increment_request_count
)
from app.services.model_test import test_model_connection

router = APIRouter()


def model_to_response(model, db: Session):
    provider = db.query(ModelProvider).filter(ModelProvider.id == model.provider_id).first()
    api_type = db.query(APIType).filter(APIType.id == model.api_type_id).first()
    
    tags_data = []
    for rel in model.tags:
        if rel.tag:
            tags_data.append({
                "id": rel.tag.id,
                "name": rel.tag.name,
                "description": rel.tag.description,
                "is_active": rel.tag.is_active == 1,
                "created_at": rel.tag.created_at
            })
    
    return {
        **model.__dict__,
        "provider_name": provider.name if provider else None,
        "api_type_name": api_type.name if api_type else None,
        "is_enabled": model.is_enabled == 1,
        "has_free_quota": model.has_free_quota == 1,
        "is_team_shared": model.is_team_shared == 1,
        "tags": tags_data
    }


@router.get("/providers", response_model=List[ModelProviderBase])
def list_providers(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(ModelProvider).filter(ModelProvider.is_active == 1).all()


@router.get("/api-types", response_model=List[APITypeBase])
def list_api_types(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(APIType).filter(APIType.is_active == 1).all()


@router.get("", response_model=ModelListResponse)
def list_models(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_enabled: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    total, models = get_models(db, owner_id=current_user.id, is_enabled=is_enabled, skip=skip, limit=limit)
    items = [model_to_response(m, db) for m in models]
    return {"total": total, "items": items}


@router.get("/{model_id}", response_model=ModelBase)
def get_model(
    model_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    model = get_model_by_id(db, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    if model.owner_id != current_user.id and current_user.role.value == "user":
        raise HTTPException(status_code=403, detail="无权访问此模型")
    return model_to_response(model, db)


@router.post("", response_model=ModelBase, status_code=status.HTTP_201_CREATED)
def create_new_model(
    model_in: ModelCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    model_data = model_in.model_dump(exclude_unset=True)
    model = create_model(db, model_data, current_user.id)
    return model_to_response(model, db)


@router.put("/{model_id}", response_model=ModelBase)
def update_existing_model(
    model_id: int,
    model_in: ModelUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    model = get_model_by_id(db, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    if model.owner_id != current_user.id and current_user.role.value == "user":
        raise HTTPException(status_code=403, detail="无权修改此模型")
    
    update_data = model_in.model_dump(exclude_unset=True)
    model = update_model(db, model, update_data)
    return model_to_response(model, db)


@router.delete("/{model_id}")
def delete_existing_model(
    model_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    model = get_model_by_id(db, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    if model.owner_id != current_user.id and current_user.role.value == "user":
        raise HTTPException(status_code=403, detail="无权删除此模型")
    
    delete_model(db, model)
    return {"message": "模型已删除"}


@router.post("/{model_id}/test")
async def test_model(
    model_id: int,
    test_request: ModelTestRequest = ModelTestRequest(),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    model = get_model_by_id(db, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    if model.owner_id != current_user.id and current_user.role.value == "user":
        raise HTTPException(status_code=403, detail="无权测试此模型")
    
    result = await test_model_connection(model, test_request.message)
    return result


@router.post("/{model_id}/toggle")
def toggle_model(
    model_id: int,
    enable: bool = Query(..., description="是否启用模型"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    model = get_model_by_id(db, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    if model.owner_id != current_user.id and current_user.role.value == "user":
        raise HTTPException(status_code=403, detail="无权操作此模型")
    
    model.is_enabled = 1 if enable else 0
    db.add(model)
    db.commit()
    return {"message": f"模型已{'启用' if enable else '停用'}", "enabled": enable}
