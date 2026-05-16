@echo off
echo ======================================
echo SuReader 开发模式启动脚本
echo ======================================

echo 1. 检查 Node.js 环境...
node --version
if %errorlevel% neq 0 (
    echo 错误: 未安装 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo.
echo 2. 安装依赖（首次运行）...
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

echo.
echo 3. 启动开发服务器...
npm run dev
