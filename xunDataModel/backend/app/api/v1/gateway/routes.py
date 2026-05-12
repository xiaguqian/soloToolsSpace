from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_admin_user
from app.models.models import User, APIGateway
from app.schemas.schemas import (
    APIGatewayBase, APIGatewayListResponse, APIGatewayCreate, APIGatewayUpdate,
    GatewayRequest
)
from app.crud.crud_gateway import (
    get_gateway_by_id, get_gateway_by_path, get_gateways
)
from app.crud.crud_model import get_available_models_for_user, get_model_by_id, increment_request_count
from app.crud.crud_log import create_log
from app.services.model_test import route_to_model
import httpx
import time

router = APIRouter()


@router.get("", response_model=APIGatewayListResponse)
def list_gateways(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_enabled: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    total, gateways = get_gateways(db, skip=skip, limit=limit, is_enabled=is_enabled)
    items = [{**g.__dict__, "is_enabled": g.is_enabled == 1} for g in gateways]
    return {"total": total, "items": items}


@router.post("", response_model=APIGatewayBase, status_code=201)
def create_gateway(
    gateway_in: APIGatewayCreate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    if get_gateway_by_path(db, gateway_in.path):
        raise HTTPException(status_code=400, detail="API路径已存在")
    
    gateway = APIGateway(**gateway_in.model_dump())
    db.add(gateway)
    db.commit()
    db.refresh(gateway)
    return {**gateway.__dict__, "is_enabled": gateway.is_enabled == 1}


@router.put("/{gateway_id}", response_model=APIGatewayBase)
def update_gateway(
    gateway_id: int,
    gateway_in: APIGatewayUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    gateway = get_gateway_by_id(db, gateway_id)
    if not gateway:
        raise HTTPException(status_code=404, detail="API不存在")
    
    update_data = gateway_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(gateway, field, value)
    
    db.add(gateway)
    db.commit()
    db.refresh(gateway)
    return {**gateway.__dict__, "is_enabled": gateway.is_enabled == 1}


@router.post("/{gateway_id}/toggle")
def toggle_gateway(
    gateway_id: int,
    enable: bool = Query(..., description="是否启用API"),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    gateway = get_gateway_by_id(db, gateway_id)
    if not gateway:
        raise HTTPException(status_code=404, detail="API不存在")
    
    gateway.is_enabled = 1 if enable else 0
    db.add(gateway)
    db.commit()
    return {"message": f"API已{'启用' if enable else '停用'}", "enabled": enable}


@router.post("/proxy")
async def proxy_request(
    request: Request,
    gateway_request: GatewayRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("User-Agent", "")
    start_time = time.time()
    
    models = get_available_models_for_user(db, current_user.id)
    if not models:
        log = create_log(
            db, current_user.id, None, request.url.path, request.method,
            client_ip, user_agent, 404, int((time.time() - start_time) * 1000)
        )
        raise HTTPException(status_code=404, detail="没有可用的模型")
    
    selected_model = await route_to_model(
        models,
        auto_route=gateway_request.auto_route,
        specified_model_id=gateway_request.model_id
    )
    
    if not selected_model:
        log = create_log(
            db, current_user.id, None, request.url.path, request.method,
            client_ip, user_agent, 404, int((time.time() - start_time) * 1000)
        )
        raise HTTPException(status_code=404, detail="未找到匹配的模型")
    
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {selected_model.api_key}"
        }
        if selected_model.organization_id:
            headers["OpenAI-Organization"] = selected_model.organization_id
        
        payload = {}
        if gateway_request.messages:
            payload["messages"] = gateway_request.messages
        if gateway_request.prompt:
            payload["prompt"] = gateway_request.prompt
        if gateway_request.parameters:
            payload.update(gateway_request.parameters)
        if "model" not in payload:
            payload["model"] = selected_model.name
        if selected_model.default_params:
            for k, v in selected_model.default_params.items():
                if k not in payload:
                    payload[k] = v
        
        client_kwargs = {}
        if selected_model.proxy_url:
            client_kwargs["proxies"] = selected_model.proxy_url
        
        async with httpx.AsyncClient(timeout=60.0, **client_kwargs) as client:
            response = await client.post(
                selected_model.request_url,
                headers=headers,
                json=payload
            )
        
        increment_request_count(db, selected_model)
        
        response_time = int((time.time() - start_time) * 1000)
        create_log(
            db, current_user.id, selected_model.id, request.url.path, request.method,
            client_ip, user_agent, response.status_code, response_time
        )
        
        return {
            "model_id": selected_model.id,
            "model_name": selected_model.name,
            "status_code": response.status_code,
            "response": response.json() if response.status_code == 200 else response.text,
            "response_time_ms": response_time
        }
    except Exception as e:
        response_time = int((time.time() - start_time) * 1000)
        create_log(
            db, current_user.id, selected_model.id, request.url.path, request.method,
            client_ip, user_agent, 500, response_time
        )
        raise HTTPException(status_code=500, detail=str(e))
