# 巡旅游 API 接口文档

## 基础信息

### 认证方式
- JWT Token 认证
- Token 放在请求头 `Authorization: Bearer <token>`

## 景点模块

### GET /api/scenic/list
获取景点列表

**入参:**
| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| keyword | string | 否 | 搜索关键词 |
| type | string | 否 | 类型：culture/nature/amusement/historical |
| isPaid | number | 否 | 是否收费：0/1 |
| travelMode | array | 否 | 出行方式 |
| lat | number | 否 | 纬度 |
| lng | number | 否 | 经度 |

**出参:**
```json
{
  "list": [
    {
      "id": 1,
      "name": "景点名称",
      "coverImage": "封面图URL",
      "description": "描述",
      "type": "culture",
      "isPaid": 1,
      "price": 60,
      "distance": "10.5",
      "rating": 4.9,
      "height": 0,
      "tags": ["tag1", "tag2"],
      "address": "地址",
      "openTime": "开放时间"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

### GET /api/scenic/{id}
获取景点详情

**出参:**
```json
{
  "id": 1,
  "name": "景点名称",
  "images": ["url1", "url2"],
  "description": "描述",
  "rating": 4.9,
  "isPaid": 1,
  "price": 60,
  "address": "地址",
  "openTime": "开放时间",
  "type": "culture",
  "tags": ["tag1", "tag2"],
  "notes": [
    {"id": 1, "title": "笔记标题", "author": "作者"}
  ]
}
```

### POST /api/scenic/favorite
收藏景点

**入参:**
```json
{
  "scenicId": 1
}
```

### POST /api/scenic/unfavorite
取消收藏景点

**入参:**
```json
{
  "scenicId": 1
}
```

## 出行笔记模块

### GET /api/note/list
获取笔记列表

**入参:**
| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| scenicId | number | 否 | 景点ID |
| userId | number | 否 | 用户ID |

**出参:**
```json
{
  "list": [
    {
      "id": 1,
      "title": "笔记标题",
      "coverImage": "封面图",
      "author": "作者",
      "authorAvatar": "头像",
      "scenicId": 1,
      "scenicName": "景点名称",
      "createTime": "2024-01-01 12:00:00",
      "likeCount": 10,
      "commentCount": 5,
      "favoriteCount": 3
    }
  ]
}
```

### GET /api/note/{id}
获取笔记详情

**出参:**
```json
{
  "id": 1,
  "title": "笔记标题",
  "images": ["url1", "url2"],
  "content": "内容",
  "author": "作者",
  "authorAvatar": "头像",
  "scenicId": 1,
  "scenicName": "景点名称",
  "createTime": "2024-01-01 12:00:00",
  "likeCount": 10,
  "commentCount": 5,
  "favoriteCount": 3
}
```

### POST /api/note/create
创建笔记

**入参:**
```json
{
  "title": "标题",
  "content": "内容",
  "scenicId": 1,
  "images": ["url1", "url2"]
}
```

**出参:**
```json
{
  "id": 1,
  "title": "标题"
}
```

### POST /api/note/favorite
收藏笔记

**入参:**
```json
{
  "noteId": 1
}
```

### POST /api/note/unfavorite
取消收藏笔记

**入参:**
```json
{
  "noteId": 1
}
```

## 出行计划模块

### GET /api/plan/list
获取出行计划列表（需登录）

**入参:**
| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| status | string | 否 | 状态：pending/completed/cancelled |

**出参:**
```json
{
  "list": [
    {
      "id": 1,
      "name": "计划名称",
      "travelDate": "2024-01-15",
      "peopleCount": 2,
      "status": "pending",
      "scenicIds": [1, 2],
      "scenicNames": ["景点1", "景点2"],
      "createTime": "2024-01-01 12:00:00"
    }
  ]
}
```

### GET /api/plan/{id}
获取出行计划详情（需登录）

**出参:**
```json
{
  "id": 1,
  "name": "计划名称",
  "travelDate": "2024-01-15",
  "peopleCount": 2,
  "status": "pending",
  "createTime": "2024-01-01 12:00:00",
  "scenics": [
    {"id": 1, "name": "景点1", "address": "地址"}
  ],
  "guide": [{"content": "指南内容"}]
}
```

### POST /api/plan/create
创建出行计划（需登录）

**入参:**
```json
{
  "name": "计划名称",
  "travelDate": "2024-01-15",
  "peopleCount": 2,
  "scenicIds": [1, 2],
  "guide": {"content": "指南"}
}
```

### POST /api/plan/generate-guide
生成出行指南（需登录）

**入参:**
```json
{
  "scenicIds": [1, 2],
  "travelDate": "2024-01-15",
  "peopleCount": 2
}
```

**出参:**
```json
{
  "content": "生成的指南内容"
}
```

### POST /api/plan/update-status
更新计划状态（需登录）

**入参:**
```json
{
  "planId": 1,
  "status": "completed"
}
```

## 智能云出行模块

### POST /api/smart-travel/generate
生成智能出行美照（需登录）

**入参:**
```json
{
  "scenicId": 1,
  "scenicImages": ["url1"],
  "outfitImages": ["url2"],
  "galleryImages": ["url3"]
}
```

**出参:**
```json
{
  "images": ["url1", "url2", "url3"]
}
```

## 穿搭模块

### POST /api/outfit/generate
生成穿搭效果（需登录）

**入参:**
```json
{
  "clothesImages": ["url1"],
  "personImages": ["url2"],
  "galleryImages": ["url3"]
}
```

**出参:**
```json
{
  "images": ["url1", "url2", "url3"]
}
```

## 个人图集模块

### GET /api/gallery/list
获取个人图集（需登录）

**入参:**
| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| type | string | 否 | 类型：outfit/smart-travel/manual |

**出参:**
```json
{
  "list": [
    {
      "id": 1,
      "url": "图片URL",
      "type": "outfit",
      "createTime": "2024-01-01 12:00:00"
    }
  ]
}
```

### POST /api/gallery/add
添加图片到图集（需登录）

**入参:**
```json
{
  "url": "图片URL",
  "type": "outfit"
}
```

### POST /api/gallery/delete
删除图集图片（需登录）

**入参:**
```json
{
  "id": 1
}
```

## 收藏模块

### GET /api/favorites/list
获取收藏列表（需登录）

**出参:**
```json
{
  "notes": [{"id": 1, "title": "标题", "author": "作者"}],
  "scenics": [{"id": 1, "name": "名称", "address": "地址"}],
  "images": [{"id": 1, "url": "URL"}]
}
```

## 用户模块

### POST /api/user/register
用户注册

**入参:**
```json
{
  "nickname": "用户名",
  "password": "密码"
}
```

**出参:**
```json
{
  "success": true,
  "token": "JWT Token"
}
```

### POST /api/user/login
用户登录

**入参:**
```json
{
  "nickname": "用户名",
  "password": "密码"
}
```

**出参:**
```json
{
  "success": true,
  "token": "JWT Token",
  "role": "user/admin"
}
```

### GET /api/user/info
获取用户信息（需登录）

**出参:**
```json
{
  "id": 1,
  "nickname": "用户名",
  "avatar": "头像URL",
  "bio": "简介",
  "galleryCount": 10,
  "favoriteCount": 5,
  "planCount": 3,
  "noteCount": 2
}
```

## 管理台接口

### GET /api/admin/scenic/list
获取景点列表（管理员）

### POST /api/admin/scenic/create
创建景点（管理员）

### POST /api/admin/scenic/update
更新景点（管理员）

### POST /api/admin/scenic/delete
删除景点（管理员）

### GET /api/admin/note/list
获取笔记列表（管理员）

### POST /api/admin/note/offline
笔记下线（管理员）

### POST /api/admin/note/top
笔记置顶（管理员）

### POST /api/admin/note/activate
笔记上线（管理员）

### GET /api/admin/stats
获取统计数据（管理员）

**出参:**
```json
{
  "scenicViews": 1000,
  "scenicCount": 50,
  "noteFavorites": 500,
  "noteCount": 200,
  "userCount": 1000,
  "loginCount": 5000,
  "monthlyUsers": [{"month": "2024-01", "count": 100}],
  "monthlyLogins": [{"month": "2024-01", "count": 500}]
}
```