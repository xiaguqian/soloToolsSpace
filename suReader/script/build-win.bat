@echo off
echo ======================================
echo SuReader Windows 打包脚本
echo ======================================

echo 1. 检查 Node.js 环境...
node --version
if %errorlevel% neq 0 (
    echo 错误: 未安装 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo.
echo 2. 安装依赖...
npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 3. 构建前端资源...
npm run build
if %errorlevel% neq 0 (
    echo 错误: 前端构建失败
    pause
    exit /b 1
)

echo.
echo 4. 打包 Electron 应用...
npm run electron:build:win
if %errorlevel% neq 0 (
    echo 错误: Electron 打包失败
    pause
    exit /b 1
)

echo.
echo ======================================
echo 打包完成！
echo 输出目录: dist/win-unpacked
echo ======================================
pause
