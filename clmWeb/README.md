# 多租户餐饮点餐系统 - 管理端

## 项目概述

本项目是一个多租户餐饮点餐系统的管理端代码，支持将用户端与管理端分离部署，管理端可部署到用户内网，用户端可部署到公网，以减少系统占用和维护成本。

## 技术栈

### 后端
- Node.js 18+
- Express 4.x
- MySQL 5.7+
- JWT 身份认证
- bcrypt 密码加密
- qrcode 二维码生成

### 前端 PC
- Vue 3.x
- Element Plus
- Vue Router
- ECharts 数据可视化

### 前端 H5
- Vue 3.x
- Vant 4.x
- Vue Router
- ECharts 数据可视化

## 项目结构

```
clmWeb/
├── init.sql                    # 数据库初始化脚本
├── README.md                   # 项目说明文档
├── backend/                    # 后端服务
│   ├── config/                 # 配置文件
│   │   └── database.js         # 数据库连接配置
│   ├── middleware/             # 中间件
│   │   └── auth.js             # 认证中间件
│   ├── routes/                 # API路由
│   │   ├── auth.js             # 登录认证
│   │   ├── category.js         # 商品分类
│   │   ├── order.js            # 订单管理
│   │   ├── product.js          # 商品管理
│   │   ├── statistics.js       # 数据统计
│   │   ├── table.js            # 桌码管理
│   │   └── tenant.js           # 店铺设置
│   ├── utils/                  # 工具函数
│   │   └── common.js           # 通用工具
│   ├── .env                    # 环境变量
│   ├── package.json            # 依赖配置
│   └── server.js               # 服务入口
├── admin-pc/                   # PC端管理后台
│   ├── src/
│   │   ├── router/             # 路由配置
│   │   ├── utils/              # 工具函数
│   │   ├── views/              # 页面组件
│   │   ├── App.vue             # 根组件
│   │   └── main.js             # 入口文件
│   ├── index.html              # HTML模板
│   ├── package.json            # 依赖配置
│   └── vite.config.js          # Vite配置
└── admin-h5/                   # H5移动端管理后台
    ├── src/
    │   ├── router/             # 路由配置
    │   ├── utils/              # 工具函数
    │   ├── views/              # 页面组件
    │   ├── App.vue             # 根组件
    │   └── main.js             # 入口文件
    ├── index.html              # HTML模板
    ├── package.json            # 依赖配置
    ├── vite.config.js          # Vite配置
    └── postcss.config.js       # PostCSS配置
```

## 环境要求

- Node.js >= 18.0.0
- MySQL >= 5.7.0
- npm 或 yarn 包管理器

## 安装与运行

### 1. 数据库配置

确保 MySQL 服务已启动，执行数据库初始化脚本：

```bash
mysql -u root -p < init.sql
```

> 数据库密码：871502794

### 2. 后端服务

```bash
cd backend
npm install
npm run dev
```

后端服务运行在：http://localhost:8001

### 3. PC端管理后台

```bash
cd admin-pc
npm install
npm run dev
```

PC端运行在：http://localhost:8002

### 4. H5移动端管理后台

```bash
cd admin-h5
npm install
npm run dev
```

H5端运行在：http://localhost:8003

## 账号说明

### 默认管理员账号

| 角色 | 手机号 | 密码 |
|------|--------|------|
| 平台管理员 | 13800138000 | 123456 |
| 商户管理员 | 13800138001 | 123456 |

## 功能说明

### PC端管理后台

1. **数据看板**
   - 今日订单统计（堂食/外卖）
   - 今日营业额
   - 热销商品排行
   - 近7天订单趋势图

2. **商品管理**
   - 商品列表（上下架、编辑、删除）
   - 商品分类管理（增加/排序/编辑/删除）
   - 添加/编辑商品（名称、价格、分类、库存、规格）
   - 批量上架/下架

3. **桌码管理**
   - 桌号列表（增删改）
   - 生成桌码二维码
   - 批量生成二维码
   - 桌号状态管理（启用/禁用）

4. **订单管理**
   - 订单列表（按状态/时间筛选）
   - 订单详情（商品、数量、金额、地址）
   - 接单/确认制作/完成/配送/取消订单

