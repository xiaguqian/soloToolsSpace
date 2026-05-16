
# IM Client - 即时通讯客户端

一款基于 Electron + React + Spring Boot 的跨平台即时通讯软件。

## 功能特性

### 用户身份与认证
- ✅ 手机号/邮箱注册，支持验证码验证
- ✅ 账号密码登录，手机号/邮箱登录
- ✅ 自动登录（记住密码）
- ✅ 找回密码（通过预留手机号或邮箱）
- ✅ 个人资料设置（昵称、头像、个性签名、性别、地区）

### 消息通讯
- ✅ 单聊：一对一文本、表情、图片消息
- ✅ 群聊：创建群聊、群成员管理
- ✅ 消息状态：发送中、已发送、已读
- ✅ 消息引用回复
- ✅ 消息撤回（2分钟内）
- ✅ 消息转发、合并转发
- ✅ 消息删除/清空本地记录
- ✅ 表情包（内置emoji及自定义表情包）

### 好友社交
- ✅ 搜索添加好友（账号/昵称）
- ✅ 好友请求处理（通过、拒绝、拉黑）
- ✅ 好友列表（分组展示）
- ✅ 好友备注/标签
- ✅ 黑名单功能
- ✅ 通讯录（群组、好友）

### 群组管理
- ✅ 创建群聊（选择至少2个好友）
- ✅ 群资料设置（群名称、头像、公告）
- ✅ 成员管理（添加、移除、设置管理员）
- ✅ 群主转让

### 设置
- ✅ 开机自启
- ✅ 托盘常驻

## 技术栈

### 前端
- **框架**: Electron 28 + React 18
- **样式**: CSS3
- **状态管理**: React Hooks
- **通信**: Axios + WebSocket (STOMP)
- **数据库**: SQLite（本地存储）

### 后端
- **框架**: Spring Boot 3.2
- **数据库**: MySQL + Redis
- **通信**: WebSocket (STOMP)
- **认证**: JWT

## 项目结构

```
suTT/
├── backend/                    # 后端服务
│   ├── src/main/java/com/example/im/
│   │   ├── controller/         # REST API 控制器
│   │   ├── service/            # 业务逻辑层
│   │   ├── repository/         # 数据访问层
│   │   ├── entity/             # 实体类
│   │   ├── dto/                # 数据传输对象
│   │   └── config/             # 配置类
│   ├── pom.xml                 # Maven 配置
│   └── application.yml         # 应用配置
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── components/         # React 组件
│   │   ├── App.js              # 主应用组件
│   │   └── index.css           # 全局样式
│   ├── main.js                 # Electron 入口
│   └── package.json            # npm 配置
├── init.sql                    # 数据库初始化脚本
├── api.md                      # API 文档
└── readme.md                   # 项目说明
```

## 快速开始

### 环境要求
- Java 21+
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+

### 后端启动

1. 创建数据库：
```sql
CREATE DATABASE example_db DEFAULT CHARACTER SET utf8mb4;
```

2. 执行初始化脚本：
```bash
mysql -u root -p example_db < init.sql
```

3. 修改配置文件 `backend/src/main/resources/application.yml`：
```yaml
spring:
  datasource:
    password: 你的密码
```

4. 启动后端：
```bash
cd backend
mvn spring-boot:run
```

### 前端启动

1. 安装依赖：
```bash
cd frontend
npm install
```

2. 开发模式：
```bash
npm run dev
```

3. 打包构建：
```bash
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 配置说明

### 数据库配置
- 数据库名：example_db
- 用户名：root
- 密码：871502784（用户提供）

### 端口配置
- 后端服务：8080
- 前端开发：3000

## License

MIT License
