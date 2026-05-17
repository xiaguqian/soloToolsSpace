@echo off
chcp 65001 >nul
echo ================================================
echo         商户管理系统启动脚本
echo ================================================
echo.

set "BACKEND_DIR=%~dp0backend"
set "FRONTEND_DIR=%~dp0frontend"

echo [步骤1/4] 检查并安装后端依赖...
cd /d "%BACKEND_DIR%"
if not exist node_modules (
    echo 正在安装后端依赖，请稍候...
    npm install
    if %errorlevel% neq 0 (
        echo 后端依赖安装失败，请手动检查
        pause
        exit /b 1
    )
) else (
    echo 后端依赖已存在，跳过安装
)

echo.
echo [步骤2/4] 检查并安装前端依赖...
cd /d "%FRONTEND_DIR%"
if not exist node_modules (
    echo 正在安装前端依赖，请稍候...
    npm install
    if %errorlevel% neq 0 (
        echo 前端依赖安装失败，请手动检查
        pause
        exit /b 1
    )
) else (
    echo 前端依赖已存在，跳过安装
)

echo.
echo [步骤3/4] 启动后端服务...
start "后端服务" cmd /k "cd /d ""%BACKEND_DIR%"" && npm run dev"
echo 后端服务已启动，等待3秒后启动前端...
timeout /t 3 /nobreak >nul

echo.
echo [步骤4/4] 启动前端服务...
start "前端服务" cmd /k "cd /d ""%FRONTEND_DIR%"" && npm run dev"

echo.
echo ================================================
echo         服务启动完成
echo ================================================
echo 后端服务: http://localhost:8031
echo 前端页面: http://localhost:8032
echo.
echo 测试账号: 13800138000 / 123456
echo ================================================
echo.
pause