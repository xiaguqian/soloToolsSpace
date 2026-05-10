from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
import pandas as pd
import io
import json
import uuid
from datetime import datetime
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_active_user, require_admin

router = APIRouter(prefix="/api/data", tags=["数据管理"])


def get_or_create_category(db: Session, name: str) -> models.DataCategory:
    if not name:
        return None
    category = db.query(models.DataCategory).filter(models.DataCategory.name == name).first()
    if not category:
        category = models.DataCategory(name=name)
        db.add(category)
        db.commit()
        db.refresh(category)
    return category


@router.get("/categories", response_model=List[schemas.DataCategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    return db.query(models.DataCategory).filter(models.DataCategory.is_active == True).all()


@router.post("/categories", response_model=schemas.DataCategoryResponse)
def create_category(
    category_data: schemas.DataCategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    existing = db.query(models.DataCategory).filter(models.DataCategory.name == category_data.name).first()
    if existing:
        return existing
    category = models.DataCategory(**category_data.dict())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.post("/", response_model=schemas.DataRecordResponse)
def create_data_record(
    data: schemas.DataRecordCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    dimension = db.query(models.Dimension).filter(
        models.Dimension.unique_id == data.dimension_unique_id
    ).first()
    if not dimension:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"维度 {data.dimension_unique_id} 不存在"
        )
    category = get_or_create_category(db, data.category_name)
    record = models.DataRecord(
        unique_id=str(uuid.uuid4()).replace("-", "")[:16].upper(),
        data_name=data.data_name,
        dimension_id=dimension.id,
        dimension_value=data.dimension_value,
        value=data.value,
        unit=data.unit,
        data_date=data.data_date,
        category_id=category.id if category else None,
        created_by=current_user.id
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/batch", response_model=dict)
def create_batch_records(
    records: List[schemas.DataRecordCreate],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    success_count = 0
    errors = []
    for i, data in enumerate(records):
        try:
            dimension = db.query(models.Dimension).filter(
                models.Dimension.unique_id == data.dimension_unique_id
            ).first()
            if not dimension:
                errors.append(f"第{i+1}条: 维度 {data.dimension_unique_id} 不存在")
                continue
            category = get_or_create_category(db, data.category_name)
            record = models.DataRecord(
                unique_id=str(uuid.uuid4()).replace("-", "")[:16].upper(),
                data_name=data.data_name,
                dimension_id=dimension.id,
                dimension_value=data.dimension_value,
                value=data.value,
                unit=data.unit,
                data_date=data.data_date,
                category_id=category.id if category else None,
                created_by=current_user.id
            )
            db.add(record)
            success_count += 1
        except Exception as e:
            errors.append(f"第{i+1}条: {str(e)}")
    db.commit()
    return {"success_count": success_count, "errors": errors}


@router.post("/import/csv")
async def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="请上传CSV文件")
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV解析失败: {str(e)}")
    required_columns = ['data_name', 'dimension_unique_id', 'dimension_value', 'value', 'unit', 'data_date']
    for col in required_columns:
        if col not in df.columns:
            raise HTTPException(status_code=400, detail=f"缺少必要列: {col}")
    success_count = 0
    errors = []
    for index, row in df.iterrows():
        try:
            dimension = db.query(models.Dimension).filter(
                models.Dimension.unique_id == str(row['dimension_unique_id'])
            ).first()
            if not dimension:
                errors.append(f"第{index+2}行: 维度 {row['dimension_unique_id']} 不存在")
                continue
            category_name = row.get('category_name')
            category = get_or_create_category(db, str(category_name) if pd.notna(category_name) else None)
            record = models.DataRecord(
                unique_id=str(uuid.uuid4()).replace("-", "")[:16].upper(),
                data_name=str(row['data_name']),
                dimension_id=dimension.id,
                dimension_value=str(row['dimension_value']),
                value=float(row['value']),
                unit=str(row['unit']),
                data_date=pd.to_datetime(row['data_date']).to_pydatetime(),
                category_id=category.id if category else None,
                created_by=current_user.id
            )
            db.add(record)
            success_count += 1
        except Exception as e:
            errors.append(f"第{index+2}行: {str(e)}")
    db.commit()
    return {"success_count": success_count, "errors": errors}


@router.post("/import/json")
async def import_json(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="请上传JSON文件")
    contents = await file.read()
    try:
        data_list = json.loads(contents)
        if not isinstance(data_list, list):
            raise ValueError("JSON必须是数组格式")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"JSON解析失败: {str(e)}")
    success_count = 0
    errors = []
    for i, item in enumerate(data_list):
        try:
            dimension = db.query(models.Dimension).filter(
                models.Dimension.unique_id == str(item['dimension_unique_id'])
            ).first()
            if not dimension:
                errors.append(f"第{i+1}条: 维度 {item['dimension_unique_id']} 不存在")
                continue
            category = get_or_create_category(db, item.get('category_name'))
            record = models.DataRecord(
                unique_id=str(uuid.uuid4()).replace("-", "")[:16].upper(),
                data_name=str(item['data_name']),
                dimension_id=dimension.id,
                dimension_value=str(item['dimension_value']),
                value=float(item['value']),
                unit=str(item['unit']),
                data_date=pd.to_datetime(item['data_date']).to_pydatetime(),
                category_id=category.id if category else None,
                created_by=current_user.id
            )
            db.add(record)
            success_count += 1
        except Exception as e:
            errors.append(f"第{i+1}条: {str(e)}")
    db.commit()
    return {"success_count": success_count, "errors": errors}


@router.get("/", response_model=List[schemas.DataRecordResponse])
def list_data_records(
    dimension_unique_ids: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    units: Optional[str] = None,
    category_names: Optional[str] = None,
    data_names: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    query = db.query(models.DataRecord)
    if dimension_unique_ids:
        ids_list = [s.strip() for s in dimension_unique_ids.split(',')]
        dimension_ids = db.query(models.Dimension.id).filter(models.Dimension.unique_id.in_(ids_list)).all()
        dimension_ids = [d[0] for d in dimension_ids]
        query = query.filter(models.DataRecord.dimension_id.in_(dimension_ids))
    if start_date:
        query = query.filter(models.DataRecord.data_date >= pd.to_datetime(start_date).to_pydatetime())
    if end_date:
        query = query.filter(models.DataRecord.data_date <= pd.to_datetime(end_date).to_pydatetime())
    if units:
        units_list = [s.strip() for s in units.split(',')]
        query = query.filter(models.DataRecord.unit.in_(units_list))
    if category_names:
        cat_list = [s.strip() for s in category_names.split(',')]
        category_ids = db.query(models.DataCategory.id).filter(models.DataCategory.name.in_(cat_list)).all()
        category_ids = [c[0] for c in category_ids]
        query = query.filter(models.DataRecord.category_id.in_(category_ids))
    if data_names:
        names_list = [s.strip() for s in data_names.split(',')]
        query = query.filter(models.DataRecord.data_name.in_(names_list))
    return query.order_by(models.DataRecord.data_date.desc()).offset(skip).limit(limit).all()


@router.get("/{record_id}", response_model=schemas.DataRecordResponse)
def get_data_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    record = db.query(models.DataRecord).filter(models.DataRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="数据记录不存在")
    return record


@router.put("/{record_id}", response_model=schemas.DataRecordResponse)
def update_data_record(
    record_id: int,
    data: schemas.DataRecordUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    record = db.query(models.DataRecord).filter(models.DataRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="数据记录不存在")
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}")
def delete_data_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    record = db.query(models.DataRecord).filter(models.DataRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="数据记录不存在")
    db.delete(record)
    db.commit()
    return {"message": "数据记录已删除"}


@router.delete("/batch/by-ids")
def delete_batch_records(
    record_ids: List[int],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    count = db.query(models.DataRecord).filter(models.DataRecord.id.in_(record_ids)).delete(synchronize_session=False)
    db.commit()
    return {"message": f"已删除 {count} 条记录"}
