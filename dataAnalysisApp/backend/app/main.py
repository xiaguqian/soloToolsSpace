from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text, inspect
from typing import List, Optional, Dict, Any
from .database import get_db, get_engine, get_settings, Base
from .models import (
    Dimension, Category, Formula, DataDefinition, 
    DataDefinitionAttribute, DataDefinitionIndex,
    QueryStatement, Chart, AttributeTypes, DimensionValueTypes
)
from .schemas import (
    DimensionCreate, DimensionUpdate, DimensionResponse,
    CategoryCreate, CategoryUpdate, CategoryResponse,
    FormulaCreate, FormulaUpdate, FormulaResponse,
    DataDefinitionCreate, DataDefinitionUpdate, DataDefinitionResponse,
    DataDefinitionAttributeResponse,
    QueryStatementCreate, QueryStatementUpdate, QueryStatementResponse,
    ChartCreate, ChartUpdate, ChartResponse,
    GenericResponse, DynamicDataCreate, DynamicDataUpdate, ChartDataRequest
)
import json

app = FastAPI(title="数据分析应用API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings = get_settings()

@app.get("/")
def root():
    return {"message": "数据分析应用API", "version": "1.0.0"}

@app.get("/api/dimensions", response_model=GenericResponse)
def get_dimensions(
    is_enabled: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Dimension)
    if is_enabled is not None:
        query = query.filter(Dimension.is_enabled == is_enabled)
    dimensions = query.order_by(Dimension.id.desc()).all()
    return GenericResponse(code=200, message="获取成功", data=[DimensionResponse.model_validate(d) for d in dimensions])

@app.get("/api/dimensions/{dimension_id}", response_model=GenericResponse)
def get_dimension(dimension_id: int, db: Session = Depends(get_db)):
    dimension = db.query(Dimension).filter(Dimension.id == dimension_id).first()
    if not dimension:
        raise HTTPException(status_code=404, detail="维度不存在")
    return GenericResponse(code=200, message="获取成功", data=DimensionResponse.model_validate(dimension))

@app.post("/api/dimensions", response_model=GenericResponse)
def create_dimension(dimension: DimensionCreate, db: Session = Depends(get_db)):
    existing = db.query(Dimension).filter(Dimension.dimension_code == dimension.dimension_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="维度代码已存在")
    db_dimension = Dimension(**dimension.model_dump())
    db.add(db_dimension)
    db.commit()
    db.refresh(db_dimension)
    return GenericResponse(code=200, message="创建成功", data=DimensionResponse.model_validate(db_dimension))

@app.put("/api/dimensions/{dimension_id}", response_model=GenericResponse)
def update_dimension(dimension_id: int, dimension: DimensionUpdate, db: Session = Depends(get_db)):
    db_dimension = db.query(Dimension).filter(Dimension.id == dimension_id).first()
    if not db_dimension:
        raise HTTPException(status_code=404, detail="维度不存在")
    update_data = dimension.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_dimension, key, value)
    db.commit()
    db.refresh(db_dimension)
    return GenericResponse(code=200, message="更新成功", data=DimensionResponse.model_validate(db_dimension))

@app.delete("/api/dimensions/{dimension_id}", response_model=GenericResponse)
def delete_dimension(dimension_id: int, db: Session = Depends(get_db)):
    db_dimension = db.query(Dimension).filter(Dimension.id == dimension_id).first()
    if not db_dimension:
        raise HTTPException(status_code=404, detail="维度不存在")
    db.delete(db_dimension)
    db.commit()
    return GenericResponse(code=200, message="删除成功", data=None)

@app.get("/api/categories", response_model=GenericResponse)
def get_categories(
    is_enabled: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Category)
    if is_enabled is not None:
        query = query.filter(Category.is_enabled == is_enabled)
    categories = query.order_by(Category.id.desc()).all()
    return GenericResponse(code=200, message="获取成功", data=[CategoryResponse.model_validate(c) for c in categories])

@app.get("/api/categories/{category_id}", response_model=GenericResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    return GenericResponse(code=200, message="获取成功", data=CategoryResponse.model_validate(category))

@app.post("/api/categories", response_model=GenericResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(Category).filter(Category.category_code == category.category_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="分类代码已存在")
    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return GenericResponse(code=200, message="创建成功", data=CategoryResponse.model_validate(db_category))

@app.put("/api/categories/{category_id}", response_model=GenericResponse)
def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="分类不存在")
    update_data = category.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    db.commit()
    db.refresh(db_category)
    return GenericResponse(code=200, message="更新成功", data=CategoryResponse.model_validate(db_category))

@app.delete("/api/categories/{category_id}", response_model=GenericResponse)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="分类不存在")
    db.delete(db_category)
    db.commit()
    return GenericResponse(code=200, message="删除成功", data=None)

