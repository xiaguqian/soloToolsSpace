# 定时任务执行平台 API 文档

## 概述

本系统是一个定时任务执行平台，对外提供RESTful API接口，支持三种任务执行类型：
- **本地命令调用 (LOCAL_SHELL)**：执行预配置的Shell脚本
- **本地代码调用 (LOCAL_CODE)**：执行Spring容器中的Bean方法
- **远程HTTP调用 (REMOTE_HTTP)**：发起远程HTTP POST请求

所有API的Base URL：`http://localhost:8080/api`

---

## 通用说明

### 请求头
所有请求需包含：
- `Content-Type: application/json`

### 响应格式
```json
{
  "timestamp": "2024-01-01T12:00:00",
  "status": 200,
  "data": {}
}
```

---

## 1. 任务执行接口

### 1.1 执行任务

**URL**: `POST /api/tasks/execute`

**功能**: 立即执行一个任务

**请求参数**:

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| jobId | String | 是 | 任务唯一ID，用于记录日志 |
| jobName | String | 是 | 任务名称，用于记录日志 |
| taskType | Enum | 是 | 任务类型：LOCAL_SHELL, LOCAL_CODE, REMOTE_HTTP |
| commandDetail | String | 是 | 命令详情（根据任务类型有不同含义） |
| parameters | Map | 否 | 参数键值对，用于模板变量替换 |
| timeoutSeconds | Integer | 否 | 超时时间（秒），默认60秒 |

**任务类型说明**:

#### LOCAL_SHELL (本地Shell命令)
- `commandDetail`: Shell命令或脚本路径
- 支持模板变量：`${sys.tempDir}`, `${job.execId}`, `${param.xxx}`
- 安全限制：
  - 禁止危险命令（rm -rf /, mkfs等）
  - 脚本需位于受信任目录（默认 /opt/executor/scripts/）
  - 退出码 0 视为成功

#### LOCAL_CODE (本地代码调用)
- `commandDetail`: 格式为 `beanName.methodName`
  - 例如：`logArchiveService.execute`
- 被调用方法要求：
  - 接收一个 `Map<String, Object>` 参数
  - 返回 `TaskExecutionResult` 对象
- 示例：
  ```json
  {
    "commandDetail": "logArchiveService.execute",
    "parameters": {
      "logDir": "/var/log/app",
      "backupDir": "/backup/logs"
    }
  }
  ```

#### REMOTE_HTTP (远程HTTP调用)
- `commandDetail`: 目标URL（支持模板变量）
- 请求方法：POST
- 请求体：`parameters` 对象的JSON
- 示例：
  ```json
  {
    "commandDetail": "http://remote-service/api/notify",
    "parameters": {
      "message": "任务完成",
      "timestamp": "${job.executionTime}"
    }
  }
  ```

**模板变量支持**:

| 变量 | 说明 |
|------|------|
| ${sys.tempDir} | 系统临时目录 |
| ${job.execId} | 本次执行的唯一ID |
| ${job.id} | 任务ID |
| ${job.executionTime} | 执行时间戳 |
| ${param.xxx} | 从parameters中获取的参数 |

**请求示例**:

**示例1 - 执行Shell脚本**
```json
{
  "jobId": "job-001",
  "jobName": "服务健康检查",
  "taskType": "LOCAL_SHELL",
  "commandDetail": "/opt/executor/scripts/health_check.sh my-service java 8080 http://localhost:8080/health 80 80",
  "timeoutSeconds": 30
}
```

**示例2 - 执行本地代码（日志归档）**
```json
{
  "jobId": "job-002",
  "jobName": "日志归档",
  "taskType": "LOCAL_CODE",
  "commandDetail": "logArchiveService.execute",
  "parameters": {
    "logDir": "/var/log/myapp",
    "backupDir": "/backup/logs/myapp"
  },
  "timeoutSeconds": 120
}
```

**示例3 - 远程HTTP调用**
```json
{
  "jobId": "job-003",
  "jobName": "数据同步通知",
  "taskType": "REMOTE_HTTP",
  "commandDetail": "http://data-center/api/sync/notify",
  "parameters": {
    "source": "db1",
    "target": "db2",
    "execId": "${job.execId}"
  }
}
```

