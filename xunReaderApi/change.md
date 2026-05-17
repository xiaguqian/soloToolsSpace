# 前端代码改动说明

## 接口地址配置

前端需要配置后端API地址，建议在环境变量中配置：

- 开发环境：`http://localhost:8080`
- 生产环境：根据实际部署地址配置

## 接口调用改动

### 1. 书籍模块

- **获取书籍列表**: `GET /books?page=1&size=10&category=&keyword=`
- **获取书籍详情**: `GET /books/{bookId}`

### 2. AI解析模块

- **解析URL**: `POST /parser/url`
  - 请求体: `{ "url": "..." }`

### 3. 付费模块

- **获取付费状态**: `GET /payment/status`

### 4. 阅读历史模块

- **获取阅读历史**: `GET /history`
- **保存阅读历史**: `POST /history`
  - 请求体: `{ "bookId": 1, "progress": 50 }`

### 5. 书架模块

- **获取书架**: `GET /shelf`
- **更新书架**: `PUT /shelf`
  - 请求体: `{ "groups": [...] }`

## 管理台接口

管理台需要调用以下接口：

- `GET /admin/books` - 获取所有书籍
- `PUT /admin/books/{bookId}/status` - 更新书籍状态
- `DELETE /admin/books/{bookId}` - 删除书籍
- `GET /admin/books/{bookId}/chapters` - 获取书籍章节
- `PUT /admin/books/{bookId}/chapters/batch` - 批量更新章节状态
- `GET /admin/users` - 获取所有用户
- `PUT /admin/users/{userId}/role` - 更新用户角色
- `GET /admin/roles` - 获取所有角色
- `POST /admin/roles` - 创建角色
- `PUT /admin/roles/{roleId}` - 更新角色
- `DELETE /admin/roles/{roleId}` - 删除角色

## 注意事项

1. 所有接口返回的数据格式需要前端进行适配
2. 分页参数需要根据前端需求进行调整
3. 管理台需要实现用户权限控制
4. 章节内容存储方式需要根据`storageType`字段进行相应处理