@app.get("/api/formulas", response_model=GenericResponse)
def get_formulas(
    is_enabled: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Formula)
    if is_enabled is not None:
        query = query.filter(Formula.is_enabled == is_enabled)
    formulas = query.order_by(Formula.id.desc()).all()
    return GenericResponse(code=200, message="获取成功", data=[FormulaResponse.model_validate(f) for f in formulas])

@app.get("/api/formulas/{formula_id}", response_model=GenericResponse)
def get_formula(formula_id: int, db: Session = Depends(get_db)):
    formula = db.query(Formula).filter(Formula.id == formula_id).first()
    if not formula:
        raise HTTPException(status_code=404, detail="公式不存在")
    return GenericResponse(code=200, message="获取成功", data=FormulaResponse.model_validate(formula))

@app.post("/api/formulas", response_model=GenericResponse)
def create_formula(formula: FormulaCreate, db: Session = Depends(get_db)):
    existing = db.query(Formula).filter(Formula.formula_code == formula.formula_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="公式代码已存在")
    db_formula = Formula(**formula.model_dump())
    db.add(db_formula)
    db.commit()
    db.refresh(db_formula)
    return GenericResponse(code=200, message="创建成功", data=FormulaResponse.model_validate(db_formula))

@app.put("/api/formulas/{formula_id}", response_model=GenericResponse)
def update_formula(formula_id: int, formula: FormulaUpdate, db: Session = Depends(get_db)):
    db_formula = db.query(Formula).filter(Formula.id == formula_id).first()
    if not db_formula:
        raise HTTPException(status_code=404, detail="公式不存在")
    update_data = formula.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_formula, key, value)
    db.commit()
    db.refresh(db_formula)
    return GenericResponse(code=200, message="更新成功", data=FormulaResponse.model_validate(db_formula))

@app.delete("/api/formulas/{formula_id}", response_model=GenericResponse)
def delete_formula(formula_id: int, db: Session = Depends(get_db)):
    db_formula = db.query(Formula).filter(Formula.id == formula_id).first()
    if not db_formula:
        raise HTTPException(status_code=404, detail="公式不存在")
    db.delete(db_formula)
    db.commit()
    return GenericResponse(code=200, message="删除成功", data=None)

def get_mysql_type(value_type: str) -> str:
    type_map = {
        "string": "VARCHAR(255)",
        "number": "DECIMAL(18, 2)",
        "date": "DATETIME"
    }
    return type_map.get(value_type, "VARCHAR(255)")

def build_data_definition_response(dd: DataDefinition, db: Session) -> DataDefinitionResponse:
    attributes = []
    is_original = True
    for attr in dd.attributes:
        attr_resp = DataDefinitionAttributeResponse(
            id=attr.id,
            attribute_code=attr.attribute_code,
            attribute_name=attr.attribute_name,
            attribute_type=attr.attribute_type.value,
            dimension_id=attr.dimension_id,
            referenced_data_definition_id=attr.referenced_data_definition_id,
            sort_order=attr.sort_order,
        )
        if attr.attribute_type == AttributeTypes.DATA_DEFINITION:
            is_original = False
            if attr.referenced_data_definition_id:
                ref_dd = db.query(DataDefinition).filter(DataDefinition.id == attr.referenced_data_definition_id).first()
                if ref_dd:
                    attr_resp.referenced_code_name = ref_dd.code_name
        else:
            if attr.dimension_id:
                dim = db.query(Dimension).filter(Dimension.id == attr.dimension_id).first()
                if dim:
                    attr_resp.dimension_code = dim.dimension_code
                    attr_resp.dimension_name = dim.dimension_name
                    attr_resp.value_type = dim.value_type.value
        attributes.append(attr_resp)
    
    category_name = None
    if dd.category_id:
        cat = db.query(Category).filter(Category.id == dd.category_id).first()
        if cat:
            category_name = cat.category_name
    
    return DataDefinitionResponse(
        id=dd.id,
        display_name=dd.display_name,
        code_name=dd.code_name,
        description=dd.description,
        category_id=dd.category_id,
        is_defined=dd.is_defined,
        is_enabled=dd.is_enabled,
        created_at=dd.created_at,
        updated_at=dd.updated_at,
        attributes=attributes,
        indexes=dd.indexes,
        category_name=category_name,
        is_original=is_original
    )

