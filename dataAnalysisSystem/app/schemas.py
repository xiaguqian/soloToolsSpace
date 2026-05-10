from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Any, Dict


class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    role: str = "user"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None


class DimensionBase(BaseModel):
    unique_id: str
    english_name: str
    display_name: str
    default_unit: Optional[str] = None
    description: Optional[str] = None


class DimensionCreate(DimensionBase):
    pass


class DimensionUpdate(BaseModel):
    display_name: Optional[str] = None
    default_unit: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class DimensionResponse(DimensionBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversionRuleBase(BaseModel):
    name: str
    source_unit: str
    target_unit: str
    expression: str
    description: Optional[str] = None


class ConversionRuleCreate(ConversionRuleBase):
    pass


class ConversionRuleUpdate(BaseModel):
    name: Optional[str] = None
    expression: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None


class ConversionRuleResponse(ConversionRuleBase):
    id: int
    is_enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DataCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class DataCategoryCreate(DataCategoryBase):
    pass


class DataCategoryResponse(DataCategoryBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DataRecordBase(BaseModel):
    unique_id: str
    data_name: str
    dimension_unique_id: str
    dimension_value: str
    value: float
    unit: str
    data_date: datetime
    category_name: Optional[str] = None


class DataRecordCreate(DataRecordBase):
    pass


class DataRecordUpdate(BaseModel):
    data_name: Optional[str] = None
    dimension_value: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = None
    data_date: Optional[datetime] = None


class DataRecordResponse(BaseModel):
    id: int
    unique_id: str
    data_name: str
    dimension: DimensionResponse
    dimension_value: str
    value: float
    unit: str
    data_date: datetime
    category: Optional[DataCategoryResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DataFilter(BaseModel):
    dimension_unique_ids: Optional[List[str]] = None
    dimension_values: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    units: Optional[List[str]] = None
    category_names: Optional[List[str]] = None
    data_names: Optional[List[str]] = None


class AggregationConfig(BaseModel):
    group_by: str
    group_rule: Optional[str] = None
    aggregation_func: str = "sum"


class AnalysisRequest(BaseModel):
    filters: Optional[DataFilter] = None
    aggregations: Optional[List[AggregationConfig]] = None
    target_unit: Optional[str] = None
    chart_type: str = "line"


class ChartData(BaseModel):
    chart_type: str
    title: Optional[str] = None
    x_axis: Optional[List[str]] = None
    y_axis: Optional[List[Any]] = None
    series: Optional[List[Dict[str, Any]]] = None
    categories: Optional[List[str]] = None
    values: Optional[List[float]] = None
    headers: Optional[List[str]] = None
    rows: Optional[List[List[Any]]] = None
