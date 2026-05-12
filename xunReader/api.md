# 迅读 - 后端 API 文档

## 通用说明

### 基础地址
- 开发环境：`https://dev-api.xunreader.com`
- 生产环境：`https://api.xunreader.com`

### 请求方式
- 统一使用 POST 请求
- Content-Type: application/json

### 公共请求参数
所有接口请求体中必须包含以下参数：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| deviceId | string | 是 | 用户主机唯一标识（由客户端生成并持久化存储） |

### 响应格式
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

| 参数名 | 类型 | 说明 |
|--------|------|------|
| code | number | 状态码，0 表示成功，非 0 表示失败 |
| message | string | 提示信息 |
| data | any | 响应数据 |

---

## 1. 付费相关接口

### 1.1 查询付费状态
- **接口地址**：`/payment/check`
- **描述**：查询当前设备是否已付费

**请求参数**：
```json
{
  "deviceId": "xxx"
}
```

**响应数据**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "isPaid": false,
    "plan": "free",
    "expireAt": null
  }
}
```

| 参数名 | 类型 | 说明 |
|--------|------|------|
| isPaid | boolean | 是否已付费 |
| plan | string | 套餐类型：free/basic/pro |
| expireAt | string | 过期时间，null 表示永久有效或未付费 |

---

## 2. 云书城接口

### 2.1 获取书城列表
- **接口地址**：`/bookstore/list`
- **描述**：获取云书城书籍列表

**请求参数**：
```json
{
  "deviceId": "xxx",
  "page": 1,
  "pageSize": 20,
  "category": "全部"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |
| category | string | 否 | 分类筛选 |

**响应数据**：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "book-001",
      "title": "斗破苍穹",
      "author": "天蚕土豆",
      "cover": "https://xxx/cover.jpg",
      "description": "这里是属于斗气的世界...",
      "isCompleted": true,
      "lastUpdate": "2024-01-15"
    }
  ]
}
```

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | string | 书籍 ID |
| title | string | 书名 |
| author | string | 作者 |
| cover | string | 封面图片 URL |
| description | string | 书籍简介 |
| isCompleted | boolean | 是否完结 |
| lastUpdate | string | 最后更新日期 |

---

### 2.2 获取书籍详情
- **接口地址**：`/book/detail`
- **描述**：获取书籍详细信息及目录

**请求参数**：
```json
{
  "deviceId": "xxx",
  "bookId": "book-001"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| bookId | string | 是 | 书籍 ID |

**响应数据**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "book-001",
    "title": "斗破苍穹",
    "author": "天蚕土豆",
    "cover": "https://xxx/cover.jpg",
    "description": "这里是属于斗气的世界...",
    "isCompleted": true,
    "lastUpdate": "2024-01-15",
    "chapters": [
      {
        "id": "ch-001",
        "title": "第一章 陨落的天才",
        "content": "章节内容...",
        "index": 0
      }
    ]
  }
}
```

| 参数名 | 类型 | 说明 |
|--------|------|------|
| chapters | array | 章节列表 |
| chapters[].id | string | 章节 ID |
| chapters[].title | string | 章节标题 |
| chapters[].content | string | 章节内容 |
| chapters[].index | number | 章节索引 |

---

## 3. AI 智能解析接口

### 3.1 解析链接
- **接口地址**：`/ai/parse`
- **描述**：AI 智能解析在线小说链接

**请求参数**：
```json
{
  "deviceId": "xxx",
  "url": "https://xxx/book/123"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| url | string | 是 | 待解析的链接 |

**响应数据**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "type": "book",
    "data": {}
  }
}
```

| 参数名 | 类型 | 说明 |
|--------|------|------|
| type | string | 解析结果类型：`book` / `bookstore` / `chapter` |
| data | object | 解析结果数据 |

#### type = "book" 时，data 为书籍详情（见 2.2 响应）

#### type = "bookstore" 时，data 结构：
```json
{
  "id": "store-001",
  "name": "某小说网站",
  "books": [
    {
      "id": "book-001",
      "title": "书名",
      "author": "作者",
      "cover": "",
      "description": "",
      "isCompleted": false,
      "lastUpdate": ""
    }
  ]
}
```

#### type = "chapter" 时，data 结构：
```json
{
  "book": {
    "id": "book-001",
    "title": "书名",
    "author": "作者"
  },
  "chapter": {
    "id": "ch-001",
    "title": "第一章",
    "content": "章节内容",
    "index": 0
  }
}
```

---

## 4. 本地 Mock 文件说明

本地环境下，接口数据从 `mock/` 目录下的 JSON 文件读取：

| 接口 | 对应文件 |
|------|----------|
| /payment/check | mock/_payment_check.json |
| /bookstore/list | mock/_bookstore_list.json |
| /book/detail | mock/_book_detail.json |
| /ai/parse | mock/_ai_parse.json |

文件名规则：将接口路径中的 `/` 替换为 `_`，前面加 `_`。
