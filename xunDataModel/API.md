# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:8000/api/v1`
- **认证方式**: JWT Bearer Token
- **请求格式**: `application/json`
- **响应格式**: `application/json`

## 认证流程

1. 调用登录接口获取 access_token
2. 后续请求在 Header 中添加: `Authorization: Bearer {access_token}`
3. Token 有效期默认 24 小时

---

## 1. 认证相关

### 1.1 用户注册

**POST** `/auth/register`

**请求体**:
```json
{
  "username": "string (3-50字符)",
  "email": "string (邮箱格式)",
  "password": "string (至少6位)",
  "full_name": "string (可选)"
}
```

**响应**: 返回用户信息

---

### 1.2 用户登录

**POST** `/auth/login`

**Content-Type**: `application/x-www-form-urlencoded`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**响应**:
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

---

### 1.3 获取当前用户信息

**GET** `/auth/me`

**需要认证**: 是

**响应**: 返回当前登录用户信息

---

### 1.4 更新当前用户信息

**PUT** `/auth/me`

**需要认证**: 是

**请求体**:
```json
{
  "email": "string (可选)",
  "full_name": "string (可选)"
}
```

---

### 1.5 修改密码

**POST** `/auth/change-password`

**需要认证**: 是

**请求体**:
```json
{
  "old_password": "string",
  "new_password": "string (至少6位)"
}
```

---

## 2. 模型管理

### 2.1 获取模型列表

**GET** `/models`

**需要认证**: 是

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skip | int | 否 | 偏移量，默认0 |
| limit | int | 否 | 每页数量，默认100 |
| is_enabled | bool | 否 | 筛选启用状态 |

**响应**:
```json
{
  "total": 0,
  "items": [...]
}
```

---

### 2.2 获取模型详情

**GET** `/models/{model_id}`

**需要认证**: 是

**权限**: 模型所有者或管理员

---

### 2.3 创建模型

**POST** `/models`

**需要认证**: 是

**请求体**:
```json
{
  "name": "模型名称",
  "provider_name": "模型提供商（可自定义新增）",
  "version": "gpt-4 (可选)",
  "api_type_id": 1,
  "request_url": "https://api.openai.com/v1/chat/completions",
  "api_key": "your-api-key",
  "organization_id": "org-xxx (可选)",
  "proxy_url": "http://proxy:8080 (可选)",
  "default_params": {"temperature": 0.7} (可选),
  "description": "用途说明 (可选)",
  "has_free_quota": false,
  "remaining_quota": 1000 (可选),
  "tag_ids": [1, 2, 3] (可选),
  "is_team_shared": false,
  "team_id": null (可选)
}
```

**说明**:
- `provider_name` 支持自定义，系统会自动添加到预设列表
- 模型创建后默认 `is_enabled = false`（未启用状态）

---

### 2.4 更新模型

**PUT** `/models/{model_id}`

**需要认证**: 是

**权限**: 模型所有者或管理员

**请求体**: 同创建接口，所有字段可选

---

### 2.5 删除模型

**DELETE** `/models/{model_id}`

**需要认证**: 是

**权限**: 模型所有者或管理员

---

### 2.6 测试模型连接

**POST** `/models/{model_id}/test`

**需要认证**: 是

**权限**: 模型所有者或管理员

**请求体**:
```json
{
  "message": "你好，请回复一条测试消息"
}
```

**响应**:
```json
{
  "success": true,
  "status_code": 200,
  "message": "连接测试成功",
  "response": "模型返回内容"
}
```

---

### 2.7 启用/停用模型

**POST** `/models/{model_id}/toggle?enable=true`

**需要认证**: 是

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| enable | bool | 是 | true=启用, false=停用 |

---

### 2.8 获取模型提供商列表

**GET** `/models/providers`

**需要认证**: 是

---

### 2.9 获取API类型列表

**GET** `/models/api-types`

**需要认证**: 是

---

## 3. 标签管理

### 3.1 获取标签列表

**GET** `/tags`

**需要认证**: 是

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skip | int | 否 | 偏移量 |
| limit | int | 否 | 每页数量 |
| is_active | bool | 否 | 筛选启用状态 |

---

### 3.2 创建标签

**POST** `/tags`

**需要认证**: 是

**请求体**:
```json
{
  "name": "标签名称",
  "description": "标签描述 (可选)"
}
```

---

### 3.3 更新标签

**PUT** `/tags/{tag_id}`

**需要认证**: 是

---

### 3.4 删除标签

**DELETE** `/tags/{tag_id}`

**需要认证**: 是

---

### 3.5 启用/停用标签

**POST** `/tags/{tag_id}/toggle?enable=true`

**需要认证**: 是

---

## 4. API网关

### 4.1 获取API列表

**GET** `/gateway`

**需要认证**: 是

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skip | int | 否 | 偏移量 |
| limit | int | 否 | 每页数量 |
| is_enabled | bool | 否 | 筛选启用状态 |

---

### 4.2 通过网关调用模型

**POST** `/gateway/proxy`

**需要认证**: 是

**请求体**:
```json
{
  "auto_route": true,
  "model_id": null (auto_route=false时必填),
  "messages": [{"role": "user", "content": "你好"}],
  "prompt": "文本补全提示词",
  "stream": false,
  "parameters": {"temperature": 0.7} (可选)
}
```

**自动路由逻辑**:
1. 如果设置了白名单，只有白名单内IP可访问
2. 黑名单IP直接拒绝
3. 优先选择有免费额度且额度剩余的模型
4. 其次按请求次数（热度）排序

