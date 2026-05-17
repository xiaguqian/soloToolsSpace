# 小说阅读器 API 文档

## 1. 书籍模块

### 1.1 获取书籍列表

**GET /books**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| size | int | 否 | 每页数量，默认10 |
| category | string | 否 | 分类筛选 |
| keyword | string | 否 | 关键词搜索 |

**返回示例：**
```json
{
    "list": [
        {
            "id": 1,
            "name": "小说名称",
            "author": "作者",
            "cover": "封面地址",
            "description": "简介",
            "updateTime": "2024-01-01 12:00:00",
            "isCompleted": 0,
            "category": "玄幻",
            "wordCount": 100000
        }
    ],
    "total": 100
}
```

### 1.2 获取书籍详情

**GET /books/{bookId}**

**返回示例：**
```json
{
    "id": 1,
    "name": "小说名称",
    "author": "作者",
    "cover": "封面地址",
    "description": "简介",
    "updateTime": "2024-01-01 12:00:00",
    "isCompleted": 0,
    "category": "玄幻",
    "wordCount": 100000,
    "chapters": [
        {
            "id": 1,
            "title": "第一章",
            "wordCount": 1000
        }
    ]
}
```

## 2. AI解析模块

### 2.1 解析URL

**POST /parser/url**

**请求体：**
```json
{
    "url": "http://example.com/book/1"
}
```

**返回示例：**
```json
{
    "type": "book",
    "book": {
        "id": 1,
        "name": "小说名称",
        "author": "作者",
        "cover": "封面地址",
        "description": "简介",
        "updateTime": "2024-01-01 12:00:00",
        "isCompleted": 0,
        "category": "玄幻",
        "wordCount": 100000
    },
    "books": [],
    "chapterId": 1,
    "title": "章节标题",
    "content": "章节内容"
}
```

## 3. 付费模块

### 3.1 获取付费状态

**GET /payment/status**

**返回示例：**
```json
{
    "isPaid": 0,
    "expiresAt": "2024-12-31 23:59:59",
    "features": ["basic_access"]
}
```

## 4. 阅读历史模块

### 4.1 获取阅读历史

**GET /history**

**返回示例：**
```json
[
    {
        "bookId": 1,
        "bookName": "小说名称",
        "cover": "封面地址",
        "progress": 50,
        "readTime": "2024-01-01 12:00:00"
    }
]
```

### 4.2 保存阅读历史

**POST /history**

**请求体：**
```json
{
    "bookId": 1,
    "progress": 50
}
```

**返回示例：**
```json
{
    "message": "success"
}
```

## 5. 书架模块

### 5.1 获取书架

**GET /shelf**

**返回示例：**
```json
[
    {
        "id": 1,
        "name": "默认书架",
        "books": [
            {
                "id": 1,
                "name": "小说名称",
                "author": "作者",
                "cover": "封面地址"
            }
        ],
        "isDefault": 1
    }
]
```

### 5.2 更新书架

**PUT /shelf**

**请求体：**
```json
{
    "groups": [
        {
            "id": 1,
            "name": "默认书架",
            "books": [1, 2, 3],
            "isDefault": 1
        }
    ]
}
```

**返回示例：**
```json
{
    "message": "success"
}
```

## 6. 管理台接口

### 6.1 获取所有书籍

**GET /admin/books**

### 6.2 更新书籍状态

**PUT /admin/books/{bookId}/status**

**请求体：**
```json
{
    "status": 1
}
```

### 6.3 删除书籍

**DELETE /admin/books/{bookId}**

### 6.4 获取书籍章节

**GET /admin/books/{bookId}/chapters**

### 6.5 批量更新章节状态

**PUT /admin/books/{bookId}/chapters/batch**

**请求体：**
```json
{
    "chapterIds": [1, 2, 3],
    "status": 1
}
```

### 6.6 获取所有用户

**GET /admin/users**

### 6.7 更新用户角色

**PUT /admin/users/{userId}/role**

**请求体：**
```json
{
    "role": "author"
}
```

### 6.8 获取所有角色

**GET /admin/roles**

### 6.9 创建角色

**POST /admin/roles**

**请求体：**
```json
{
    "name": "角色名称",
    "description": "角色描述"
}
```

### 6.10 更新角色

**PUT /admin/roles/{roleId}**

### 6.11 删除角色

**DELETE /admin/roles/{roleId}**