5. **店铺设置**
   - 基本信息（名称、Logo、电话、营业时间）
   - 外卖配置（起送价、配送费、配送范围）
   - 支付配置（微信/支付宝参数）
   - 打印配置（云打印机参数）

### H5移动端管理后台

1. **订单管理**
   - 订单列表（全部/待接单/制作中）
   - 订单详情查看
   - 接单/配送/完成/取消操作

2. **商品管理**
   - 商品列表查看
   - 商品上下架操作

3. **数据看板**
   - 今日订单统计
   - 热销商品排行
   - 订单趋势图

4. **桌码管理**
   - 桌号列表查看
   - 二维码预览

## 数据库结构

### 核心表结构

**tenant（租户表）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 租户ID |
| name | VARCHAR(100) | 店铺名称 |
| logo | VARCHAR(500) | 店铺Logo |
| tel | VARCHAR(20) | 联系电话 |
| business_hours | VARCHAR(100) | 营业时间 |
| enable_takeout | TINYINT | 是否开启外卖 |
| min_delivery_amount | DECIMAL | 起送价 |
| delivery_fee | DECIMAL | 配送费 |

**product（商品表）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 商品ID |
| tenant_id | INT | 租户ID |
| category_id | INT | 分类ID |
| name | VARCHAR(100) | 商品名称 |
| price | DECIMAL | 价格 |
| image | VARCHAR(500) | 商品图片 |
| stock | INT | 库存（-1无限） |
| status | TINYINT | 状态（0下架1上架） |

**orders（订单表）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 订单ID |
| tenant_id | INT | 租户ID |
| order_no | VARCHAR(50) | 订单号 |
| type | TINYINT | 类型（1堂食2外卖） |
| table_id | INT | 桌号ID |
| total_amount | DECIMAL | 总金额 |
| pay_status | TINYINT | 支付状态 |
| order_status | TINYINT | 订单状态 |

**dining_table（桌号表）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 桌号ID |
| tenant_id | INT | 租户ID |
| table_name | VARCHAR(50) | 桌号名称 |
| qrcode_url | VARCHAR(500) | 二维码URL |
| status | TINYINT | 状态（0禁用1启用） |

## API接口

### 认证接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/auth/login | POST | 登录 |
| /api/auth/change-password | POST | 修改密码 |

### 商品接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/product/list | GET | 商品列表 |
| /api/product/:id | GET | 商品详情 |
| /api/product | POST | 添加商品 |
| /api/product/:id | PUT | 修改商品 |
| /api/product/:id | DELETE | 删除商品 |

### 订单接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/order/list | GET | 订单列表 |
| /api/order/:id | GET | 订单详情 |
| /api/order/:id/accept | PUT | 接单 |
| /api/order/:id/progress | PUT | 确认制作 |
| /api/order/:id/complete | PUT | 完成订单 |
| /api/order/:id/deliver | PUT | 标记配送 |
| /api/order/:id/cancel | PUT | 取消订单 |

### 统计接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/statistics/today | GET | 今日统计 |
| /api/statistics/hot-products | GET | 热销商品 |
| /api/statistics/trend | GET | 订单趋势 |

## 开发说明

### 端口配置

- 后端服务：8001
- PC端：8002
- H5端：8003

### 环境变量

后端 `.env` 文件配置说明：

```env
PORT=8001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=871502794
DB_NAME=catering_system
JWT_SECRET=catering_admin_jwt_secret_key_2024
IMAGE_UPLOAD_PATH=./uploads
```

## 部署说明

### 生产环境部署

1. **构建前端**

```bash
cd admin-pc && npm run build
cd admin-h5 && npm run build
```

2. **部署后端**

```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

3. **反向代理配置（Nginx示例）**

```nginx
server {
    listen 80;
    server_name admin.example.com;
    
    location / {
        root /path/to/admin-pc/dist;
        index index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8001/api/;
        proxy_set_header Host $host;
    }
}

server {
    listen 80;
    server_name h5.example.com;
    
    location / {
        root /path/to/admin-h5/dist;
        index index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8001/api/;
        proxy_set_header Host $host;
    }
}
```

## 注意事项

1. 首次运行前需确保MySQL服务已启动并创建数据库
2. 二维码生成需要服务器有写入权限（uploads目录）
3. JWT密钥建议在生产环境使用更安全的随机字符串
4. 建议配置HTTPS证书确保数据传输安全

## License

MIT License
