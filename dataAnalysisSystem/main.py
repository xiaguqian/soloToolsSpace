from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from app.database import Base, engine, SessionLocal
from app.auth import create_default_admin
from app.routers import auth, dimensions, data, conversion, analysis
import os

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    create_default_admin(db)
finally:
    db.close()

app = FastAPI(
    title="数据分析系统",
    description="支持自定义维度、度量换算和可视化分析的数据系统",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dimensions.router)
app.include_router(data.router)
app.include_router(conversion.router)
app.include_router(analysis.router)

static_dir = os.path.join(os.path.dirname(__file__), "frontend")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
def read_root():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "message": "数据分析系统 API 已启动",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
