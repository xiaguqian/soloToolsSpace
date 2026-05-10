from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from app.database import Base, engine, SessionLocal, get_db
from app.auth import create_default_admin, require_admin
from app.init_db import init_sample_data
from app.routers import auth, dimensions, data, conversion, analysis
from app import models
from fastapi import Depends
import os

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    create_default_admin(db)
    init_sample_data(db)
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


@app.post("/api/reset-data")
def reset_data(db=Depends(get_db), current_user=Depends(require_admin)):
    from app.init_db import init_sample_data
    db.query(models.DataRecord).delete()
    db.query(models.DataCategory).delete()
    db.query(models.ConversionRule).delete()
    db.query(models.Dimension).filter(models.Dimension.english_name != 'region').delete()
    db.query(models.Dimension).filter(models.Dimension.english_name == 'region').delete()
    db.commit()
    init_sample_data(db)
    return {"message": "数据已重置并重新初始化"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
