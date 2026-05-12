# 寻旅游 API 接口文档

## 通用说明

### 基础信息
- 基础URL: `/api`
- 请求方法: GET / POST
- 数据格式: JSON
- 字符编码: UTF-8

### 响应格式
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 状态码说明
- `0`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `500`: 服务器内部错误

---

## 1. 景点模块

### 1.1 获取景点列表
**接口地址**: `GET /api/scenic/list`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认10 |
| keyword | string | 否 | 搜索关键词 |
| type | string | 否 | 景点类型(culture/nature/amusement/historical) |
| isPaid | boolean | 否 | 是否收费 |
| travelMode | array | 否 | 出行方式筛选 |
| lat | float | 否 | 纬度(用于定位排序) |
| lng | float | 否 | 经度(用于定位排序) |

**响应数据**:
```json
{
  "list": [
    {
      "id": "1",
      "name": "故宫博物院",
      "coverImage": "图片地址",
      "description": "景点描述",
      "type": "culture",
      "isPaid": true,
      "price": 60,
      "distance": "5.2km",
      "rating": 4.9,
      "height": 180,
      "tags": ["历史古迹", "文化"],
      "address": "北京市东城区",
      "openTime": "08:30-17:00"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

### 1.2 获取景点详情
**接口地址**: `GET /api/scenic/{id}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 景点ID |

**响应数据**:
```json
{
  "id": "1",
  "name": "故宫博物院",
  "images": ["图片地址1", "图片地址2"],
  "description": "详细描述",
  "rating": 4.9,
  "isPaid": true,
  "price": 60,
  "address": "北京市东城区",
  "openTime": "08:30-17:00",
  "type": "culture",
  "tags": ["历史古迹", "文化"],
  "notes": [
    { "id": "1", "title": "游记标题", "author": "作者" }
  ]
}
```

### 1.3 收藏景点
**接口地址**: `POST /api/scenic/favorite`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| scenicId | string | 是 | 景点ID |

### 1.4 取消收藏景点
**接口地址**: `POST /api/scenic/unfavorite`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| scenicId | string | 是 | 景点ID |

---

## 2. 出行笔记模块

### 2.1 获取笔记列表
**接口地址**: `GET /api/note/list`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码 |
| pageSize | int | 否 | 每页数量 |
| scenicId | string | 否 | 景点ID筛选 |
| userId | string | 否 | 用户ID筛选 |

**响应数据**:
```json
{
  "list": [
    {
      "id": "1",
      "title": "笔记标题",
      "coverImage": "封面图片",
      "author": "作者名",
      "authorAvatar": "头像",
      "scenicId": "1",
      "scenicName": "景点名称",
      "createTime": "2024-01-15",
      "likeCount": 128,
      "commentCount": 32,
      "favoriteCount": 56
    }
  ]
}
```

### 2.2 获取笔记详情
**接口地址**: `GET /api/note/{id}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 笔记ID |

**响应数据**:
```json
{
  "id": "1",
  "title": "笔记标题",
  "images": ["图片地址"],
  "content": "笔记内容",
  "author": "作者",
  "authorAvatar": "头像",
  "scenicId": "1",
  "scenicName": "景点名称",
  "createTime": "2024-01-15",
  "likeCount": 128,
  "commentCount": 32,
  "favoriteCount": 56
}
```

### 2.3 创建笔记
**接口地址**: `POST /api/note/create`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 是 | 笔记标题 |
| content | string | 是 | 笔记内容 |
| scenicId | string | 是 | 关联景点ID |
| images | array | 否 | 图片数组 |

**响应数据**:
```json
{
  "id": "1",
  "title": "笔记标题"
}
```

### 2.4 收藏笔记
**接口地址**: `POST /api/note/favorite`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| noteId | string | 是 | 笔记ID |

### 2.5 取消收藏笔记
**接口地址**: `POST /api/note/unfavorite`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| noteId | string | 是 | 笔记ID |

---

## 3. 出行计划模块

### 3.1 获取计划列表
**接口地址**: `GET /api/plan/list`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 否 | 状态筛选(pending/completed/cancelled) |

**响应数据**:
```json
{
  "list": [
    {
      "id": "1",
      "name": "北京三日游",
      "travelDate": "2024-02-01 至 2024-02-03",
      "peopleCount": 2,
      "status": "pending",
      "scenicIds": ["1", "2"],
      "scenicNames": "故宫、长城",
      "createTime": "2024-01-10"
    }
  ]
}
```

### 3.2 获取计划详情
**接口地址**: `GET /api/plan/{id}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 计划ID |

