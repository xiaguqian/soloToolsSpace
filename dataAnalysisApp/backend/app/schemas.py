from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime
from .models import DimensionValueTypes, QueryTypes, ChartTypes, AttributeTypes

class DimensionBase(BaseModel):
    dimension_code: str = Field(..., max_length=50)
    dimension_name: str = Field(..., max_length=100)
    value_type: DimensionValueTypes = DimensionValueTypes.STRING
    description: Optional[str] = None

class DimensionCreate(DimensionBase):
    pass

class DimensionUpdate(BaseModel):
    dimension_name: Optional[str] = Field(None, max_length=100)
    value_type: Optional[DimensionValueTypes] = None
    description: Optional[str] = None
    is_enabled: Optional[int] = None

class DimensionResponse(DimensionBase):
    id: int
    is_enabled: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    category_code: str = Field(..., max_length=50)
    category_name: str = Field(..., max_length=100)
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    category_name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    is_enabled: Optional[int] = None

class CategoryResponse(CategoryBase):
    id: int
    is_enabled: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FormulaBase(BaseModel):
    formula_code: str = Field(..., max_length=50)
    formula_name: str = Field(..., max_length=100)
    formula_logic: str
    description: Optional[str] = None

class FormulaCreate(FormulaBase):
    pass

class FormulaUpdate(BaseModel):
    formula_name: Optional[str] = Field(None, max_length=100)
    formula_logic: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[int] = None

class FormulaResponse(FormulaBase):
    id: int
    is_enabled: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DataDefinitionAttributeCreate(BaseModel):
    attribute_code: str = Field(..., max_length=50)
    attribute_name: str = Field(..., max_length=100)
    attribute_type: AttributeTypes
    dimension_id: Optional[int] = None
    referenced_data_definition_id: Optional[int] = None
    sort_order: int = 0

class DataDefinitionAttributeResponse(BaseModel):
    id: int
    attribute_code: str
    attribute_name: str
    attribute_type: str
    dimension_id: Optional[int] = None
    referenced_data_definition_id: Optional[int] = None
    sort_order: int
    dimension_code: Optional[str] = None
    dimension_name: Optional[str] = None
    value_type: Optional[str] = None
    referenced_code_name: Optional[str] = None

    class Config:
        from_attributes = True

class DataDefinitionIndexCreate(BaseModel):
    attribute_code: str = Field(..., max_length=50)
    index_name: Optional[str] = None
    sort_order: int = 0

class DataDefinitionIndexResponse(BaseModel):
    id: int
    attribute_code: str
    index_name: Optional[str] = None
    sort_order: int

    class Config:
        from_attributes = True

class DataDefinitionBase(BaseModel):
    display_name: str = Field(..., max_length=100)
    code_name: str = Field(..., max_length=50)
    description: Optional[str] = None
    category_id: Optional[int] = None

class DataDefinitionCreate(DataDefinitionBase):
    attributes: List[DataDefinitionAttributeCreate] = []
    indexes: List[DataDefinitionIndexCreate] = []

class DataDefinitionUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    category_id: Optional[int] = None
    is_enabled: Optional[int] = None
    attributes: Optional[List[DataDefinitionAttributeCreate]] = None
    indexes: Optional[List[DataDefinitionIndexCreate]] = None

class DataDefinitionResponse(DataDefinitionBase):
    id: int
    is_defined: int
    is_enabled: int
    created_at: datetime
    updated_at: datetime
    attributes: List[DataDefinitionAttributeResponse] = []
    indexes: List[DataDefinitionIndexResponse] = []
    category_name: Optional[str] = None
    is_original: Optional[bool] = None

    class Config:
        from_attributes = True

class SelectField(BaseModel):
    table_alias: Optional[str] = None
    field_code: str
    field_alias: Optional[str] = None
    formula_id: Optional[int] = None
    formula_code: Optional[str] = None

class TableJoin(BaseModel):
    join_type: str
    left_table: str
    left_alias: Optional[str] = None
    right_table: str
    right_alias: Optional[str] = None
    left_field: str
    right_field: str

class WhereCondition(BaseModel):
    table_alias: Optional[str] = None
    field_code: str
    operator: str
    value: Any
    logic: Optional[str] = "AND"

class QueryStatementBase(BaseModel):
    query_name: str = Field(..., max_length=100)
    query_type: QueryTypes
    table_info: Dict[str, Any]
    select_fields: List[SelectField] = []
    where_conditions: Optional[List[WhereCondition]] = None
    group_by: Optional[List[str]] = None
    order_by: Optional[List[Dict[str, Any]]] = None

class QueryStatementCreate(QueryStatementBase):
    pass

class QueryStatementUpdate(BaseModel):
    query_name: Optional[str] = Field(None, max_length=100)
    query_type: Optional[QueryTypes] = None
    table_info: Optional[Dict[str, Any]] = None
    select_fields: Optional[List[SelectField]] = None
    where_conditions: Optional[List[WhereCondition]] = None
    group_by: Optional[List[str]] = None
    order_by: Optional[List[Dict[str, Any]]] = None
    is_enabled: Optional[int] = None

class QueryStatementResponse(QueryStatementBase):
    id: int
    is_enabled: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChartConfig(BaseModel):
    x_axis_field: Optional[str] = None
    y_axis_fields: Optional[List[str]] = None
    pie_value_field: Optional[str] = None
    pie_label_field: Optional[str] = None
    pie_display_mode: Optional[str] = "both"
    bar_group_field: Optional[str] = None
    bar_value_fields: Optional[List[str]] = None
    show_legend: Optional[bool] = True
    show_tooltip: Optional[bool] = True
    title: Optional[str] = None

class ChartBase(BaseModel):
    chart_name: str = Field(..., max_length=100)
    query_statement_id: int
    chart_type: ChartTypes
    chart_config: Dict[str, Any]
    is_default: int = 0

class ChartCreate(ChartBase):
    pass

class ChartUpdate(BaseModel):
    chart_name: Optional[str] = Field(None, max_length=100)
    query_statement_id: Optional[int] = None
    chart_type: Optional[ChartTypes] = None
    chart_config: Optional[Dict[str, Any]] = None
    is_default: Optional[int] = None
    is_enabled: Optional[int] = None

class ChartResponse(ChartBase):
    id: int
    is_enabled: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GenericResponse(BaseModel):
    code: int
    message: str
    data: Optional[Any] = None

class DynamicDataCreate(BaseModel):
    data: Dict[str, Any]

class DynamicDataUpdate(BaseModel):
    data: Dict[str, Any]

class ChartDataRequest(BaseModel):
    query_statement_id: int
    chart_type: Optional[str] = None
    chart_config: Optional[Dict[str, Any]] = None