**响应**:
```json
{
  "model_id": 1,
  "model_name": "GPT-4",
  "status_code": 200,
  "response_time_ms": 1234,
  "response": {...}
}
```

---

### 4.3 创建API端点 (管理员)

**POST** `/gateway`

**需要认证**: 是 (管理员)

**请求体**:
```json
{
  "name": "聊天补全",
  "path": "/v1/chat/completions",
  "method": "POST",
  "description": "聊天对话API"
}
```

---

### 4.4 启用/停用API端点 (管理员)

**POST** `/gateway/{gateway_id}/toggle?enable=true`

**需要认证**: 是 (管理员)

---

## 5. 请求日志

### 5.1 获取日志列表

**GET** `/logs`

**需要认证**: 是

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skip | int | 否 | 偏移量 |
| limit | int | 否 | 每页数量 |
| model_id | int | 否 | 筛选模型ID |
| source_ip | string | 否 | 筛选来源IP |

**说明**: 普通用户只能查看自己的请求日志，管理员可查看所有

---

### 5.2 获取日志统计

**GET** `/logs/stats`

**需要认证**: 是

**响应**:
```json
{
  "total_requests": 1000,
  "today_requests": 50
}
```

---

## 6. 管理员功能

### 6.1 获取用户列表

**GET** `/admin/users`

**需要认证**: 是 (管理员)

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skip | int | 否 | 偏移量 |
| limit | int | 否 | 每页数量 |
| role | string | 否 | 筛选角色: admin/team_admin/user |

---

### 6.2 获取用户详情

**GET** `/admin/users/{user_id}`

**需要认证**: 是 (管理员)

---

### 6.3 更新用户信息

**PUT** `/admin/users/{user_id}`

**需要认证**: 是 (管理员)

**请求体**:
```json
{
  "email": "string (可选)",
  "full_name": "string (可选)",
  "role": "admin/team_admin/user (可选)",
  "is_active": true/false (可选),
  "password": "string (可选，留空不修改)"
}
```

---

### 6.4 暂停/启用系统访问

**POST** `/admin/settings/system/toggle?enable=true`

**需要认证**: 是 (管理员)

**说明**: 系统暂停后，所有非管理员用户的访问将被拒绝

---

### 6.5 获取系统设置

**GET** `/admin/settings/{key}`

**需要认证**: 是 (管理员)

---

### 6.6 更新系统设置

**PUT** `/admin/settings/{key}`

**需要认证**: 是 (管理员)

**请求体**:
```json
{
  "setting_value": "string"
}
```

---

## 7. 访问控制 (管理员)

### 7.1 获取名单列表

**GET** `/access`

**需要认证**: 是 (管理员)

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | whitelist/blacklist |
| skip | int | 否 | 偏移量 |
| limit | int | 否 | 每页数量 |

---

### 7.2 添加名单

**POST** `/access`

**需要认证**: 是 (管理员)

**请求体**:
```json
{
  "type": "whitelist/blacklist",
  "ip_address": "192.168.1.1",
  "description": "备注说明 (可选)"
}
```

---

### 7.3 删除名单

**DELETE** `/access/{access_id}`

**需要认证**: 是 (管理员)

---

## 错误响应格式

```json
{
  "detail": "错误描述信息"
}
```

## HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或Token过期 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 503 | 系统维护中（管理员暂停了系统） |

---

## Python调用示例

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# 1. 登录获取Token
login_data = {
    "username": "admin",
    "password": "admin123"
}
response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
token = response.json()["access_token"]

headers = {"Authorization": f"Bearer {token}"}

# 2. 创建模型
model_data = {
    "name": "我的GPT-4",
    "provider_name": "OpenAI",
    "api_type_id": 1,
    "request_url": "https://api.openai.com/v1/chat/completions",
    "api_key": "sk-xxx"
}
response = requests.post(f"{BASE_URL}/models", json=model_data, headers=headers)
model_id = response.json()["id"]

# 3. 测试模型
test_data = {"message": "你好"}
response = requests.post(f"{BASE_URL}/models/{model_id}/test", json=test_data, headers=headers)

# 4. 启用模型
response = requests.post(f"{BASE_URL}/models/{model_id}/toggle?enable=true", headers=headers)

# 5. 通过网关调用
proxy_data = {
    "auto_route": True,
    "messages": [{"role": "user", "content": "你好"}]
}
response = requests.post(f"{BASE_URL}/gateway/proxy", json=proxy_data, headers=headers)
print(response.json())
```

---

## JavaScript调用示例

```javascript
import axios from 'axios'

const BASE_URL = 'http://localhost:8000/api/v1'

// 登录
const login = async (username, password) => {
  const formData = new FormData()
  formData.append('username', username)
  formData.append('password', password)
  
  const response = await axios.post(`${BASE_URL}/auth/login`, formData)
  const token = response.data.access_token
  localStorage.setItem('token', token)
  return token
}

// 创建Axios实例
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})

// 获取模型列表
const getModels = async () => {
  const response = await api.get('/models')
  return response.data
}

// 测试模型连接
const testModel = async (modelId, message) => {
  const response = await api.post(`/models/${modelId}/test`, { message })
  return response.data
}

// 通过网关调用
const proxyCall = async (messages, autoRoute = true, modelId = null) => {
  const response = await api.post('/gateway/proxy', {
    auto_route: autoRoute,
    model_id: modelId,
    messages
  })
  return response.data
}
```
