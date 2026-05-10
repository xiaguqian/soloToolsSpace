from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_active_user, require_admin

router = APIRouter(prefix="/api/conversion", tags=["度量换算"])


def safe_eval_expression(expression: str, value: float) -> float:
    allowed_names = {'x': value, 'value': value, 'abs': abs, 'round': round, 'float': float, 'int': int}
    code = compile(expression, "<string>", "eval")
    for name in code.co_names:
        if name not in allowed_names:
            raise ValueError(f"表达式中包含不允许的变量: {name}")
    result = eval(code, {"__builtins__": {}}, allowed_names)
    return float(result)


@router.get("/", response_model=List[schemas.ConversionRuleResponse])
def list_conversion_rules(
    include_disabled: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    query = db.query(models.ConversionRule)
    if not include_disabled:
        query = query.filter(models.ConversionRule.is_enabled == True)
    return query.all()


@router.get("/{rule_id}", response_model=schemas.ConversionRuleResponse)
def get_conversion_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    rule = db.query(models.ConversionRule).filter(models.ConversionRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="换算规则不存在")
    return rule


@router.post("/", response_model=schemas.ConversionRuleResponse)
def create_conversion_rule(
    rule_data: schemas.ConversionRuleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    existing = db.query(models.ConversionRule).filter(
        models.ConversionRule.source_unit == rule_data.source_unit,
        models.ConversionRule.target_unit == rule_data.target_unit
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该换算关系已存在"
        )
    try:
        safe_eval_expression(rule_data.expression, 100.0)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"表达式无效: {str(e)}"
        )
    rule = models.ConversionRule(**rule_data.dict())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.put("/{rule_id}", response_model=schemas.ConversionRuleResponse)
def update_conversion_rule(
    rule_id: int,
    rule_data: schemas.ConversionRuleUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    rule = db.query(models.ConversionRule).filter(models.ConversionRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="换算规则不存在")
    update_data = rule_data.dict(exclude_unset=True)
    if 'expression' in update_data:
        try:
            safe_eval_expression(update_data['expression'], 100.0)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"表达式无效: {str(e)}"
            )
    for key, value in update_data.items():
        setattr(rule, key, value)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/{rule_id}")
def delete_conversion_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    rule = db.query(models.ConversionRule).filter(models.ConversionRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="换算规则不存在")
    db.delete(rule)
    db.commit()
    return {"message": "换算规则已删除"}


@router.post("/test")
def test_conversion(
    source_unit: str,
    target_unit: str,
    value: float,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    rule = db.query(models.ConversionRule).filter(
        models.ConversionRule.source_unit == source_unit,
        models.ConversionRule.target_unit == target_unit,
        models.ConversionRule.is_enabled == True
    ).first()
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"未找到 {source_unit} 到 {target_unit} 的换算规则"
        )
    try:
        result = safe_eval_expression(rule.expression, value)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"换算失败: {str(e)}"
        )
    return {
        "source_unit": source_unit,
        "target_unit": target_unit,
        "original_value": value,
        "converted_value": result,
        "expression_used": rule.expression
    }


@router.post("/convert-batch")
def convert_batch(
    source_unit: str,
    target_unit: str,
    values: List[float],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    rule = db.query(models.ConversionRule).filter(
        models.ConversionRule.source_unit == source_unit,
        models.ConversionRule.target_unit == target_unit,
        models.ConversionRule.is_enabled == True
    ).first()
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"未找到 {source_unit} 到 {target_unit} 的换算规则"
        )
    results = []
    for value in values:
        try:
            result = safe_eval_expression(rule.expression, value)
            results.append({"original": value, "converted": result})
        except Exception as e:
            results.append({"original": value, "error": str(e)})
    return {
        "source_unit": source_unit,
        "target_unit": target_unit,
        "results": results
    }


@router.get("/available-units")
def get_available_units(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    enabled_rules = db.query(models.ConversionRule).filter(models.ConversionRule.is_enabled == True).all()
    units = set()
    for rule in enabled_rules:
        units.add(rule.source_unit)
        units.add(rule.target_unit)
    data_units = db.query(models.DataRecord.unit).distinct().all()
    for unit in data_units:
        units.add(unit[0])
    return {"units": sorted(list(units))}
