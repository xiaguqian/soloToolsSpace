from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_active_user, require_admin

router = APIRouter(prefix="/api/dimensions", tags=["维度管理"])


@router.get("/", response_model=List[schemas.DimensionResponse])
def list_dimensions(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    query = db.query(models.Dimension)
    if not include_inactive:
        query = query.filter(models.Dimension.is_active == True)
    return query.all()


@router.get("/{dimension_id}", response_model=schemas.DimensionResponse)
def get_dimension(
    dimension_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    dimension = db.query(models.Dimension).filter(models.Dimension.id == dimension_id).first()
    if not dimension:
        raise HTTPException(status_code=404, detail="维度不存在")
    return dimension


@router.post("/", response_model=schemas.DimensionResponse)
def create_dimension(
    dimension_data: schemas.DimensionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    existing = db.query(models.Dimension).filter(
        (models.Dimension.unique_id == dimension_data.unique_id) |
        (models.Dimension.english_name == dimension_data.english_name)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="维度唯一标识或英文名已存在"
        )
    dimension = models.Dimension(**dimension_data.dict())
    db.add(dimension)
    db.commit()
    db.refresh(dimension)
    return dimension


@router.put("/{dimension_id}", response_model=schemas.DimensionResponse)
def update_dimension(
    dimension_id: int,
    dimension_data: schemas.DimensionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    dimension = db.query(models.Dimension).filter(models.Dimension.id == dimension_id).first()
    if not dimension:
        raise HTTPException(status_code=404, detail="维度不存在")
    update_data = dimension_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(dimension, key, value)
    db.commit()
    db.refresh(dimension)
    return dimension


@router.delete("/{dimension_id}")
def delete_dimension(
    dimension_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    dimension = db.query(models.Dimension).filter(models.Dimension.id == dimension_id).first()
    if not dimension:
        raise HTTPException(status_code=404, detail="维度不存在")
    data_count = db.query(models.DataRecord).filter(models.DataRecord.dimension_id == dimension_id).count()
    if data_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"该维度下存在 {data_count} 条数据，无法删除"
        )
    db.delete(dimension)
    db.commit()
    return {"message": "维度已删除"}


@router.post("/register-auto", response_model=schemas.DimensionResponse)
def auto_register_dimension(
    unique_id: str,
    english_name: str,
    display_name: str,
    default_unit: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    existing = db.query(models.Dimension).filter(
        models.Dimension.unique_id == unique_id
    ).first()
    if existing:
        return existing
    dimension = models.Dimension(
        unique_id=unique_id,
        english_name=english_name,
        display_name=display_name,
        default_unit=default_unit
    )
    db.add(dimension)
    db.commit()
    db.refresh(dimension)
    return dimension
