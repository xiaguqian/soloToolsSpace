# 商户管理系统

多租户商户管理系统，支持商户管理员管理商品、订单、用户等功能。

## 技术栈

### 后端
- Node.js + Express
- MySQL 数据库
- JWT 认证
- BCrypt 密码加密

### 前端
- Vue 3 + Vite
- Element Plus UI 组件库
- Vue Router 路由管理
- Axios 网络请求

## 项目结构

```
merchant-system/
├── backend/                 # 后端服务
│   ├── config/             # 配置文件
│   │   └── db.js          # 数据库配置
│   ├── controllers/        # 控制器
│   │   ├── auth.js        # 认证相关
│   │   ├── product.js     # 商品管理
│   │   ├── order.js       # 订单管理
│   │   ├── endUser.js     # 用户管理
│   │   ├── statistics.js  # 数据统计
│   │   └── system.js      # 系统设置
│   ├── middleware/         # 中间件
│   │   ├── auth.js        # 认证中间件
│   │   └── multer.js      # 文件上传中间件
│   ├── routes/            # 路由
│   ├── uploads/           # 上传文件目录
│   ├── .env               # 环境变量
│   ├── package.json       # 依赖配置
│   └── server.js          # 服务入口
├── frontend/               # 前端页面
│   ├── src/
│   │   ├── api/           # API接口
│   │   ├── router/        # 路由配置
│   │   ├── views/         # 页面视图
│   │   ├── App.vue        # 根组件
│   │   └── main.js        # 入口文件
│   ├── index.html         # HTML模板
│   ├── package.json       # 依赖配置
│   └── vite.config.js     # Vite配置
├── init.sql               # 数据库初始化脚本
├── start.bat              # 启动脚本
└── README.md              # 项目说明
```

## 环境要求

- Node.js >= 16.x
- MySQL >= 5.7
- npm >= 8.x

## 快速开始

### 1. 数据库配置

确保已安装 MySQL 数据库，并创建数据库连接：

```bash
mysql -u root -p
```

密码：`871502794`

执行初始化脚本：

```bash
mysql -u root -p871502794 < init.sql
```

### 2. 启动服务

#### 方式一：使用启动脚本（Windows）

```bash
start.bat
```

#### 方式二：手动启动

**后端服务：**

```bash
cd backend
npm install
npm run dev
```

**前端服务：**

```bash
cd frontend
npm install
npm run dev
```

### 3. 访问地址

- 后端 API: http://localhost:8031
- 前端页面: http://localhost:8032

## 功能模块

### 仪表盘
- 今日订单数
- 今日交易额
- 用户总数
- 商品总数

### 商品管理
- 商品列表展示
- 商品添加/编辑/删除
- 商品上下架
- 分类管理
- 库存管理

### 订单管理
- 订单列表展示
- 订单详情查看
- 订单发货/完成
- 订单导出

### 用户管理
- 用户列表展示
- 用户信息编辑
- 积分添加
- 用户标签管理

### 数据统计
- 订单趋势（按日/周/月）
- 商品销量排行

### 系统设置
- 商户基本信息
- 员工账号管理

## API 接口

### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/v1/auth/login | 登录 |
| POST | /api/v1/auth/logout | 退出 |
| GET | /api/v1/auth/profile | 获取用户信息 |

### 商品接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/products | 获取商品列表 |
| GET | /api/v1/products/:id | 获取商品详情 |
| POST | /api/v1/products | 创建商品 |
| PUT | /api/v1/products/:id | 更新商品 |
| DELETE | /api/v1/products/:id | 删除商品 |
| PUT | /api/v1/products/:id/status | 更新商品状态 |
| GET | /api/v1/products/categories/list | 获取分类列表 |

### 订单接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/orders | 获取订单列表 |
| GET | /api/v1/orders/:id | 获取订单详情 |
| PUT | /api/v1/orders/:id | 更新订单状态 |
| GET | /api/v1/orders/export | 导出订单 |

### 用户接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/users | 获取用户列表 |
| GET | /api/v1/users/:id | 获取用户详情 |
| PUT | /api/v1/users/:id | 更新用户信息 |
| POST | /api/v1/users/:id/points | 添加积分 |

### 统计接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/statistics/dashboard | 获取仪表盘数据 |
| GET | /api/v1/statistics/order-trend | 获取订单趋势 |
| GET | /api/v1/statistics/product-ranking | 获取商品销量排行 |

### 系统接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/system/tenant | 获取商户信息 |
| PUT | /api/v1/system/tenant | 更新商户信息 |
| GET | /api/v1/system/staff | 获取员工列表 |
| POST | /api/v1/system/staff | 创建员工 |
| PUT | /api/v1/system/staff/:id | 更新员工 |
| DELETE | /api/v1/system/staff/:id | 删除员工 |

## 测试账号

- 手机号: `13800138000`
- 密码: `123456`

## 数据库结构

### tenant（租户表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| name | VARCHAR(100) | 商户名称 |
| logo | VARCHAR(255) | Logo地址 |
| status | TINYINT | 状态（0禁用 1启用） |
| config_json | TEXT | 配置信息 |
| created_at | DATETIME | 创建时间 |

### end_user（用户端用户表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| tenant_id | BIGINT | 租户ID |
| openid | VARCHAR(100) | 微信OpenID |
| phone | VARCHAR(20) | 手机号 |
| nickname | VARCHAR(50) | 昵称 |
| address_list | TEXT | 地址列表 |
| points | INT | 积分 |
| tags | VARCHAR(255) | 标签 |
| created_at | DATETIME | 创建时间 |

### product（商品表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| tenant_id | BIGINT | 租户ID |
| name | VARCHAR(100) | 商品名称 |
| price | DECIMAL(10,2) | 价格 |
| stock | INT | 库存 |
| status | TINYINT | 状态（0下架 1上架） |
| category | VARCHAR(50) | 分类 |
| description | TEXT | 描述 |
| image_url | VARCHAR(255) | 图片地址 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### order（订单表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| tenant_id | BIGINT | 租户ID |
| end_user_id | BIGINT | 用户ID |
| order_no | VARCHAR(50) | 订单号 |
| total_amount | DECIMAL(10,2) | 订单金额 |
| status | TINYINT | 状态（0待支付 1已支付 2已发货 3已完成 4已取消） |
| pay_time | DATETIME | 支付时间 |
| ship_time | DATETIME | 发货时间 |
| finish_time | DATETIME | 完成时间 |
| items_json | TEXT | 商品列表JSON |
| created_at | DATETIME | 创建时间 |

### staff（商户管理账号）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| tenant_id | BIGINT | 租户ID |
| phone | VARCHAR(20) | 手机号 |
| password_hash | VARCHAR(255) | 密码哈希 |
| role | TINYINT | 角色（0平台管理员 1商户管理员 2商户员工） |
| name | VARCHAR(50) | 姓名 |
| status | TINYINT | 状态（0禁用 1启用） |
| created_at | DATETIME | 创建时间 |

## 开发说明

### 环境变量配置

后端 `.env` 文件配置：

```env
PORT=8031
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=871502794
DB_NAME=merchant_db
JWT_SECRET=merchant_jwt_secret_key_2024
JWT_EXPIRES_IN=7d
```

### 跨域配置

前端已配置代理，开发环境下自动转发 API 请求到后端服务。

### 响应格式

所有 API 响应统一格式：

```json
{
  "code": 200,
  "data": {},
  "message": "成功"
}
```

## 许可证

MIT License