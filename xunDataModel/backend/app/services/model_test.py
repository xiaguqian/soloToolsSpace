import httpx
from typing import Optional, Dict, Any
from app.models.models import Model, APIType


async def test_model_connection(model: Model, message: str = "你好") -> Dict[str, Any]:
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {model.api_key}"
        }
        if model.organization_id:
            headers["OpenAI-Organization"] = model.organization_id
        
        payload = {
            "model": model.name,
            "messages": [{"role": "user", "content": message}],
            "max_tokens": 50
        }
        
        if model.default_params:
            payload.update(model.default_params)
        
        client_kwargs = {}
        if model.proxy_url:
            client_kwargs["proxies"] = model.proxy_url
        
        async with httpx.AsyncClient(timeout=30.0, **client_kwargs) as client:
            response = await client.post(
                model.request_url,
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "message": "连接测试成功",
                    "response": result.get("choices", [{}])[0].get("message", {}).get("content", str(result)) if "choices" in result else str(result)
                }
            else:
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "message": f"连接测试失败: HTTP {response.status_code}",
                    "response": response.text
                }
    except Exception as e:
        return {
            "success": False,
            "status_code": None,
            "message": f"连接测试异常: {str(e)}",
            "response": None
        }


async def route_to_model(
    models,
    auto_route: bool = True,
    specified_model_id: Optional[int] = None
) -> Optional[Model]:
    if specified_model_id:
        for model in models:
            if model.id == specified_model_id:
                return model
        return None
    
    if not auto_route:
        return None
    
    free_quota_models = [m for m in models if m.has_free_quota and (m.remaining_quota is None or m.remaining_quota > 0)]
    if free_quota_models:
        free_quota_models.sort(key=lambda x: x.request_count, reverse=True)
        return free_quota_models[0]
    
    popular_models = sorted(models, key=lambda x: x.request_count, reverse=True)
    return popular_models[0] if popular_models else None
