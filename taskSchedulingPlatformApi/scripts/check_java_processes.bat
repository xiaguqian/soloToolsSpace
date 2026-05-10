@echo off
setlocal enabledelayedexpansion

echo ============================================
echo          Java进程检查脚本
echo 检查时间: %date% %time%
echo ============================================
echo.

echo [1/4] 检查是否存在Java进程...
echo.

tasklist /FI "IMAGENAME eq java.exe" 2>nul | find /I "java.exe" >nul
if errorlevel 1 (
    echo [警告] 未找到任何Java进程
    exit /b 1
)

echo [2/4] 列出所有Java进程详细信息:
echo ==================================================
echo PID        主类/启动类
echo ==================================================

for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq java.exe" /FO LIST ^| find "PID:"') do (
    set PID=%%a
    set MAIN_CLASS=
    
    for /f "tokens=*" %%b in ('jcmd !PID! VM.command_line 2^>nul ^| findstr /v /c:"VM.command_line" /c:"^$"') do (
        set "CMD=%%b"
        set "CMD=!CMD:~39!"
        for %%c in (!CMD!) do (
            if "!MAIN_CLASS!"=="" (
                set "MAIN_CLASS=%%c"
            )
        )
    )
    
    if "!MAIN_CLASS!"=="" (
        for /f "tokens=*" %%d in ('jcmd !PID! MainClass 2^>nul ^| findstr /v /c:"MainClass" /c:"^$"') do (
            set "MAIN_CLASS=%%d"
        )
    )
    
    if "!MAIN_CLASS!"=="" (
        set "MAIN_CLASS=(未知)"
    )
    
    echo !PID!        !MAIN_CLASS!
)

echo ==================================================
echo.

echo [3/4] Java进程资源占用情况:
echo ==================================================
echo PID        内存(KB)    状态
echo ==================================================

for /f "skip=3 tokens=2,5 delims=," %%a in ('tasklist /FI "IMAGENAME eq java.exe" /FO CSV') do (
    set "PID=%%~a"
    set "MEM=%%~b"
    set "MEM=!MEM:,=!"
    echo !PID!        !MEM!    运行中
)

echo ==================================================
echo.

echo [4/4] Java版本信息:
echo ==================================================
java -version 2>&1
echo ==================================================
echo.

echo 检查完成时间: %date% %time%
echo ============================================

exit /b 0
