from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_admin_user
from app.models.models import User
from app.schemas.schemas import APIRequestLogListResponse
from app.crud.crud_log import get_logs

router = APIRouter()


@router.get("", response_model=APIRequestLogListResponse)
def list_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    model_id: Optional[int] = Query(None),
    source_ip: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user_id = None if current_user.role.value == "admin" else current_user.id
    total, logs = get_logs(db, user_id=user_id, model_id=model_id, source_ip=source_ip, skip=skip, limit=limit)
    
    items = []
    for log in logs:
        item = {
            **log.__dict__,
            "model_name": getattr(log, "model_name", None)
        }
        items.append(item)
    
    return {"total": total, "items": items}


@router.get("/stats")
def get_log_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    from sqlalchemy import func
    from app.models.models import APIRequestLog
    
    query = db.query(APIRequestLog)
    if current_user.role.value != "admin":
        query = query.filter(APIRequestLog.user_id == current_user.id)
    
    total = query.count()
    
    today_count = query.filter(
        func.date(APIRequestLog.created_at) == func.date(func.now())
    ).count()
    
    return {
        "total_requests": total,
        "today_requests": today_count
    }
