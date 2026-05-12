# 寻味菜谱管理系统 - API接口文档

## 基础信息

- **Base URL**: `http://localhost:8080`
- **前端代理**: `/api/*` -> `http://localhost:8080/*`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: application/json

---

## 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 状态码，200表示成功 |
| message | String | 消息说明 |
| data | Object/Array | 返回数据 |

---

## 认证模块

### 1. 发送短信验证码

**POST** `/auth/sms-code`

**请求体**:
```json
{
  "phone": "13800138000"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | String | 是 | 手机号 |

**说明**: 测试环境验证码统一为 `123456`

---

### 2. 手机号验证码登录

**POST** `/auth/login-phone`

**请求体**:
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**响应数据**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "phone": "13800138000",
    "nickname": "美食达人",
    "avatar": null,
    "level": 0,
    "levelName": "十指不沾阳春水",
    "recipeCount": 0,
    "likeCount": 0,
    "followerCount": 0,
    "followingCount": 0
  }
}
```

---

### 3. 账号密码登录

**POST** `/auth/login-password`

**请求体**:
```json
{
  "account": "13800138000",
  "password": "123456"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| account | String | 是 | 手机号或用户名 |
| password | String | 是 | 密码 |

**响应**: 同手机号登录

---

### 4. 用户注册

**POST** `/auth/register`

**请求体**:
```json
{
  "phone": "13800138000",
  "code": "123456",
  "password": "123456",
  "nickname": "我的昵称"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | String | 是 | 手机号 |
| code | String | 是 | 验证码 |
| password | String | 是 | 密码 |
| nickname | String | 否 | 昵称（默认自动生成） |

---

## 用户模块

### 1. 获取当前用户信息

**GET** `/users/me`

**需要认证**: 是

**响应数据**:
```json
{
  "id": 1,
  "phone": "13800138000",
  "nickname": "美食达人",
  "username": null,
  "avatar": null,
  "bio": null,
  "level": 1,
  "levelName": "家庭掌勺人",
  "recipeCount": 5,
  "likeCount": 120,
  "favoriteCount": 80,
  "followerCount": 20,
  "followingCount": 15
}
```

**用户等级说明**:
| level | levelName | 条件 |
|-------|-----------|------|
| 0 | 十指不沾阳春水 | 未发布菜谱 |
| 1 | 家庭掌勺人 | 已发布菜谱 |
| 2 | 厨神 | 有点赞或收藏 > 100 |

---

### 2. 获取用户详情

**GET** `/users/{id}`

**需要认证**: 否

**响应数据**: 同当前用户信息，额外包含 `followed` 字段表示当前用户是否已关注该用户

---

### 3. 关注用户

**POST** `/users/{id}/follow`

**需要认证**: 是

---

### 4. 取消关注

**POST** `/users/{id}/unfollow`

**需要认证**: 是

---

## 菜谱模块

### 1. 获取菜谱列表

**GET** `/recipes/list`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | String | 否 | 类型：recommend（推荐）、like（点赞榜）、favorite（收藏榜），默认recommend |
| page | Long | 否 | 页码，默认1 |
| size | Long | 否 | 每页数量，默认10 |

**响应数据**:
```json
{
  "total": 100,
  "pages": 10,
  "current": 1,
  "size": 10,
  "records": [
    {
      "id": 1,
      "title": "红烧肉",
      "description": "家常红烧肉，肥而不腻",
      "cover": "https://...",
      "difficulty": 2,
      "cookTime": 60,
      "serving": 4,
      "likeCount": 156,
      "favoriteCount": 89,
      "viewCount": 1200,
      "author": {
        "id": 2,
        "nickname": "大厨小王",
        "avatar": null,
        "level": 2,
        "levelName": "厨神"
      },
      "liked": false,
      "favorited": false
    }
  ]
}
```

**说明**:
- `type=recommend` 按时间倒序，前端展示双列瀑布流
- `type=like` 按点赞数倒序，前端展示单列
- `type=favorite` 按收藏数倒序，前端展示单列

---

### 2. 获取菜谱详情

**GET** `/recipes/detail/{id}`

**响应数据**:
```json
{
  "id": 1,
  "title": "红烧肉",
  "description": "家常红烧肉...",
  "cover": "https://...",
  "difficulty": 2,
  "cookTime": 60,
  "serving": 4,
  "ingredientList": [
    { "name": "五花肉", "amount": "500g" },
    { "name": "冰糖", "amount": "30g" }
  ],
  "stepList": [
    { "order": 1, "description": "五花肉切块", "image": "https://...", "duration": null },
    { "order": 2, "description": "冷水下锅焯水", "image": "https://...", "duration": null }
  ],
  "mediaList": [
    { "type": "video", "url": "https://...", "thumbnail": "https://..." },
    { "type": "image", "url": "https://...", "thumbnail": null }
  ],
  "likeCount": 156,
  "favoriteCount": 89,
  "viewCount": 1201,
  "author": { ... },
  "liked": false,
  "favorited": false
}
```

**封面规则**:
- 若设置了 `cover` 字段，使用该字段
- 否则取 `mediaList` 第一条：视频用 `thumbnail`，图片用 `url`

---

### 3. 点赞/取消点赞

**POST** `/recipes/{id}/like`

**需要认证**: 是

**说明**: 切换点赞状态

---

### 4. 收藏/取消收藏

**POST** `/recipes/{id}/favorite`

**需要认证**: 是

**说明**: 切换收藏状态

---

### 5. 开始做菜（AI拆分步骤）

**POST** `/recipes/{id}/cook`

**需要认证**: 是

**响应数据**:
```json
[
  {
    "order": 1,
    "description": "五花肉切块，大小约2厘米见方",
    "duration": 120
  },
  {
    "order": 2,
    "description": "冷水下锅，加入姜片和料酒焯水",
    "duration": 300
  },
  {
    "order": 3,
    "description": "冰糖炒糖色，放入肉块翻炒上色",
    "duration": 180
  },
  {
    "order": 4,
    "description": "加入香料和开水，大火烧开转小火慢炖",
    "duration": 2400
  }
]
```

**AI服务说明**:
- 优先调用配置的大模型接口
- 支持OpenAI、DeepSeek、通义千问等模型
- 模型不可用时自动切换到兜底逻辑
- 兜底逻辑根据步骤内容估算时间（煮/炖/蒸时间较长，炒/煎适中，切/备料较短）

---

### 6. 获取我的收藏

**GET** `/recipes/my-favorites`

**需要认证**: 是

**响应**: 菜谱数组

---

### 7. 获取我的菜谱

**GET** `/recipes/my-recipes`

**需要认证**: 是

**响应**: 菜谱数组

---

## 搜索模块

### 1. 综合搜索

**GET** `/search/all`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | String | 是 | 搜索关键词 |

**响应数据**:
```json
{
  "recipes": [ ... ],
  "users": [ ... ]
}
```

**搜索范围**:
- 菜谱：标题、描述
- 用户：昵称、用户名

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 401 | 未授权，Token无效或过期 |
| 500 | 服务器内部错误 |

---

## 请求头示例

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json
```
