# SoloIM 后端 API 文档

## 基础信息

- **Base URL**: `http://localhost:8080`
- **WebSocket**: `ws://localhost:8080/ws/chat?token={jwt_token}`
- **认证方式**: 除认证接口外，其他接口需在 Header 中携带 `Authorization: Bearer {token}`

---

## 一、认证模块 (`/api/auth`)

### 1. 发送验证码
- **URL**: `POST /api/auth/send-code`
- **描述**: 发送手机或邮箱验证码
- **请求体**:
```json
{
  "phone": "13800138000",
  "email": "user@example.com"
}
```
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "code": "123456",
    "expireIn": 300
  }
}
```

### 2. 用户注册
- **URL**: `POST /api/auth/register`
- **请求体**:
```json
{
  "username": "testuser",
  "password": "123456",
  "phone": "13800138000",
  "email": "user@example.com",
  "code": "123456"
}
```

### 3. 用户登录
- **URL**: `POST /api/auth/login`
- **请求体**:
```json
{
  "account": "testuser",
  "password": "123456"
}
```
- **响应**:
```json
{
  "code": 200,
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户",
      "avatar": "/uploads/avatar/xxx.jpg",
      "signature": "个性签名",
      "isOnline": 1
    }
  }
}
```

### 4. 重置密码
- **URL**: `POST /api/auth/reset-password`
- **请求体**:
```json
{
  "phone": "13800138000",
  "newPassword": "newpassword",
  "code": "123456"
}
```

### 5. 用户登出
- **URL**: `POST /api/auth/logout`
- **Header**: `Authorization: Bearer {token}`

---

## 二、用户模块 (`/api/user`)

### 1. 获取个人资料
- **URL**: `GET /api/user/profile`

### 2. 更新个人资料
- **URL**: `PUT /api/user/profile`
- **请求体**:
```json
{
  "nickname": "新昵称",
  "signature": "新签名",
  "gender": 1,
  "region": "北京市朝阳区"
}
```

### 3. 上传头像
- **URL**: `POST /api/user/avatar`
- **Content-Type**: `multipart/form-data`
- **参数**: `file` (图片文件)

### 4. 搜索用户
- **URL**: `GET /api/user/search?keyword={keyword}`

### 5. 获取用户信息
- **URL**: `GET /api/user/{userId}`

---

## 三、好友模块 (`/api/friend`)

### 1. 发送好友请求
- **URL**: `POST /api/friend/request`
- **请求体**:
```json
{
  "toUserId": 2,
  "message": "你好，我是张三"
}
```

### 2. 获取好友请求列表
- **URL**: `GET /api/friend/requests`

### 3. 接受好友请求
- **URL**: `POST /api/friend/request/{requestId}/accept`

### 4. 拒绝好友请求
- **URL**: `POST /api/friend/request/{requestId}/reject`

### 5. 加入黑名单
- **URL**: `POST /api/friend/{friendId}/blacklist`

### 6. 获取好友列表
- **URL**: `GET /api/friend/list`

### 7. 获取好友分组
- **URL**: `GET /api/friend/groups`

### 8. 创建好友分组
- **URL**: `POST /api/friend/group`
- **请求体**:
```json
{
  "groupName": "同事"
}
```

### 9. 重命名分组
- **URL**: `PUT /api/friend/group/{groupId}`
- **请求体**:
```json
{
  "groupName": "新名称"
}
```

### 10. 删除分组
- **URL**: `DELETE /api/friend/group/{groupId}`

### 11. 修改好友备注
- **URL**: `PUT /api/friend/{friendId}/remark`
- **请求体**:
```json
{
  "remark": "备注名"
}
```

### 12. 修改好友标签
- **URL**: `PUT /api/friend/{friendId}/tags`
- **请求体**:
```json
{
  "tags": "[\"重要\", \"同事\"]"
}
```

### 13. 删除好友
- **URL**: `DELETE /api/friend/{friendId}`

---

## 四、群组模块 (`/api/group`)

### 1. 创建群聊
- **URL**: `POST /api/group/create`
- **请求体**:
```json
{
  "groupName": "工作群",
  "memberIds": [2, 3, 4]
}
```

### 2. 获取群信息
- **URL**: `GET /api/group/{groupId}`

### 3. 修改群信息
- **URL**: `PUT /api/group/{groupId}`
- **请求体**:
```json
{
  "groupName": "新群名",
  "groupAvatar": "/uploads/xxx.jpg",
  "announcement": "群公告内容"
}
```

### 4. 添加群成员
- **URL**: `POST /api/group/{groupId}/members`
- **请求体**:
```json
{
  "memberIds": [5, 6]
}
```

### 5. 移除群成员
- **URL**: `DELETE /api/group/{groupId}/members/{memberId}`

### 6. 设置/取消管理员
- **URL**: `POST /api/group/{groupId}/admin/{memberId}?isAdmin=true`

### 7. 转让群主
- **URL**: `POST /api/group/{groupId}/transfer`
- **请求体**:
```json
{
  "newOwnerId": 2
}
```

### 8. 退出群聊
- **URL**: `POST /api/group/{groupId}/leave`

### 9. 获取群成员列表
- **URL**: `GET /api/group/{groupId}/members`

### 10. 获取我的群组
- **URL**: `GET /api/group/my`

---

## 五、消息模块 (`/api/message`)

### 1. 发送消息
- **URL**: `POST /api/message/send`
- **请求体** (单聊):
```json
{
  "conversationType": 1,
  "receiverId": 2,
  "messageType": 1,
  "content": "你好",
  "quoteMessageId": null
}
```
- **请求体** (群聊):
```json
{
  "conversationType": 2,
  "groupId": 1,
  "messageType": 1,
  "content": "大家好",
  "quoteMessageId": null
}
```
- **消息类型**: 1-文本, 2-图片, 3-表情, 4-文件

### 2. 上传文件
- **URL**: `POST /api/message/upload`
- **Content-Type**: `multipart/form-data`
- **参数**: `file`

### 3. 获取历史消息
- **URL**: `GET /api/message/history?conversationId={convId}&page=0&size=50`

### 4. 撤回消息
- **URL**: `POST /api/message/{messageId}/revoke`

### 5. 转发消息
- **URL**: `POST /api/message/forward`
- **请求体**:
```json
{
  "messageIds": [1, 2, 3],
  "conversationType": 1,
  "receiverId": 3
}
```

### 6. 合并转发消息
- **URL**: `POST /api/message/merge-forward`
- **请求体**:
```json
{
  "messageIds": [1, 2, 3],
  "conversationType": 2,
  "groupId": 1
}
```

### 7. 获取会话列表
- **URL**: `GET /api/message/conversations`

### 8. 设置/取消置顶会话
- **URL**: `POST /api/message/conversation/{conversationId}/top?isTop=true`

### 9. 设置/取消免打扰
- **URL**: `POST /api/message/conversation/{conversationId}/mute?isMute=true`

### 10. 标记会话已读
- **URL**: `POST /api/message/conversation/{conversationId}/read`

### 11. 删除会话
- **URL**: `DELETE /api/message/conversation/{conversationId}`

---

## 六、WebSocket 消息协议

### 连接
```
ws://localhost:8080/ws/chat?token={jwt_token}
```

### 消息格式
```json
{
  "type": "message",
  "data": {
    "id": 1,
    "conversationId": "user_1_2",
    "conversationType": 1,
    "senderId": 1,
    "receiverId": 2,
    "messageType": 1,
    "content": "消息内容",
    "status": 1,
    "createdAt": "2024-01-01T12:00:00"
  }
}
```

### 消息类型
- `message`: 普通消息
- `pong`: 心跳响应
- `revoke`: 撤回消息通知
- `read`: 已读回执
- `typing`: 输入中

---

## 七、WebRTC 信令

### 发起视频通话
```json
{
  "type": "webrtc",
  "data": {
    "action": "call",
    "fromUserId": 1,
    "toUserId": 2,
    "callType": "video",
    "offer": "{sdp_offer}"
  }
}
```

### 应答
```json
{
  "type": "webrtc",
  "data": {
    "action": "answer",
    "fromUserId": 2,
    "toUserId": 1,
    "answer": "{sdp_answer}"
  }
}
```

### ICE 候选
```json
{
  "type": "webrtc",
  "data": {
    "action": "ice",
    "fromUserId": 1,
    "toUserId": 2,
    "candidate": "{ice_candidate}"
  }
}
```
