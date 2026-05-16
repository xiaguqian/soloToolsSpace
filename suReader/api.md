# SuReader API 接口文档

## 接口基础信息

- **基础URL**: `https://api.sureader.com`
- **认证方式**: 请求头携带 `X-Machine-Id` (主机唯一标识)
- **响应格式**: JSON

## 接口列表

### 1. 获取书籍列表

**接口地址**: `GET /books`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| page | int | 否 | 页码，默认1 |
| size | int | 否 | 每页数量，默认20 |
| category | string | 否 | 分类筛选 |
| keyword | string | 否 | 搜索关键词 |

**请求示例**:
```
GET /books?page=1&size=20
```

**成功响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "author": "string",
      "cover": "string",
      "description": "string",
      "updateTime": "string",
      "isCompleted": "boolean",
      "category": "string",
      "wordCount": "string"
    }
  ],
  "total": "int"
}
```

---

### 2. 获取书籍详情

**接口地址**: `GET /books/{bookId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| bookId | string | 是 | 书籍ID |

**成功响应**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "author": "string",
    "cover": "string",
    "description": "string",
    "updateTime": "string",
    "isCompleted": "boolean",
    "category": "string",
    "wordCount": "string",
    "chapters": [
      {
        "id": "string",
        "title": "string",
        "wordCount": "int"
      }
    ]
  }
}
```

---

### 3. AI链接解析

**接口地址**: `POST /parser/url`

**请求体**:
```json
{
  "url": "string"
}
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "type": "string",
    "book": {
      "id": "string",
      "name": "string",
      "author": "string",
      "cover": "string",
      "description": "string",
      "updateTime": "string",
      "isCompleted": "boolean",
      "category": "string",
      "wordCount": "string"
    },
    "books": [],
    "chapterId": "string",
    "title": "string",
    "content": "string"
  }
}
```

**type说明**:
- `book`: 书籍页面
- `store`: 书城页面
- `chapter`: 章节页面

---

### 4. 检查付费状态

**接口地址**: `GET /payment/status`

**成功响应**:
```json
{
  "success": true,
  "data": {
    "isPaid": "boolean",
    "expiresAt": "string",
    "features": ["string"]
  }
}
```

---

### 5. 获取阅读历史

**接口地址**: `GET /history`

**成功响应**:
```json
{
  "success": true,
  "data": [
    {
      "bookId": "string",
      "bookName": "string",
      "cover": "string",
      "progress": "int",
      "readTime": "string"
    }
  ]
}
```

---

### 6. 保存阅读历史

**接口地址**: `POST /history`

**请求体**:
```json
{
  "bookId": "string",
  "progress": "int"
}
```

**成功响应**:
```json
{
  "success": true,
  "message": "保存成功"
}
```

---

### 7. 获取书架

**接口地址**: `GET /shelf`

**成功响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "books": [
        {
          "id": "string",
          "name": "string",
          "author": "string",
          "cover": "string"
        }
      ],
      "isDefault": "boolean"
    }
  ]
}
```

---

### 8. 更新书架

**接口地址**: `PUT /shelf`

**请求体**:
```json
{
  "groups": [
    {
      "id": "string",
      "name": "string",
      "books": ["string"],
      "isDefault": "boolean"
    }
  ]
}
```

**成功响应**:
```json
{
  "success": true,
  "message": "更新成功"
}
```

---

## 错误响应格式

```json
{
  "success": false,
  "message": "错误信息",
  "code": "int"
}
```

## 错误码说明

| 错误码 | 说明 |
| :--- | :--- |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |
