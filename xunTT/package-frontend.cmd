@echo off
chcp 65001 >nul
echo ============================================
echo SoloIM 前端打包脚本
echo ============================================

cd /d "%~dp0frontend"

echo.
echo [1/3] 检查 Node.js 环境...
node -v
if errorlevel 1 (
    echo 错误: 未找到 Node.js，请先安装 Node.js >= 16.x
    pause
    exit /b 1
)

echo.
echo [2/3] 安装依赖...
call npm install
if errorlevel 1 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo.
echo [3/3] 打包应用...
call npm run package
if errorlevel 1 (
    echo 错误: 打包失败
    pause
    exit /b 1
)

echo.
echo ============================================
echo 打包完成！
echo 输出目录: frontend\release
echo ============================================
pause