@app.get("/api/data-definitions", response_model=GenericResponse)
def get_data_definitions(
    is_enabled: Optional[int] = None,
    is_defined: Optional[int] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DataDefinition).options(joinedload(DataDefinition.attributes), joinedload(DataDefinition.indexes))
    if is_enabled is not None:
        query = query.filter(DataDefinition.is_enabled == is_enabled)
    if is_defined is not None:
        query = query.filter(DataDefinition.is_defined == is_defined)
    if category_id is not None:
        query = query.filter(DataDefinition.category_id == category_id)
    dds = query.order_by(DataDefinition.id.desc()).all()
    result = [build_data_definition_response(dd, db) for dd in dds]
    return GenericResponse(code=200, message="获取成功", data=result)

@app.get("/api/data-definitions/{dd_id}", response_model=GenericResponse)
def get_data_definition(dd_id: int, db: Session = Depends(get_db)):
    dd = db.query(DataDefinition).options(joinedload(DataDefinition.attributes), joinedload(DataDefinition.indexes)).filter(DataDefinition.id == dd_id).first()
    if not dd:
        raise HTTPException(status_code=404, detail="数据定义不存在")
    return GenericResponse(code=200, message="获取成功", data=build_data_definition_response(dd, db))

def get_column_code_from_attribute(attr: DataDefinitionAttribute, db: Session) -> str:
    if attr.attribute_type == AttributeTypes.DIMENSION:
        if attr.dimension_id:
            dim = db.query(Dimension).filter(Dimension.id == attr.dimension_id).first()
            if dim:
                return dim.dimension_code
    return attr.attribute_code

def generate_unique_column_code(code: str, existing_codes: List[str]) -> str:
    if code not in existing_codes:
        return code
    idx = 1
    while f"{code}{idx}" in existing_codes:
        idx += 1
    return f"{code}{idx}"

def create_dynamic_table(dd: DataDefinition, db: Session, engine):
    table_name = dd.code_name
    inspector = inspect(engine)
    if inspector.has_table(table_name):
        db.execute(text(f"DROP TABLE IF EXISTS `{table_name}`"))
        db.commit()
    
    column_defs = [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "data_id VARCHAR(50) NOT NULL UNIQUE",
        "created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
        "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ]
    
    existing_codes = ["id", "data_id", "created_at", "updated_at"]
    column_codes = {}
    
    for attr in sorted(dd.attributes, key=lambda x: x.sort_order):
        base_code = get_column_code_from_attribute(attr, db)
        unique_code = generate_unique_column_code(base_code, existing_codes)
        existing_codes.append(unique_code)
        column_codes[attr.id] = unique_code
        
        if attr.attribute_type == AttributeTypes.DATA_DEFINITION:
            column_type = "VARCHAR(50)"
        else:
            dim = None
            if attr.dimension_id:
                dim = db.query(Dimension).filter(Dimension.id == attr.dimension_id).first()
            value_type = dim.value_type.value if dim else "string"
            column_type = get_mysql_type(value_type)
        
        column_defs.append(f"`{unique_code}` {column_type}")
    
    for idx_info in dd.indexes:
        attr_id = None
        for attr in dd.attributes:
            if attr.attribute_code == idx_info.attribute_code:
                attr_id = attr.id
                break
        if attr_id and attr_id in column_codes:
            col_code = column_codes[attr_id]
            idx_name = idx_info.index_name if idx_info.index_name else f"idx_{table_name}_{col_code}"
            column_defs.append(f"INDEX `{idx_name}` (`{col_code}`)")
    
    create_sql = f"CREATE TABLE `{table_name}` ({', '.join(column_defs)}) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    db.execute(text(create_sql))
    db.commit()

@app.post("/api/data-definitions", response_model=GenericResponse)
def create_data_definition(dd: DataDefinitionCreate, db: Session = Depends(get_db)):
    existing = db.query(DataDefinition).filter(DataDefinition.code_name == dd.code_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="数据定义代码已存在")
    
    db_dd = DataDefinition(
        display_name=dd.display_name,
        code_name=dd.code_name,
        description=dd.description,
        category_id=dd.category_id,
        is_defined=0
    )
    db.add(db_dd)
    db.flush()
    
    for attr in dd.attributes:
        db_attr = DataDefinitionAttribute(
            data_definition_id=db_dd.id,
            attribute_code=attr.attribute_code,
            attribute_name=attr.attribute_name,
            attribute_type=attr.attribute_type,
            dimension_id=attr.dimension_id,
            referenced_data_definition_id=attr.referenced_data_definition_id,
            sort_order=attr.sort_order
        )
        db.add(db_attr)
    
    for idx_info in dd.indexes:
        db_idx = DataDefinitionIndex(
            data_definition_id=db_dd.id,
            attribute_code=idx_info.attribute_code,
            index_name=idx_info.index_name,
            sort_order=idx_info.sort_order
        )
        db.add(db_idx)
    
    db.commit()
    db.refresh(db_dd)
    
    return GenericResponse(code=200, message="创建成功", data=build_data_definition_response(db_dd, db))

@app.post("/api/data-definitions/{dd_id}/define", response_model=GenericResponse)
def define_data_definition(dd_id: int, db: Session = Depends(get_db)):
    dd = db.query(DataDefinition).options(joinedload(DataDefinition.attributes), joinedload(DataDefinition.indexes)).filter(DataDefinition.id == dd_id).first()
    if not dd:
        raise HTTPException(status_code=404, detail="数据定义不存在")
    
    if not dd.attributes:
        raise HTTPException(status_code=400, detail="请先添加数据属性")
    
    engine = get_engine()
    try:
        create_dynamic_table(dd, db, engine)
        dd.is_defined = 1
        db.commit()
        db.refresh(dd)
        return GenericResponse(code=200, message="定义成功，数据表已创建", data=build_data_definition_response(dd, db))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"创建表失败: {str(e)}")

