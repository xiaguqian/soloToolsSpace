#!/bin/bash

# 服务健康检查脚本
# 功能：检查指定服务的活性（进程状态、端口、HTTP健康端点）
# 参数：
#   $1 - 服务名称
#   $2 - 进程名称（可选）
#   $3 - 端口号（可选）
#   $4 - HTTP健康检查URL（可选）
#   $5 - CPU阈值百分比（默认80）
#   $6 - 内存阈值百分比（默认80）

SERVICE_NAME="${1:-unknown}"
PROCESS_NAME="${2:-}"
PORT="${3:-}"
HEALTH_URL="${4:-}"
CPU_THRESHOLD="${5:-80}"
MEM_THRESHOLD="${6:-80}"

echo "========== 服务健康检查开始 =========="
echo "检查时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "服务名称: ${SERVICE_NAME}"
echo "====================================="

ALL_OK=true
ALERT_MESSAGES=()

# 1. 检查进程状态
if [ -n "${PROCESS_NAME}" ]; then
    echo ""
    echo "[1/4] 检查进程状态..."
    PID=$(pgrep -f "${PROCESS_NAME}" | head -1)
    
    if [ -n "${PID}" ]; then
        echo "✓ 进程存在，PID: ${PID}"
        
        # 获取进程资源使用
        if command -v ps &> /dev/null; then
            PROCESS_STATS=$(ps -p ${PID} -o %cpu,%mem,comm --no-headers)
            CPU_USAGE=$(echo ${PROCESS_STATS} | awk '{print $1}')
            MEM_USAGE=$(echo ${PROCESS_STATS} | awk '{print $2}')
            
            echo "  CPU使用率: ${CPU_USAGE}%"
            echo "  内存使用率: ${MEM_USAGE}%"
            
            # 检查CPU阈值
            if (( $(echo "${CPU_USAGE} > ${CPU_THRESHOLD}" | bc -l) )); then
                echo "  ⚠ CPU使用率超过阈值 (${CPU_THRESHOLD}%)"
                ALL_OK=false
                ALERT_MESSAGES+=("CPU使用率过高: ${CPU_USAGE}% (阈值: ${CPU_THRESHOLD}%)")
            fi
            
            # 检查内存阈值
            if (( $(echo "${MEM_USAGE} > ${MEM_THRESHOLD}" | bc -l) )); then
                echo "  ⚠ 内存使用率超过阈值 (${MEM_THRESHOLD}%)"
                ALL_OK=false
                ALERT_MESSAGES+=("内存使用率过高: ${MEM_USAGE}% (阈值: ${MEM_THRESHOLD}%)")
            fi
        fi
    else
        echo "✗ 进程不存在: ${PROCESS_NAME}"
        ALL_OK=false
        ALERT_MESSAGES+=("进程不存在: ${PROCESS_NAME}")
    fi
else
    echo ""
    echo "[1/4] 跳过进程检查（未提供进程名）"
fi

# 2. 检查端口状态
if [ -n "${PORT}" ]; then
    echo ""
    echo "[2/4] 检查端口状态..."
    
    if command -v netstat &> /dev/null; then
        if netstat -tlnp | grep -q ":${PORT}"; then
            echo "✓ 端口 ${PORT} 正在监听"
        else
            echo "✗ 端口 ${PORT} 未在监听"
            ALL_OK=false
            ALERT_MESSAGES+=("端口未监听: ${PORT}")
        fi
    elif command -v ss &> /dev/null; then
        if ss -tlnp | grep -q ":${PORT}"; then
            echo "✓ 端口 ${PORT} 正在监听"
        else
            echo "✗ 端口 ${PORT} 未在监听"
            ALL_OK=false
            ALERT_MESSAGES+=("端口未监听: ${PORT}")
        fi
    else
        echo "ℹ 无法检查端口状态（缺少netstat/ss命令）"
    fi
else
    echo ""
    echo "[2/4] 跳过端口检查（未提供端口号）"
fi

# 3. HTTP健康检查
if [ -n "${HEALTH_URL}" ]; then
    echo ""
    echo "[3/4] HTTP健康检查..."
    
    if command -v curl &> /dev/null; then
        HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_URL}" --connect-timeout 5 --max-time 10)
        
        if [ "${HTTP_RESPONSE}" -ge 200 ] && [ "${HTTP_RESPONSE}" -lt 300 ]; then
            echo "✓ HTTP健康检查通过，状态码: ${HTTP_RESPONSE}"
        else
            echo "✗ HTTP健康检查失败，状态码: ${HTTP_RESPONSE}"
            ALL_OK=false
            ALERT_MESSAGES+=("HTTP健康检查失败: 状态码 ${HTTP_RESPONSE}")
        fi
    else
        echo "ℹ 无法进行HTTP检查（缺少curl命令）"
    fi
else
    echo ""
    echo "[3/4] 跳过HTTP健康检查（未提供URL）"
fi

# 4. 系统资源概览
echo ""
echo "[4/4] 系统资源概览..."

if command -v free &> /dev/null; then
    MEM_INFO=$(free -m | awk 'NR==2{printf "已用: %sMB / 总计: %sMB (%.1f%%)", $3, $2, $3*100/$2}')
    echo "系统内存: ${MEM_INFO}"
fi

if command -v df &> /dev/null; then
    DISK_INFO=$(df -h / | awk 'NR==2{printf "磁盘使用: %s / %s (%s)", $3, $2, $5}')
    echo "根分区: ${DISK_INFO}"
fi

# 输出结果
echo ""
echo "========== 检查结果 =========="

if [ "${ALL_OK}" = true ]; then
    echo "✓ 所有检查项通过"
    echo "服务状态: 正常"
    EXIT_CODE=0
else
    echo "✗ 发现问题"
    echo "服务状态: 异常"
    echo ""
    echo "告警信息:"
    for msg in "${ALERT_MESSAGES[@]}"; do
        echo "  - ${msg}"
    done
    echo ""
    echo "提示: 如需发送告警，请配置告警接口"
    EXIT_CODE=1
fi

echo ""
echo "检查完成时间: $(date '+%Y-%m-%d %H:%M:%S')"

exit ${EXIT_CODE}
