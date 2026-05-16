from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.v1.auth.routes import router as auth_router
from app.api.v1.admin.routes import router as admin_router
from app.api.v1.models.routes import router as models_router
from app.api.v1.tags.routes import router as tags_router
from app.api.v1.gateway.routes import router as gateway_router
from app.api.v1.logs.routes import router as logs_router
from app.api.v1.access.routes import router as access_router
from app.api.v1.shortcuts.routes import router as shortcuts_router

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="大模型管理平台 - 前后端分离的AI模型管理系统",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "服务运行中"}


app.include_router(auth_router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["管理员"])
app.include_router(models_router, prefix="/api/v1/models", tags=["模型管理"])
app.include_router(tags_router, prefix="/api/v1/tags", tags=["标签管理"])
app.include_router(gateway_router, prefix="/api/v1/gateway", tags=["API网关"])
app.include_router(logs_router, prefix="/api/v1/logs", tags=["请求日志"])
app.include_router(access_router, prefix="/api/v1/access", tags=["访问控制"])
app.include_router(shortcuts_router, prefix="/api/v1/shortcuts", tags=["快捷入口"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