@app.put("/api/data-definitions/{dd_id}", response_model=GenericResponse)
def update_data_definition(dd_id: int, dd: DataDefinitionUpdate, db: Session = Depends(get_db)):
    db_dd = db.query(DataDefinition).options(joinedload(DataDefinition.attributes), joinedload(DataDefinition.indexes)).filter(DataDefinition.id == dd_id).first()
    if not db_dd:
        raise HTTPException(status_code=404, detail="数据定义不存在")
    
    update_data = dd.model_dump(exclude_unset=True, exclude={"attributes", "indexes"})
    for key, value in update_data.items():
        setattr(db_dd, key, value)
    
    if dd.attributes is not None:
        for attr in db_dd.attributes:
            db.delete(attr)
        db.flush()
        for attr in dd.attributes:
            db_attr = DataDefinitionAttribute(
                data_definition_id=db_dd.id,
                attribute_code=attr.attribute_code,
                attribute_name=attr.attribute_name,
                attribute_type=attr.attribute_type,
                dimension_id=attr.dimension_id,
                referenced_data_definition_id=attr.referenced_data_definition_id,
                sort_order=attr.sort_order
            )
            db.add(db_attr)
    
    if dd.indexes is not None:
        for idx_info in db_dd.indexes:
            db.delete(idx_info)
        db.flush()
        for idx_info in dd.indexes:
            db_idx = DataDefinitionIndex(
                data_definition_id=db_dd.id,
                attribute_code=idx_info.attribute_code,
                index_name=idx_info.index_name,
                sort_order=idx_info.sort_order
            )
            db.add(db_idx)
    
    db.commit()
    db.refresh(db_dd)
    return GenericResponse(code=200, message="更新成功", data=build_data_definition_response(db_dd, db))

@app.delete("/api/data-definitions/{dd_id}", response_model=GenericResponse)
def delete_data_definition(dd_id: int, db: Session = Depends(get_db)):
    db_dd = db.query(DataDefinition).filter(DataDefinition.id == dd_id).first()
    if not db_dd:
        raise HTTPException(status_code=404, detail="数据定义不存在")
    
    if db_dd.is_defined:
        try:
            engine = get_engine()
            inspector = inspect(engine)
            if inspector.has_table(db_dd.code_name):
                db.execute(text(f"DROP TABLE IF EXISTS `{db_dd.code_name}`"))
                db.commit()
        except Exception as e:
            pass
    
    db.delete(db_dd)
    db.commit()
    return GenericResponse(code=200, message="删除成功", data=None)

