# 前端改动说明

## 概览

本文件记录了为配合后端API实现，前端需要进行的改动。

## 需要添加的环境变量

在前端项目的环境配置文件中添加：

```
VUE_APP_API_BASE_URL=http://localhost:3000/api
```

## 认证方式

后端使用 JWT Token 认证，前端需要：

1. 登录成功后保存 Token 到 localStorage
2. 在请求头中携带 `Authorization: Bearer <token>`
3. 401/403 错误时清除 Token 并跳转到登录页

## 接口调用改动

### 景点模块

| 接口 | 改动说明 |
| --- | --- |
| GET /api/scenic/list | 添加 travelMode、lat、lng 参数支持 |
| GET /api/scenic/{id} | 响应新增 notes 字段 |
| POST /api/scenic/favorite | 需要登录 |
| POST /api/scenic/unfavorite | 需要登录 |

### 笔记模块

| 接口 | 改动说明 |
| --- | --- |
| GET /api/note/list | 支持 scenicId、userId 筛选 |
| POST /api/note/create | 需要登录，支持多图片 |
| POST /api/note/favorite | 需要登录 |
| POST /api/note/unfavorite | 需要登录 |

### 出行计划模块

| 接口 | 改动说明 |
| --- | --- |
| GET /api/plan/list | 需要登录 |
| GET /api/plan/{id} | 需要登录 |
| POST /api/plan/create | 需要登录 |
| POST /api/plan/generate-guide | 需要登录 |
| POST /api/plan/update-status | 需要登录 |

### 智能云出行模块

| 接口 | 改动说明 |
| --- | --- |
| POST /api/smart-travel/generate | 需要登录 |

### 穿搭模块

| 接口 | 改动说明 |
| --- | --- |
| POST /api/outfit/generate | 需要登录 |

### 个人图集模块

| 接口 | 改动说明 |
| --- | --- |
| GET /api/gallery/list | 需要登录 |
| POST /api/gallery/add | 需要登录 |
| POST /api/gallery/delete | 需要登录 |

### 收藏模块

| 接口 | 改动说明 |
| --- | --- |
| GET /api/favorites/list | 需要登录 |

### 用户模块

| 接口 | 改动说明 |
| --- | --- |
| POST /api/user/register | 返回 token |
| POST /api/user/login | 返回 token 和 role |
| GET /api/user/info | 需要登录 |

## 数据格式注意事项

1. **tags 字段**：后端返回为 JSON 数组字符串，前端需解析
2. **distance 字段**：仅在传入 lat/lng 时有值
3. **scenicIds/scenicNames**：后端返回为 JSON 数组字符串，前端需解析
4. **status 字段**：
   - 计划状态：pending/completed/cancelled
   - 笔记状态：active/top/offline

## 管理台

管理台已独立部署，访问地址：`http://localhost:5173`

### 默认管理员账号
- 用户名：admin
- 密码：（需在数据库中设置）

### 管理台功能
1. **景点管理**：增删改查景点信息
2. **笔记管理**：笔记下线、置顶、上线操作
3. **数据统计**：多维度数据展示