**响应示例** (成功):
```json
{
  "id": "a1b2c3d4e5f6",
  "jobId": "job-001",
  "jobName": "服务健康检查",
  "taskType": "LOCAL_SHELL",
  "commandDetail": "/opt/executor/scripts/health_check.sh ...",
  "parameters": null,
  "status": "SUCCESS",
  "output": "========== 服务健康检查开始 ==========\n...",
  "errorMessage": "",
  "exitCode": 0,
  "durationMs": 2500,
  "startTime": "2024-01-01T10:00:00",
  "endTime": "2024-01-01T10:00:02"
}
```

**响应字段说明**:

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | String | 执行记录唯一ID |
| jobId | String | 任务ID |
| jobName | String | 任务名称 |
| taskType | Enum | 任务类型 |
| commandDetail | String | 执行的命令详情 |
| parameters | Map | 执行时的参数 |
| status | Enum | 执行状态：SUCCESS, FAILED, TIMEOUT, SECURITY_REJECTED |
| output | String | 标准输出（stdout + stderr） |
| errorMessage | String | 错误信息 |
| exitCode | Long | 退出码 |
| durationMs | Long | 执行耗时（毫秒） |
| startTime | LocalDateTime | 开始时间 |
| endTime | LocalDateTime | 结束时间 |

**错误响应**:
- 400 Bad Request: 参数校验失败
- 500 Internal Server Error: 服务器内部错误

---

## 2. 日志查询接口

### 2.1 查询所有执行日志

**URL**: `GET /api/tasks/logs`

**功能**: 获取所有任务执行日志（按时间倒序）

**响应示例**:
```json
[
  {
    "id": "a1b2c3d4",
    "jobId": "job-001",
    "jobName": "服务健康检查",
    "taskType": "LOCAL_SHELL",
    "status": "SUCCESS",
    "durationMs": 2500,
    "startTime": "2024-01-01T10:00:00"
  }
]
```

---

### 2.2 按ID查询日志

**URL**: `GET /api/tasks/logs/{id}`

**功能**: 根据执行记录ID查询详细日志

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | String | 执行记录ID |

**响应**: 同任务执行接口的响应格式

**错误响应**:
- 404 Not Found: 日志不存在

---

### 2.3 按任务ID查询日志

**URL**: `GET /api/tasks/logs/job/{jobId}`

**功能**: 查询指定任务ID的所有执行记录

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| jobId | String | 任务ID |

**响应示例**:
```json
[
  {
    "id": "log-001",
    "jobId": "job-001",
    "jobName": "服务健康检查",
    "taskType": "LOCAL_SHELL",
    "status": "SUCCESS",
    "startTime": "2024-01-01T10:00:00"
  }
]
```

---

### 2.4 按任务名称查询日志

**URL**: `GET /api/tasks/logs/name/{jobName}`

**功能**: 查询指定任务名称的所有执行记录

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| jobName | String | 任务名称 |

---

### 2.5 按日期查询日志

**URL**: `GET /api/tasks/logs/date/{date}`

**功能**: 查询指定日期的所有执行记录

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| date | String | 日期，格式：yyyy-MM-dd |

**示例**: `GET /api/tasks/logs/date/2024-01-01`

---

## 3. 预定义功能

### 3.1 本地代码服务

#### 日志归档服务 (logArchiveService)

**Bean名称**: `logArchiveService`

**方法**: `execute(Map<String, Object> params)`

**参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| logDir | String | 是 | 源日志目录路径 |
| backupDir | String | 是 | 备份目录路径 |

**功能**:
1. 将指定目录中的所有文件打包为zip
2. 保存到备份目录，文件名格式：`logs_archive_yyyyMMdd_HHmmss.zip`
3. 删除源目录中的所有文件

**示例调用**:
```json
{
  "jobId": "archive-001",
  "jobName": "应用日志归档",
  "taskType": "LOCAL_CODE",
  "commandDetail": "logArchiveService.execute",
  "parameters": {
    "logDir": "/var/log/myapp",
    "backupDir": "/backup/logs"
  }
}
```

---

### 3.2 Shell脚本

#### 服务健康检查脚本 (health_check.sh)

