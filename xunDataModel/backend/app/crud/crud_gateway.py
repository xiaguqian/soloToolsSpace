from sqlalchemy.orm import Session
from typing import Optional
from app.models.models import APIGateway, SystemSetting


def get_gateway_by_id(db: Session, gateway_id: int) -> Optional[APIGateway]:
    return db.query(APIGateway).filter(APIGateway.id == gateway_id).first()


def get_gateway_by_path(db: Session, path: str) -> Optional[APIGateway]:
    return db.query(APIGateway).filter(APIGateway.path == path).first()


def get_gateways(db: Session, skip: int = 0, limit: int = 100, is_enabled: Optional[bool] = None) -> tuple:
    query = db.query(APIGateway)
    if is_enabled is not None:
        query = query.filter(APIGateway.is_enabled == (1 if is_enabled else 0))
    total = query.count()
    gateways = query.offset(skip).limit(limit).all()
    return total, gateways


def get_system_setting(db: Session, key: str) -> Optional[SystemSetting]:
    return db.query(SystemSetting).filter(SystemSetting.setting_key == key).first()


def update_system_setting(db: Session, key: str, value: str) -> SystemSetting:
    setting = get_system_setting(db, key)
    if not setting:
        setting = SystemSetting(setting_key=key, setting_value=value)
        db.add(setting)
    else:
        setting.setting_value = value
        db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting


def is_system_enabled(db: Session) -> bool:
    setting = get_system_setting(db, "system_enabled")
    return setting.setting_value == "1" if setting else True
