from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    role = Column(String(20), nullable=False, default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    data_records = relationship("DataRecord", back_populates="creator")


class Dimension(Base):
    __tablename__ = "dimensions"

    id = Column(Integer, primary_key=True, index=True)
    unique_id = Column(String(100), unique=True, index=True, nullable=False)
    english_name = Column(String(100), unique=True, index=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    default_unit = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    data_records = relationship("DataRecord", back_populates="dimension")


class ConversionRule(Base):
    __tablename__ = "conversion_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    source_unit = Column(String(50), nullable=False)
    target_unit = Column(String(50), nullable=False)
    expression = Column(Text, nullable=False)
    is_enabled = Column(Boolean, default=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class DataCategory(Base):
    __tablename__ = "data_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    data_records = relationship("DataRecord", back_populates="category")


class DataRecord(Base):
    __tablename__ = "data_records"

    id = Column(Integer, primary_key=True, index=True)
    unique_id = Column(String(100), unique=True, index=True, nullable=False)
    data_name = Column(String(200), nullable=False)
    dimension_id = Column(Integer, ForeignKey("dimensions.id"), nullable=False)
    dimension_value = Column(String(200), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    data_date = Column(DateTime, nullable=False)
    category_id = Column(Integer, ForeignKey("data_categories.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    dimension = relationship("Dimension", back_populates="data_records")
    category = relationship("DataCategory", back_populates="data_records")
    creator = relationship("User", back_populates="data_records")