@app.get("/api/data-definitions/{dd_id}/columns", response_model=GenericResponse)
def get_data_definition_columns(dd_id: int, db: Session = Depends(get_db)):
    dd = db.query(DataDefinition).options(joinedload(DataDefinition.attributes)).filter(DataDefinition.id == dd_id).first()
    if not dd:
        raise HTTPException(status_code=404, detail="数据定义不存在")
    
    columns = []
    existing_codes = ["id", "data_id", "created_at", "updated_at"]
    for attr in sorted(dd.attributes, key=lambda x: x.sort_order):
        base_code = get_column_code_from_attribute(attr, db)
        unique_code = generate_unique_column_code(base_code, existing_codes)
        existing_codes.append(unique_code)
        
        column_info = {
            "attribute_id": attr.id,
            "attribute_code": attr.attribute_code,
            "attribute_name": attr.attribute_name,
            "column_code": unique_code,
            "attribute_type": attr.attribute_type.value
        }
        
        if attr.attribute_type == AttributeTypes.DATA_DEFINITION:
            if attr.referenced_data_definition_id:
                ref_dd = db.query(DataDefinition).filter(DataDefinition.id == attr.referenced_data_definition_id).first()
                if ref_dd:
                    column_info["referenced_code_name"] = ref_dd.code_name
                    column_info["referenced_display_name"] = ref_dd.display_name
        else:
            if attr.dimension_id:
                dim = db.query(Dimension).filter(Dimension.id == attr.dimension_id).first()
                if dim:
                    column_info["dimension_code"] = dim.dimension_code
                    column_info["value_type"] = dim.value_type.value
        
        columns.append(column_info)
    
    return GenericResponse(code=200, message="获取成功", data=columns)

@app.get("/api/data-definitions/{dd_id}/data", response_model=GenericResponse)
def get_dynamic_data(
    dd_id: int,
    page: int = 1,
    page_size: int = 20,
    filters: Optional[str] = None,
    db: Session = Depends(get_db)
):
    dd = db.query(DataDefinition).options(joinedload(DataDefinition.attributes)).filter(DataDefinition.id == dd_id).first()
    if not dd:
        raise HTTPException(status_code=404, detail="数据定义不存在")
    if not dd.is_defined:
        raise HTTPException(status_code=400, detail="数据定义尚未完成")
    
    table_name = dd.code_name
    count_sql = f"SELECT COUNT(*) as total FROM `{table_name}`"
    filter_sql = ""
    params = {}
    
    if filters:
        try:
            filter_dict = json.loads(filters)
            conditions = []
            for key, value in filter_dict.items():
                conditions.append(f"`{key}` LIKE :{key}")
                params[key] = f"%{value}%"
            if conditions:
                filter_sql = " WHERE " + " AND ".join(conditions)
        except:
            pass
    
    count_result = db.execute(text(count_sql + filter_sql), params)
    total = count_result.fetchone()[0] if count_result.rowcount > 0 else 0
    
    offset = (page - 1) * page_size
    select_sql = f"SELECT * FROM `{table_name}`{filter_sql} ORDER BY id DESC LIMIT :limit OFFSET :offset"
    params["limit"] = page_size
    params["offset"] = offset
    result = db.execute(text(select_sql), params)
    
    columns = result.keys()
    data_list = []
    for row in result.fetchall():
        row_dict = {}
        for i, col in enumerate(columns):
            row_dict[col] = row[i]
        row_dict.pop("id", None)
        data_list.append(row_dict)
    
    return GenericResponse(code=200, message="获取成功", data={
        "list": data_list,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    })

@app.post("/api/data-definitions/{dd_id}/data", response_model=GenericResponse)
def create_dynamic_data(dd_id: int, data: DynamicDataCreate, db: Session = Depends(get_db)):
    dd = db.query(DataDefinition).options(joinedload(DataDefinition.attributes)).filter(DataDefinition.id == dd_id).first()
    if not dd:
        raise HTTPException(status_code=404, detail="数据定义不存在")
    if not dd.is_defined:
        raise HTTPException(status_code=400, detail="数据定义尚未完成")
    
    table_name = dd.code_name
    data_dict = data.data
    
    if "data_id" not in data_dict or not data_dict.get("data_id"):
        import uuid
        data_dict["data_id"] = str(uuid.uuid4())[:8]
    
    columns = []
    values = []
    placeholders = []
    for key, value in data_dict.items():
        columns.append(f"`{key}`")
        values.append(value)
        placeholders.append(f":{key}")
    
    insert_sql = f"INSERT INTO `{table_name}` ({', '.join(columns)}) VALUES ({', '.join(placeholders)})"
    
    try:
        db.execute(text(insert_sql), data_dict)
        db.commit()
        return GenericResponse(code=200, message="创建成功", data=data_dict)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"创建失败: {str(e)}")

