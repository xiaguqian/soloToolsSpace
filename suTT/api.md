
# IM Client API 文档

## 1. 用户认证模块

### 1.1 注册

**POST** `/api/auth/register`

请求体：
```json
{
    "username": "string (必填，用户名)",
    "password": "string (必填，密码)",
    "phone": "string (可选，手机号)",
    "email": "string (可选，邮箱)",
    "code": "string (可选，验证码)"
}
```

响应：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "user": {...},
        "token": "string (JWT token)"
    }
}
```

### 1.2 登录

**POST** `/api/auth/login`

请求体：
```json
{
    "account": "string (必填，账号/手机号/邮箱)",
    "password": "string (必填，密码)"
}
```

响应：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "user": {...},
        "token": "string (JWT token)"
    }
}
```

### 1.3 获取用户信息

**GET** `/api/auth/user/{id}`

响应：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "username": "string",
        "nickname": "string",
        "avatar": "string",
        "signature": "string",
        "gender": "string",
        "region": "string",
        "online": true/false
    }
}
```

### 1.4 更新个人资料

**PUT** `/api/auth/user/{id}/profile`

请求体：
```json
{
    "nickname": "string (可选)",
    "avatar": "string (可选)",
    "signature": "string (可选)",
    "gender": "string (可选)",
    "region": "string (可选)"
}
```

---

## 2. 消息通讯模块

### 2.1 发送消息

**POST** `/api/messages/send`

请求体：
```json
{
    "receiverId": "number (单聊必填)",
    "groupId": "number (群聊必填)",
    "content": "string (必填)",
    "contentType": "string (可选，默认text)",
    "replyTo": "number (可选，引用回复的消息ID)"
}
```

### 2.2 获取聊天记录

**GET** `/api/messages/chat/{targetId}`

### 2.3 获取群聊记录

**GET** `/api/messages/group/{groupId}`

### 2.4 撤回消息

**POST** `/api/messages/recall/{messageId}`

### 2.5 转发消息

**POST** `/api/messages/forward/{messageId}?targetId=&groupId=`

---

## 3. 好友社交模块

### 3.1 添加好友

**POST** `/api/friends/add`

请求体：
```json
{
    "targetId": "number (必填)",
    "message": "string (可选，验证消息)"
}
```

### 3.2 处理好友请求

**POST** `/api/friends/handle/{requesterId}?action=`

参数：
- action: 1=通过, 2=拒绝, 3=拒绝并拉黑

### 3.3 获取好友列表

**GET** `/api/friends/list`

### 3.4 更新好友备注

**PUT** `/api/friends/remark/{friendId}?remark=`

### 3.5 更新好友分组

**PUT** `/api/friends/group/{friendId}?groupName=`

### 3.6 添加到黑名单

**POST** `/api/friends/blacklist/{targetId}`

### 3.7 移出黑名单

**DELETE** `/api/friends/blacklist/{targetId}`

### 3.8 获取黑名单列表

**GET** `/api/friends/blacklist`

---

## 4. 群组管理模块

### 4.1 创建群聊

**POST** `/api/groups/create`

请求体：
```json
{
    "name": "string (必填)",
    "memberIds": "array (必填，至少2个成员)"
}
```

### 4.2 添加成员

**POST** `/api/groups/{groupId}/members?memberId=`

### 4.3 移除成员

**DELETE** `/api/groups/{groupId}/members/{memberId}`

### 4.4 设置管理员

**PUT** `/api/groups/{groupId}/admin/{memberId}?isAdmin=`

### 4.5 转让群

**PUT** `/api/groups/{groupId}/transfer/{newOwnerId}`

### 4.6 更新群信息

**PUT** `/api/groups/{groupId}/info?name=&avatar=&notice=`

### 4.7 获取用户群列表

**GET** `/api/groups/list`

---

## 5. WebSocket 通信

### 5.1 连接

```javascript
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({ Authorization: 'Bearer ' + token }, (frame) => {
    stompClient.subscribe('/topic/messages', (message) => {
        console.log(message.body);
    });
});
```

### 5.2 发送消息

```javascript
stompClient.send('/app/send', {}, JSON.stringify(message));
```

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 500 | 服务器错误 |
