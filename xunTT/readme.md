# SoloIM - 跨平台桌面即时通讯软件

## 项目简介

SoloIM 是一款基于 Electron + React + Spring Boot 开发的跨平台桌面即时通讯软件。

### 技术栈

**前端：**
- Electron - 跨平台桌面应用框架
- React - 前端框架
- TypeScript - 类型安全
- SQLite - 本地数据存储
- WebRTC - 音视频通讯
- WebSocket - 实时通信

**后端：**
- Spring Boot - Java后端框架
- MySQL - 主数据库
- Redis - 缓存数据库
- WebSocket - 实时消息推送

### 主要功能

1. **用户身份与认证**
   - 手机号/邮箱注册（验证码验证）
   - 账号密码登录 / 手机号邮箱登录
   - 自动登录
   - 找回密码
   - 个人资料设置（昵称、头像、个性签名等）

2. **消息通讯**
   - 一对一单聊（文本、表情、图片）
   - 群聊
   - 消息回执（已读状态）
   - 消息状态显示（发送中、已发送、已读）
   - 消息引用回复
   - 消息撤回（2分钟内）
   - 消息转发、合并转发
   - 消息删除/清空本地记录
   - 表情包（内置 + 自定义导入）

3. **好友社交**
   - 搜索添加好友
   - 好友请求处理
   - 好友分组管理
   - 好友备注/标签
   - 黑名单功能
   - 通讯录展示

4. **群组管理**
   - 创建群聊（至少两个好友）
   - 群资料设置
   - 群成员管理
   - 管理员设置
   - 群转让

5. **系统设置**
   - 开机自启
   - 托盘常驻

### 项目结构

```
xunTT/
├── readme.md                    # 项目简介文档
├── api.md                       # 后端接口文档
├── init.sql                     # 数据库初始化脚本
├── package-frontend.cmd         # 前端打包脚本
├── backend/                     # 后端项目
│   ├── pom.xml
│   └── src/
└── frontend/                    # 前端项目
    ├── package.json
    └── src/
```

### 快速开始

#### 环境要求

- Node.js >= 16.x
- Java >= 17
- MySQL >= 8.0
- Redis >= 6.x

#### 启动后端

1. 创建数据库并执行 `init.sql`
2. 配置 `backend/src/main/resources/application.yml`
3. 运行 Spring Boot 应用

#### 启动前端

1. 进入 frontend 目录
2. 执行 `npm install`
3. 执行 `npm start`

#### 打包前端

执行根目录下的 `package-frontend.cmd`

### 开发说明

- 后端端口：8080
- WebSocket 端口：8080
- 前端使用 SQLite 存储本地聊天记录
- WebSocket 用于实时消息推送
- WebRTC 用于音视频通话