@app.put("/api/data-definitions/{dd_id}/data/{data_id}", response_model=GenericResponse)
def update_dynamic_data(dd_id: int, data_id: str, data: DynamicDataUpdate, db: Session = Depends(get_db)):
    dd = db.query(DataDefinition).options(joinedload(DataDefinition.attributes)).filter(DataDefinition.id == dd_id).first()
    if not dd:
        raise HTTPException(status_code=404, detail="数据定义不存在")
    if not dd.is_defined:
        raise HTTPException(status_code=400, detail="数据定义尚未完成")
    
    table_name = dd.code_name
    data_dict = data.data
    
    if not data_dict:
        raise HTTPException(status_code=400, detail="更新数据不能为空")
    
    set_clauses = []
    for key in data_dict.keys():
        set_clauses.append(f"`{key}` = :{key}")
    
    update_sql = f"UPDATE `{table_name}` SET {', '.join(set_clauses)} WHERE data_id = :where_data_id"
    params = {**data_dict, "where_data_id": data_id}
    
    try:
        result = db.execute(text(update_sql), params)
        db.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="数据不存在")
        return GenericResponse(code=200, message="更新成功", data=data_dict)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"更新失败: {str(e)}")

@app.delete("/api/data-definitions/{dd_id}/data/{data_id}", response_model=GenericResponse)
def delete_dynamic_data(dd_id: int, data_id: str, db: Session = Depends(get_db)):
    dd = db.query(DataDefinition).options(joinedload(DataDefinition.attributes)).filter(DataDefinition.id == dd_id).first()
    if not dd:
        raise HTTPException(status_code=404, detail="数据定义不存在")
    if not dd.is_defined:
        raise HTTPException(status_code=400, detail="数据定义尚未完成")
    
    table_name = dd.code_name
    delete_sql = f"DELETE FROM `{table_name}` WHERE data_id = :data_id"
    
    try:
        result = db.execute(text(delete_sql), {"data_id": data_id})
        db.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="数据不存在")
        return GenericResponse(code=200, message="删除成功", data=None)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")

@app.get("/api/query-statements", response_model=GenericResponse)
def get_query_statements(
    is_enabled: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(QueryStatement)
    if is_enabled is not None:
        query = query.filter(QueryStatement.is_enabled == is_enabled)
    qs_list = query.order_by(QueryStatement.id.desc()).all()
    return GenericResponse(code=200, message="获取成功", data=[QueryStatementResponse.model_validate(qs) for qs in qs_list])

@app.get("/api/query-statements/{qs_id}", response_model=GenericResponse)
def get_query_statement(qs_id: int, db: Session = Depends(get_db)):
    qs = db.query(QueryStatement).filter(QueryStatement.id == qs_id).first()
    if not qs:
        raise HTTPException(status_code=404, detail="查询语句不存在")
    return GenericResponse(code=200, message="获取成功", data=QueryStatementResponse.model_validate(qs))

@app.post("/api/query-statements", response_model=GenericResponse)
def create_query_statement(qs: QueryStatementCreate, db: Session = Depends(get_db)):
    db_qs = QueryStatement(**qs.model_dump())
    db.add(db_qs)
    db.commit()
    db.refresh(db_qs)
    return GenericResponse(code=200, message="创建成功", data=QueryStatementResponse.model_validate(db_qs))

@app.put("/api/query-statements/{qs_id}", response_model=GenericResponse)
def update_query_statement(qs_id: int, qs: QueryStatementUpdate, db: Session = Depends(get_db)):
    db_qs = db.query(QueryStatement).filter(QueryStatement.id == qs_id).first()
    if not db_qs:
        raise HTTPException(status_code=404, detail="查询语句不存在")
    update_data = qs.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_qs, key, value)
    db.commit()
    db.refresh(db_qs)
    return GenericResponse(code=200, message="更新成功", data=QueryStatementResponse.model_validate(db_qs))

@app.delete("/api/query-statements/{qs_id}", response_model=GenericResponse)
def delete_query_statement(qs_id: int, db: Session = Depends(get_db)):
    db_qs = db.query(QueryStatement).filter(QueryStatement.id == qs_id).first()
    if not db_qs:
        raise HTTPException(status_code=404, detail="查询语句不存在")
    db.delete(db_qs)
    db.commit()
    return GenericResponse(code=200, message="删除成功", data=None)

