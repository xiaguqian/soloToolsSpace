from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_active_user
from ..analysis_service import AnalysisService

router = APIRouter(prefix="/api/analysis", tags=["数据分析"])


@router.post("/")
def analyze_data(
    request: schemas.AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    service = AnalysisService(db)
    try:
        result = service.analyze(request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"分析失败: {str(e)}")


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    total_records = db.query(models.DataRecord).count()
    total_dimensions = db.query(models.Dimension).filter(models.Dimension.is_active == True).count()
    total_categories = db.query(models.DataCategory).filter(models.DataCategory.is_active == True).count()
    total_rules = db.query(models.ConversionRule).filter(models.ConversionRule.is_enabled == True).count()
    
    recent_records = db.query(models.DataRecord).order_by(
        models.DataRecord.created_at.desc()
    ).limit(10).all()
    
    unit_summary = db.query(
        models.DataRecord.unit,
        func.count(models.DataRecord.id).label("count")
    ).group_by(models.DataRecord.unit).all()
    
    dimension_summary = db.query(
        models.Dimension.display_name,
        func.count(models.DataRecord.id).label("count")
    ).join(models.DataRecord, models.Dimension.id == models.DataRecord.dimension_id).group_by(
        models.Dimension.id
    ).all()
    
    return {
        "total_records": total_records,
        "total_dimensions": total_dimensions,
        "total_categories": total_categories,
        "total_conversion_rules": total_rules,
        "recent_records": [
            {
                "id": r.id,
                "data_name": r.data_name,
                "value": r.value,
                "unit": r.unit,
                "data_date": r.data_date.strftime("%Y-%m-%d")
            } for r in recent_records
        ],
        "unit_distribution": [{"unit": u, "count": c} for u, c in unit_summary],
        "dimension_distribution": [{"dimension": d, "count": c} for d, c in dimension_summary]
    }


@router.get("/available-options")
def get_available_options(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    dimensions = db.query(models.Dimension).filter(models.Dimension.is_active == True).all()
    categories = db.query(models.DataCategory).filter(models.DataCategory.is_active == True).all()
    units = db.query(models.DataRecord.unit).distinct().all()
    data_names = db.query(models.DataRecord.data_name).distinct().all()
    enabled_rules = db.query(models.ConversionRule).filter(
        models.ConversionRule.is_enabled == True
    ).all()
    
    all_units = set()
    for u in units:
        all_units.add(u[0])
    for rule in enabled_rules:
        all_units.add(rule.source_unit)
        all_units.add(rule.target_unit)
    
    return {
        "dimensions": [
            {
                "unique_id": d.unique_id,
                "display_name": d.display_name,
                "english_name": d.english_name,
                "default_unit": d.default_unit
            } for d in dimensions
        ],
        "categories": [c.name for c in categories],
        "units": sorted(list(all_units)),
        "data_names": [dn[0] for dn in data_names],
        "chart_types": [
            {"value": "line", "label": "折线图"},
            {"value": "bar", "label": "柱状图"},
            {"value": "pie", "label": "饼图/扇形图"},
            {"value": "table", "label": "数据表格"}
        ],
        "aggregation_funcs": [
            {"value": "sum", "label": "求和"},
            {"value": "avg", "label": "平均值"},
            {"value": "count", "label": "计数"},
            {"value": "max", "label": "最大值"},
            {"value": "min", "label": "最小值"}
        ],
        "group_by_options": [
            {"value": "dimension", "label": "维度"},
            {"value": "dimension_value", "label": "维度值"},
            {"value": "data_name", "label": "数据名称"},
            {"value": "category", "label": "数据分类"},
            {"value": "date", "label": "日期"},
            {"value": "value_range", "label": "数值范围"}
        ]
    }


@router.get("/dimension-values/{dimension_unique_id}")
def get_dimension_values(
    dimension_unique_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    dimension = db.query(models.Dimension).filter(
        models.Dimension.unique_id == dimension_unique_id
    ).first()
    if not dimension:
        raise HTTPException(status_code=404, detail="维度不存在")
    values = db.query(models.DataRecord.dimension_value).filter(
        models.DataRecord.dimension_id == dimension.id
    ).distinct().all()
    return {
        "dimension": dimension.display_name,
        "values": [v[0] for v in values]
    }


@router.get("/categories-by-dimensions")
def get_categories_by_dimensions(
    dimension_unique_ids: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    dim_ids = [d.strip() for d in dimension_unique_ids.split(",") if d.strip()]
    if not dim_ids:
        categories = db.query(models.DataCategory).filter(
            models.DataCategory.is_active == True
        ).all()
        return {"categories": [c.name for c in categories]}
    
    dimension_ids = db.query(models.Dimension.id).filter(
        models.Dimension.unique_id.in_(dim_ids)
    ).all()
    dimension_ids = [d[0] for d in dimension_ids]
    if not dimension_ids:
        return {"categories": []}
    
    category_ids = db.query(models.DataRecord.category_id).filter(
        models.DataRecord.dimension_id.in_(dimension_ids),
        models.DataRecord.category_id.isnot(None)
    ).distinct().all()
    category_ids = [c[0] for c in category_ids]
    if not category_ids:
        return {"categories": []}
    
    categories = db.query(models.DataCategory).filter(
        models.DataCategory.id.in_(category_ids),
        models.DataCategory.is_active == True
    ).all()
    return {"categories": [c.name for c in categories]}
