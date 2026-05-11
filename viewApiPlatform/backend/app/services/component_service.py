from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import Component
from app.schemas.schemas import ComponentCreate, ComponentUpdate
from app.components import PRESET_COMPONENTS

class ComponentService:
    @staticmethod
    def initialize_preset_components(db: Session):
        for preset in PRESET_COMPONENTS:
            existing = db.query(Component).filter(Component.name == preset["name"]).first()
            if not existing:
                component = Component(
                    name=preset["name"],
                    chinese_name=preset["chinese_name"],
                    description=preset["description"],
                    category=preset["category"],
                    input_schema=preset["input_schema"],
                    output_schema=preset["output_schema"],
                    code=preset["code"],
                    is_preset=preset["is_preset"]
                )
                db.add(component)
        db.commit()
    
    @staticmethod
    def get_all_components(db: Session) -> List[Component]:
        return db.query(Component).all()
    
    @staticmethod
    def get_component_by_id(db: Session, component_id: int) -> Optional[Component]:
        return db.query(Component).filter(Component.id == component_id).first()
    
    @staticmethod
    def get_component_by_name(db: Session, name: str) -> Optional[Component]:
        return db.query(Component).filter(Component.name == name).first()
    
    @staticmethod
    def create_component(db: Session, component_data: ComponentCreate) -> Component:
        component = Component(
            name=component_data.name,
            chinese_name=component_data.chinese_name,
            description=component_data.description,
            category=component_data.category,
            input_schema=component_data.input_schema,
            output_schema=component_data.output_schema,
            code=component_data.code,
            is_preset=component_data.is_preset
        )
        db.add(component)
        db.commit()
        db.refresh(component)
        return component
    
    @staticmethod
    def update_component(db: Session, component_id: int, update_data: ComponentUpdate) -> Optional[Component]:
        component = db.query(Component).filter(Component.id == component_id).first()
        if not component:
            return None
        
        if update_data.chinese_name is not None:
            component.chinese_name = update_data.chinese_name
        if update_data.description is not None:
            component.description = update_data.description
        
        db.commit()
        db.refresh(component)
        return component
    
    @staticmethod
    def delete_component(db: Session, component_id: int) -> bool:
        component = db.query(Component).filter(Component.id == component_id).first()
        if not component:
            return False
        
        if component.is_preset:
            return False
        
        db.delete(component)
        db.commit()
        return True

component_service = ComponentService()
