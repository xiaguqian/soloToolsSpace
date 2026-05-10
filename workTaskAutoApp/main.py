import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from contextlib import asynccontextmanager
import redis
import json
import asyncio

from app.config import Config
from app.database import init_db
from app.routers import tasks_router, schedules_router, execution_router

os.makedirs(Config.SCREENSHOT_DIR, exist_ok=True)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

def redis_listener():
    r = redis.Redis(
        host=Config.REDIS_HOST,
        port=Config.REDIS_PORT,
        db=Config.REDIS_DB,
        password=Config.REDIS_PASSWORD,
        decode_responses=True
    )
    pubsub = r.pubsub()
    pubsub.subscribe(Config.TASK_STATUS_CHANNEL)
    
    for message in pubsub.listen():
        if message['type'] == 'message':
            asyncio.run(manager.broadcast(message['data']))

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    
    import threading
    redis_thread = threading.Thread(target=redis_listener, daemon=True)
    redis_thread.start()
    
    yield

app = FastAPI(
    title='桌面任务执行系统',
    description='基于 Python + Redis + MySQL 的桌面任务自动化执行系统',
    version='1.0.0',
    lifespan=lifespan
)

app.include_router(tasks_router)
app.include_router(schedules_router)
app.include_router(execution_router)

templates = Jinja2Templates(directory='app/templates')

@app.get('/', response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse('index.html', {'request': request})

@app.get('/tasks', response_class=HTMLResponse)
async def tasks_page(request: Request):
    return templates.TemplateResponse('tasks.html', {'request': request})

@app.get('/schedules', response_class=HTMLResponse)
async def schedules_page(request: Request):
    return templates.TemplateResponse('schedules.html', {'request': request})

@app.get('/dashboard', response_class=HTMLResponse)
async def dashboard_page(request: Request):
    return templates.TemplateResponse('dashboard.html', {'request': request})

@app.websocket('/ws/task-status')
async def websocket_task_status(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f'Received: {data}')
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
