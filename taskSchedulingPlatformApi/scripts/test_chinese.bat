@echo off
echo ========================================
echo        测试脚本 - 中文显示测试
echo 执行时间: %date% %time%
echo ========================================
echo.
echo [1] 测试中文输出
echo 你好，世界！这是一个测试脚本。
echo 今天是: %date%
echo.
echo [2] 列出当前目录
dir /b
echo.
echo [3] Java进程列表 (如有)
tasklist /FI "IMAGENAME eq java.exe" 2>nul | find "java.exe"
if errorlevel 1 (
    echo 未找到Java进程
)
echo.
echo ========================================
echo        测试完成
echo ========================================
exit /b 0
