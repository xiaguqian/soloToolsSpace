from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db, get_db
from app.services.component_service import component_service
from app.scheduler.scheduler_manager import scheduler_manager
from app.api import components, tasks
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = next(get_db())
    component_service.initialize_preset_components(db)
    db.close()
    
    scheduler_manager.start()
    
    yield
    
    scheduler_manager.shutdown()

app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(components.router)
app.include_router(tasks.router)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "running"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