**响应数据**:
```json
{
  "id": "1",
  "name": "北京三日游",
  "travelDate": "2024-02-01 至 2024-02-03",
  "peopleCount": 2,
  "status": "pending",
  "createTime": "2024-01-10",
  "scenics": [
    { "id": "1", "name": "故宫", "address": "地址" }
  ],
  "guide": {
    "content": "攻略内容HTML"
  }
}
```

### 3.3 创建计划
**接口地址**: `POST /api/plan/create`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 计划名称 |
| travelDate | string | 是 | 出行时间 |
| peopleCount | int | 是 | 出行人数 |
| scenicIds | array | 是 | 景点ID数组 |
| guide | object | 否 | 生成的攻略 |

### 3.4 生成出行攻略
**接口地址**: `POST /api/plan/generate-guide`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| scenicIds | array | 是 | 景点ID数组 |
| travelDate | string | 是 | 出行时间 |
| peopleCount | int | 是 | 出行人数 |

**响应数据**:
```json
{
  "content": "攻略HTML内容"
}
```

### 3.5 更新计划状态
**接口地址**: `POST /api/plan/update-status`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| planId | string | 是 | 计划ID |
| status | string | 是 | 状态(pending/completed/cancelled) |

---

## 4. 智能云出行模块

### 4.1 生成AI出行图片集
**接口地址**: `POST /api/smart-travel/generate`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| scenicId | string | 是 | 景点ID |
| scenicImages | array | 否 | 景点图片 |
| outfitImages | array | 否 | 穿搭图片 |
| galleryImages | array | 否 | 个人图集图片 |

**响应数据**:
```json
{
  "images": ["生成的图片地址1", "生成的图片地址2"]
}
```

---

## 5. 穿搭模块

### 5.1 生成试穿效果
**接口地址**: `POST /api/outfit/generate`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clothesImages | array | 否 | 衣服图片 |
| personImages | array | 否 | 个人照片 |
| galleryImages | array | 否 | 个人图集图片 |

**响应数据**:
```json
{
  "images": ["生成的试穿图片地址1", "生成的试穿图片地址2"]
}
```

---

## 6. 个人图集模块

### 6.1 获取图集列表
**接口地址**: `GET /api/gallery/list`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 否 | 类型筛选(outfit/smart-travel/manual) |

**响应数据**:
```json
{
  "list": [
    {
      "id": "1",
      "url": "图片地址",
      "type": "outfit",
      "createTime": "2024-01-15"
    }
  ]
}
```

### 6.2 添加图片到图集
**接口地址**: `POST /api/gallery/add`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| url | string | 是 | 图片地址 |
| type | string | 是 | 图片类型 |

### 6.3 删除图集中的图片
**接口地址**: `POST /api/gallery/delete`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 图片ID |

---

## 7. 收藏模块

### 7.1 获取收藏列表
**接口地址**: `GET /api/favorites/list`

**响应数据**:
```json
{
  "notes": [
    { "id": "1", "title": "笔记标题", "author": "作者" }
  ],
  "scenics": [
    { "id": "1", "name": "景点名称", "address": "地址" }
  ],
  "images": [
    { "id": "1", "url": "图片地址" }
  ]
}
```

---

## 8. 用户模块

### 8.1 获取用户信息
**接口地址**: `GET /api/user/info`

**响应数据**:
```json
{
  "id": "1",
  "nickname": "用户昵称",
  "avatar": "头像地址",
  "bio": "个人简介",
  "galleryCount": 12,
  "favoriteCount": 8,
  "planCount": 3,
  "noteCount": 5
}
```
