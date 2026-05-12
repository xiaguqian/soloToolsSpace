from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.models.models import APIRequestLog


def create_log(
    db: Session,
    user_id: Optional[int],
    model_id: Optional[int],
    request_path: str,
    request_method: str,
    source_ip: Optional[str],
    user_agent: Optional[str],
    status_code: Optional[int] = None,
    response_time: Optional[int] = None
) -> APIRequestLog:
    log = APIRequestLog(
        user_id=user_id,
        model_id=model_id,
        request_path=request_path,
        request_method=request_method,
        source_ip=source_ip,
        user_agent=user_agent,
        status_code=status_code,
        response_time=response_time,
        created_at=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_logs(
    db: Session,
    user_id: Optional[int] = None,
    model_id: Optional[int] = None,
    source_ip: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> tuple:
    from app.models.models import Model
    query = db.query(APIRequestLog)
    
    if user_id is not None:
        query = query.filter(APIRequestLog.user_id == user_id)
    if model_id is not None:
        query = query.filter(APIRequestLog.model_id == model_id)
    if source_ip:
        query = query.filter(APIRequestLog.source_ip == source_ip)
    
    total = query.count()
    logs = query.order_by(APIRequestLog.created_at.desc()).offset(skip).limit(limit).all()
    
    for log in logs:
        if log.model_id:
            model = db.query(Model).filter(Model.id == log.model_id).first()
            if model:
                setattr(log, "model_name", model.name)
    
    return total, logs
