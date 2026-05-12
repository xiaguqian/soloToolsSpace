# 大模型管理平台 (Xun Data Model Platform)

一个前后端分离的大模型管理平台，支持多模型统一管理、API网关统一调用、自动路由、访问控制等功能。

## 技术栈

### 后端
- **Python 3.9+**
- **FastAPI** - Web框架
- **SQLAlchemy** - ORM
- **MySQL** - 数据库
- **JWT** - 身份认证
- **Httpx** - 异步HTTP客户端

### 前端
- **Vue 3** - 前端框架
- **Element Plus 2** - UI组件库
- **Vite** - 构建工具
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Axios** - HTTP客户端

## 项目结构

```
xunDataModel/
├── init.sql                    # 数据库初始化脚本
├── README.md                   # 项目说明文档
├── API.md                      # 接口说明文档
├── backend/                    # 后端项目
│   ├── main.py                 # FastAPI入口
│   ├── requirements.txt        # Python依赖
│   ├── .env.example            # 环境变量示例
│   └── app/
│       ├── __init__.py
│       ├── core/               # 核心模块
│       │   ├── config.py       # 配置管理
│       │   ├── database.py     # 数据库连接
│       │   ├── security.py     # 密码和JWT
│       │   └── dependencies.py # 依赖注入
│       ├── models/             # SQLAlchemy模型
│       │   └── models.py
│       ├── schemas/            # Pydantic Schema
│       │   └── schemas.py
│       ├── services/           # 业务逻辑
│       │   └── model_test.py   # 模型测试和路由
│       ├── crud/               # CRUD操作
│       │   ├── crud_user.py
│       │   ├── crud_model.py
│       │   ├── crud_tag.py
│       │   ├── crud_gateway.py
│       │   ├── crud_log.py
│       │   └── crud_access.py
│       └── api/                # API路由
│           └── v1/
│               ├── auth/       # 认证相关
│               ├── admin/      # 管理员功能
│               ├── models/     # 模型管理
│               ├── tags/       # 标签管理
│               ├── gateway/    # API网关
│               ├── logs/       # 请求日志
│               └── access/     # 访问控制
└── frontend/                   # 前端项目
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.js
        ├── App.vue
        ├── router/             # 路由
        ├── store/              # 状态管理
        ├── api/                # API封装
        ├── utils/              # 工具函数
        ├── styles/             # 样式
        ├── components/         # 组件
        └── views/              # 页面
            ├── Login.vue
            ├── Register.vue
            ├── Layout.vue
            ├── Dashboard.vue
            ├── Models.vue
            ├── Tags.vue
            ├── Gateway.vue
            ├── Logs.vue
            ├── Users.vue
            ├── Access.vue
            └── Settings.vue
```

## 用户角色

| 角色 | 权限 |
|------|------|
| **管理员 (admin)** | 管理所有用户权限、修改用户角色、暂停系统访问、管理访问控制名单、查看所有日志 |
| **团队管理员 (team_admin)** | 创建团队、管理团队共享模型、管理团队成员 |
| **普通用户 (user)** | 注册登录、管理自身持有的模型、使用API网关调用模型 |

## 核心功能

### 1. 模型管理
- 模型新录入：模型名称、提供商（支持自定义新增）、版本、API类型、请求地址、API Key、组织ID、代理URL、默认参数、备注、标签、免费额度
- 模型测试：使用已填写信息发送自定义消息验证配置
- 模型启用/停用
- 模型编辑和删除

### 2. 标签管理
- 标签新增、修改、删除
- 标签启用/停用
- 预设标签：文本生成、文生图、图生图、语音转文字、文字转语音、代码生成、多模态、情感分析

### 3. API网关
- 对外API统一管理
- API启用/停用控制
- 支持自动路由或指定模型调用
- 自动路由优先级：免费额度 > 热度（请求次数）

### 4. 请求日志
- 记录每个API请求的用户、模型、路径、来源IP、状态码、响应时间
- 支持按模型ID、来源IP筛选
- 统计总请求数和今日请求数

### 5. 访问控制
- 白名单：仅白名单内IP可访问
- 黑名单：黑名单内IP禁止访问

## 快速开始

### 1. 数据库初始化

```bash
# 使用MySQL客户端执行初始化脚本
mysql -u root -p < init.sql
```

### 2. 后端配置

```bash
cd backend

# 创建虚拟环境
python -m venv venv
venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
copy .env.example .env
# 编辑 .env 配置数据库连接和SECRET_KEY

# 启动服务
python main.py
```

后端服务将在 `http://localhost:8000` 运行

API文档地址：
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 3. 前端配置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务
npm run dev
```

前端服务将在 `http://localhost:5173` 运行

### 4. 默认账户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |

**注意**：首次登录后请立即修改密码！

## 配置说明

### 后端环境变量 (.env)

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=xun_model_platform

# JWT配置
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# 应用配置
APP_NAME=大模型管理平台
DEBUG=True
```

## API调用示例

### 获取Token

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

### 通过网关调用模型

```bash
curl -X POST "http://localhost:8000/api/v1/gateway/proxy" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "auto_route": true,
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

详细API文档请参考 [API.md](./API.md)

## 安全建议

1. **生产环境必须修改** `.env` 中的 `SECRET_KEY`
2. 首次登录后立即修改默认管理员密码
3. 配置HTTPS确保传输安全
4. 定期备份数据库
5. 合理配置访问控制名单

## License

MIT License