**脚本路径**: `/opt/executor/scripts/health_check.sh`

**参数**:
| 序号 | 参数 | 必填 | 说明 |
|------|------|------|------|
| 1 | 服务名称 | 是 | 服务标识名 |
| 2 | 进程名 | 否 | 用于进程检查的名称 |
| 3 | 端口号 | 否 | 用于端口监听检查 |
| 4 | HTTP健康检查URL | 否 | 健康端点 |
| 5 | CPU阈值 | 否 | 默认80% |
| 6 | 内存阈值 | 否 | 默认80% |

**功能**:
1. 检查进程是否存在
2. 检查进程CPU/内存使用率（超过阈值告警）
3. 检查端口是否在监听
4. 检查HTTP健康端点状态
5. 输出系统资源概览

**示例调用**:
```json
{
  "jobId": "health-001",
  "jobName": "应用服务健康检查",
  "taskType": "LOCAL_SHELL",
  "commandDetail": "/opt/executor/scripts/health_check.sh my-app java 8080 http://localhost:8080/actuator/health 85 80",
  "timeoutSeconds": 60
}
```

---

## 4. 配置说明

### application.yml 配置项

```yaml
task:
  executor:
    core-pool-size: 10      # 核心线程数（默认并发10）
    max-pool-size: 20       # 最大线程数
    queue-capacity: 100     # 任务队列容量
    keep-alive-seconds: 60  # 线程空闲时间
  
  shell:
    trusted-dir: /opt/executor/scripts/  # 受信任脚本目录
    timeout-seconds: 60                # 默认超时时间
    blacklist:                          # 危险命令黑名单
      - rm -rf /
      - mkfs
      - mke2fs
    allowed-user: executor              # 允许的执行用户

  system:
    temp-dir: /tmp                      # 系统临时目录
```

---

## 5. 错误码说明

### 执行状态 (status)

| 状态 | 说明 |
|------|------|
| SUCCESS | 执行成功 |
| FAILED | 执行失败 |
| TIMEOUT | 执行超时 |
| SECURITY_REJECTED | 安全检查被拒绝 |

### HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 6. 使用示例

### cURL 示例

**执行任务**:
```bash
curl -X POST http://localhost:8080/api/tasks/execute \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "daily-backup",
    "jobName": "每日备份",
    "taskType": "LOCAL_SHELL",
    "commandDetail": "/opt/executor/scripts/backup.sh",
    "timeoutSeconds": 300
  }'
```

**查询日志**:
```bash
# 查询所有日志
curl http://localhost:8080/api/tasks/logs

# 按任务ID查询
curl http://localhost:8080/api/tasks/logs/job/daily-backup

# 按日期查询
curl http://localhost:8080/api/tasks/logs/date/2024-01-01
```

---

## 7. 项目结构

```
taskSchedulingPlatformApi/
├── pom.xml
├── src/main/java/com/task/scheduling/
│   ├── TaskSchedulingApplication.java  # 启动类
│   ├── config/                         # 配置类
│   │   ├── ExecutorProperties.java
│   │   ├── ShellProperties.java
│   │   ├── SystemProperties.java
│   │   └── ThreadPoolConfig.java
│   ├── controller/                     # 控制器
│   │   └── TaskController.java
│   ├── dto/                            # 数据传输对象
│   │   ├── TaskExecutionResult.java
│   │   └── TaskRequest.java
│   ├── entity/                         # 实体类
│   │   └── TaskLog.java
│   ├── enums/                          # 枚举
│   │   ├── TaskStatus.java
│   │   └── TaskType.java
│   ├── exception/                      # 异常处理
│   │   └── GlobalExceptionHandler.java
│   ├── executor/                       # 执行器
│   │   ├── LocalCodeExecutor.java
│   │   ├── RemoteHttpExecutor.java
│   │   └── ShellExecutor.java
│   ├── service/                        # 服务层
│   │   ├── LogArchiveService.java
│   │   ├── TaskExecutionService.java
│   │   └── TaskLogService.java
│   └── util/                           # 工具类
│       └── TemplateResolver.java
├── src/main/resources/
│   └── application.yml
├── scripts/                            # Shell脚本
│   └── health_check.sh
└── api.md                              # API文档
```