def build_select_clause(fields: List[Dict], formula_map: Dict) -> str:
    select_parts = []
    for field in fields:
        table_alias = field.get("table_alias")
        field_code = field["field_code"]
        field_alias = field.get("field_alias") or field_code
        formula_id = field.get("formula_id")
        
        if table_alias:
            base_field = f"`{table_alias}`.`{field_code}`"
        else:
            base_field = f"`{field_code}`"
        
        if formula_id and formula_id in formula_map:
            formula = formula_map[formula_id]
            select_parts.append(f"{formula.replace('{field}', base_field)} AS `{field_alias}`")
        else:
            select_parts.append(f"{base_field} AS `{field_alias}`")
    
    return ", ".join(select_parts)

def build_query_from_statement(qs: QueryStatement, db: Session) -> str:
    table_info = qs.table_info
    select_fields = qs.select_fields if qs.select_fields else []
    
    formula_map = {}
    for field in select_fields:
        formula_id = field.get("formula_id")
        if formula_id:
            formula = db.query(Formula).filter(Formula.id == formula_id).first()
            if formula:
                formula_map[formula_id] = formula.formula_logic
    
    select_clause = build_select_clause(select_fields, formula_map)
    if not select_clause:
        select_clause = "*"
    
    from_clause = ""
    if qs.query_type.value == "single":
        table_name = table_info.get("table_name", "")
        table_alias = table_info.get("table_alias", "t")
        from_clause = f"FROM `{table_name}` AS `{table_alias}`"
    else:
        joins = table_info.get("joins", [])
        if joins:
            first_join = joins[0]
            from_clause = f"FROM `{first_join['left_table']}` AS `{first_join.get('left_alias', 't1')}`"
            for join in joins:
                join_type = join.get("join_type", "INNER").upper()
                left_alias = join.get("left_alias", "t1")
                right_table = join.get("right_table", "")
                right_alias = join.get("right_alias", "t2")
                left_field = join.get("left_field", "id")
                right_field = join.get("right_field", "id")
                from_clause += f" {join_type} JOIN `{right_table}` AS `{right_alias}` ON `{left_alias}`.`{left_field}` = `{right_alias}`.`{right_field}`"
    
    where_clause = ""
    if qs.where_conditions:
        conditions = []
        for cond in qs.where_conditions:
            table_alias = cond.get("table_alias")
            field_code = cond["field_code"]
            operator = cond.get("operator", "=")
            value = cond.get("value", "")
            
            if table_alias:
                field_ref = f"`{table_alias}`.`{field_code}`"
            else:
                field_ref = f"`{field_code}`"
            
            if operator == "LIKE":
                conditions.append(f"{field_ref} LIKE '%{value}%'")
            elif operator in ("=", ">", "<", ">=", "<=", "!="):
                conditions.append(f"{field_ref} {operator} '{value}'")
        
        if conditions:
            where_clause = " WHERE " + " AND ".join(conditions)
    
    group_clause = ""
    if qs.group_by:
        group_clause = " GROUP BY " + ", ".join([f"`{g}`" for g in qs.group_by])
    
    order_clause = ""
    if qs.order_by:
        order_parts = []
        for o in qs.order_by:
            field = o.get("field", "")
            direction = o.get("direction", "ASC").upper()
            order_parts.append(f"`{field}` {direction}")
        if order_parts:
            order_clause = " ORDER BY " + ", ".join(order_parts)
    
    sql = f"SELECT {select_clause} {from_clause}{where_clause}{group_clause}{order_clause}"
    return sql

