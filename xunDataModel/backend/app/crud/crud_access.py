from sqlalchemy.orm import Session
from typing import Optional
from app.models.models import AccessControl, AccessControlType
from app.schemas.schemas import AccessControlCreate


def get_access_by_id(db: Session, access_id: int) -> Optional[AccessControl]:
    return db.query(AccessControl).filter(AccessControl.id == access_id).first()


def get_access_by_ip(db: Session, ip_address: str, type: AccessControlType) -> Optional[AccessControl]:
    return db.query(AccessControl).filter(
        AccessControl.ip_address == ip_address,
        AccessControl.type == type
    ).first()


def create_access(db: Session, access_in: AccessControlCreate) -> AccessControl:
    access = AccessControl(
        type=access_in.type,
        ip_address=access_in.ip_address,
        description=access_in.description
    )
    db.add(access)
    db.commit()
    db.refresh(access)
    return access


def get_access_list(
    db: Session,
    type: Optional[AccessControlType] = None,
    skip: int = 0,
    limit: int = 100
) -> tuple:
    query = db.query(AccessControl)
    if type:
        query = query.filter(AccessControl.type == type)
    total = query.count()
    items = query.order_by(AccessControl.created_at.desc()).offset(skip).limit(limit).all()
    return total, items


def delete_access(db: Session, access: AccessControl) -> None:
    db.delete(access)
    db.commit()


def is_ip_allowed(db: Session, ip_address: str) -> bool:
    whitelist = db.query(AccessControl).filter(AccessControl.type == AccessControlType.whitelist).count()
    if whitelist > 0:
        in_whitelist = db.query(AccessControl).filter(
            AccessControl.type == AccessControlType.whitelist,
            AccessControl.ip_address == ip_address
        ).first() is not None
        if not in_whitelist:
            return False
    
    in_blacklist = db.query(AccessControl).filter(
        AccessControl.type == AccessControlType.blacklist,
        AccessControl.ip_address == ip_address
    ).first() is not None
    if in_blacklist:
        return False
    
    return True
