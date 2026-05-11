from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from datetime import datetime
from .database import Base

class Dimension(Base):
    __tablename__ = "dimensions"

    id = Column(Integer, primary_key=True, index=True)
    dimension_code = Column(String(50), unique=True, nullable=False, index=True)
    dimension_name = Column(String(100), nullable=False)
    value_type = Column(String(20), default="string", nullable=False)
    is_enabled = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    category_code = Column(String(50), unique=True, nullable=False, index=True)
    category_name = Column(String(100), nullable=False)
    description = Column(Text)
    is_enabled = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Formula(Base):
    __tablename__ = "formulas"

    id = Column(Integer, primary_key=True, index=True)
    formula_code = Column(String(50), unique=True, nullable=False, index=True)
    formula_name = Column(String(100), nullable=False)
    formula_logic = Column(Text, nullable=False)
    description = Column(Text)
    is_enabled = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DataDefinition(Base):
    __tablename__ = "data_definitions"

    id = Column(Integer, primary_key=True, index=True)
    display_name = Column(String(100), nullable=False)
    code_name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text)
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    is_defined = Column(Integer, default=0, nullable=False)
    is_enabled = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DataDefinitionAttribute(Base):
    __tablename__ = "data_definition_attributes"

    id = Column(Integer, primary_key=True, index=True)
    data_definition_id = Column(Integer, ForeignKey('data_definitions.id', ondelete='CASCADE'), nullable=False, index=True)
    attribute_code = Column(String(50), nullable=False)
    attribute_name = Column(String(100), nullable=False)
    attribute_type = Column(String(50), nullable=False)
    dimension_id = Column(Integer, ForeignKey('dimensions.id', ondelete='SET NULL'), nullable=True)
    referenced_data_definition_id = Column(Integer, ForeignKey('data_definitions.id', ondelete='SET NULL'), nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class DataDefinitionIndex(Base):
    __tablename__ = "data_definition_indexes"

    id = Column(Integer, primary_key=True, index=True)
    data_definition_id = Column(Integer, ForeignKey('data_definitions.id', ondelete='CASCADE'), nullable=False, index=True)
    attribute_code = Column(String(50), nullable=False)
    index_name = Column(String(100))
    sort_order = Column(Integer, default=0, nullable=False)

class QueryStatement(Base):
    __tablename__ = "query_statements"

    id = Column(Integer, primary_key=True, index=True)
    query_name = Column(String(100), nullable=False)
    query_type = Column(String(20), nullable=False)
    table_info = Column(JSON, nullable=False)
    select_fields = Column(JSON, nullable=False)
    where_conditions = Column(JSON)
    group_by = Column(JSON)
    order_by = Column(JSON)
    is_enabled = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Chart(Base):
    __tablename__ = "charts"

    id = Column(Integer, primary_key=True, index=True)
    chart_name = Column(String(100), nullable=False)
    query_statement_id = Column(Integer, ForeignKey('query_statements.id', ondelete='CASCADE'), nullable=False)
    chart_type = Column(String(20), nullable=False)
    chart_config = Column(JSON, nullable=False)
    is_default = Column(Integer, default=0, nullable=False)
    is_enabled = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