@app.post("/api/query-statements/{qs_id}/execute", response_model=GenericResponse)
def execute_query_statement(qs_id: int, db: Session = Depends(get_db)):
    qs = db.query(QueryStatement).filter(QueryStatement.id == qs_id).first()
    if not qs:
        raise HTTPException(status_code=404, detail="查询语句不存在")
    
    try:
        sql = build_query_from_statement(qs, db)
        result = db.execute(text(sql))
        columns = result.keys()
        data_list = []
        for row in result.fetchall():
            row_dict = {}
            for i, col in enumerate(columns):
                val = row[i]
                if hasattr(val, 'isoformat'):
                    row_dict[col] = val.isoformat() if val else None
                else:
                    row_dict[col] = val
            data_list.append(row_dict)
        
        return GenericResponse(code=200, message="执行成功", data={
            "sql": sql,
            "data": data_list,
            "columns": list(columns)
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询执行失败: {str(e)}")

@app.get("/api/charts", response_model=GenericResponse)
def get_charts(
    is_enabled: Optional[int] = None,
    is_default: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Chart)
    if is_enabled is not None:
        query = query.filter(Chart.is_enabled == is_enabled)
    if is_default is not None:
        query = query.filter(Chart.is_default == is_default)
    charts = query.order_by(Chart.id.desc()).all()
    return GenericResponse(code=200, message="获取成功", data=[ChartResponse.model_validate(c) for c in charts])

@app.get("/api/charts/{chart_id}", response_model=GenericResponse)
def get_chart(chart_id: int, db: Session = Depends(get_db)):
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="图表不存在")
    return GenericResponse(code=200, message="获取成功", data=ChartResponse.model_validate(chart))

@app.post("/api/charts", response_model=GenericResponse)
def create_chart(chart: ChartCreate, db: Session = Depends(get_db)):
    if chart.is_default:
        db.query(Chart).filter(Chart.is_default == 1).update({"is_default": 0})
    
    db_chart = Chart(**chart.model_dump())
    db.add(db_chart)
    db.commit()
    db.refresh(db_chart)
    return GenericResponse(code=200, message="创建成功", data=ChartResponse.model_validate(db_chart))

@app.put("/api/charts/{chart_id}", response_model=GenericResponse)
def update_chart(chart_id: int, chart: ChartUpdate, db: Session = Depends(get_db)):
    db_chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not db_chart:
        raise HTTPException(status_code=404, detail="图表不存在")
    
    if chart.is_default:
        db.query(Chart).filter(Chart.is_default == 1).update({"is_default": 0})
    
    update_data = chart.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_chart, key, value)
    db.commit()
    db.refresh(db_chart)
    return GenericResponse(code=200, message="更新成功", data=ChartResponse.model_validate(db_chart))

@app.delete("/api/charts/{chart_id}", response_model=GenericResponse)
def delete_chart(chart_id: int, db: Session = Depends(get_db)):
    db_chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not db_chart:
        raise HTTPException(status_code=404, detail="图表不存在")
    db.delete(db_chart)
    db.commit()
    return GenericResponse(code=200, message="删除成功", data=None)

@app.post("/api/charts/get-data", response_model=GenericResponse)
def get_chart_data(request: ChartDataRequest, db: Session = Depends(get_db)):
    qs = db.query(QueryStatement).filter(QueryStatement.id == request.query_statement_id).first()
    if not qs:
        raise HTTPException(status_code=404, detail="查询语句不存在")
    
    try:
        sql = build_query_from_statement(qs, db)
        result = db.execute(text(sql))
        columns = result.keys()
        data_list = []
        for row in result.fetchall():
            row_dict = {}
            for i, col in enumerate(columns):
                val = row[i]
                if hasattr(val, 'isoformat'):
                    row_dict[col] = val.isoformat() if val else None
                else:
                    row_dict[col] = val
            data_list.append(row_dict)
        
        return GenericResponse(code=200, message="获取成功", data={
            "data": data_list,
            "columns": list(columns),
            "query_name": qs.query_name
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取图表数据失败: {str(e)}")

@app.get("/api/charts/default/data", response_model=GenericResponse)
def get_default_chart_data(db: Session = Depends(get_db)):
    default_chart = db.query(Chart).filter(Chart.is_default == 1, Chart.is_enabled == 1).first()
    
    if default_chart:
        qs = db.query(QueryStatement).filter(QueryStatement.id == default_chart.query_statement_id).first()
        if qs:
            try:
                sql = build_query_from_statement(qs, db)
                result = db.execute(text(sql))
                columns = result.keys()
                data_list = []
                for row in result.fetchall():
                    row_dict = {}
                    for i, col in enumerate(columns):
                        val = row[i]
                        if hasattr(val, 'isoformat'):
                            row_dict[col] = val.isoformat() if val else None
                        else:
                            row_dict[col] = val
                    data_list.append(row_dict)
                
                return GenericResponse(code=200, message="获取成功", data={
                    "chart_id": default_chart.id,
                    "chart_name": default_chart.chart_name,
                    "chart_type": default_chart.chart_type.value,
                    "chart_config": default_chart.chart_config,
                    "query_name": qs.query_name,
                    "data": data_list,
                    "columns": list(columns)
                })
            except Exception as e:
                pass
    
    return GenericResponse(code=200, message="无默认图表", data={
        "chart_id": None,
        "chart_name": None,
        "chart_type": "table",
        "chart_config": {},
        "query_name": None,
        "data": [],
        "columns": []
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.API_PORT, reload=True)
