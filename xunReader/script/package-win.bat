@echo off
echo ========================================
echo  XunReader Windows 打包脚本
echo ========================================
echo.

echo [1/3] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo 依赖安装失败
    exit /b 1
)

echo.
echo [2/3] 构建项目...
call npm run build
if %errorlevel% neq 0 (
    echo 构建失败
    exit /b 1
)

echo.
echo [3/3] 打包 Windows 安装包...
call npm run package:win
if %errorlevel% neq 0 (
    echo 打包失败
    exit /b 1
)

echo.
echo ========================================
echo  打包完成！
echo  输出目录: dist\
echo ========================================
pause
