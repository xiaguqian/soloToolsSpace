# 多租户商户管理系统

## 项目简介

这是一个多租户的商户管理系统，包含用户端（移动端H5）和商户管理端API。系统支持多个商户独立运营，每个商户拥有独立的商品、订单和用户数据。

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS 3
- **后端**: Express.js + TypeScript
- **数据库**: SQLite 3
- **状态管理**: Zustand
- **图标**: Lucide React

## 端口配置

- 后端服务端口: `8021`
- 前端开发端口: `5173` (Vite 默认)

## 数据库配置

- 数据库类型: SQLite (本地数据库)
- 数据库文件: `data/database.sqlite`
- 初始化脚本: `sql/init.sql`
- 数据库密码: `871502794`

## 数据库结构

### 租户表 (tenant)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | VARCHAR(100) | 商户名称 |
| logo | VARCHAR(500) | 商户Logo |
| status | TINYINT | 状态 (1: 启用, 0: 禁用) |
| config_json | TEXT | 商户配置JSON |
| created_at | DATETIME | 创建时间 |

### 用户端用户表 (end_user)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| tenant_id | INTEGER | 租户ID |
| openid | VARCHAR(100) | 微信OpenID |
| phone | VARCHAR(20) | 手机号 |
| nickname | VARCHAR(50) | 昵称 |
| address_list | TEXT | 收货地址列表(JSON) |
| created_at | DATETIME | 创建时间 |

### 商品表 (product)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| tenant_id | INTEGER | 租户ID |
| name | VARCHAR(100) | 商品名称 |
| price | DECIMAL(10,2) | 价格 |
| stock | INTEGER | 库存 |
| status | TINYINT | 状态 |
| image_url | VARCHAR(500) | 商品图片 |
| description | TEXT | 商品描述 |
| category | VARCHAR(50) | 分类 |
| created_at | DATETIME | 创建时间 |

### 订单表 (orders)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| tenant_id | INTEGER | 租户ID |
| end_user_id | INTEGER | 用户ID |
| total_amount | DECIMAL(10,2) | 订单金额 |
| status | VARCHAR(20) | 状态(pending/paid/cancelled/completed) |
| order_no | VARCHAR(50) | 订单号 |
| address | TEXT | 收货地址(JSON) |
| items | TEXT | 商品列表(JSON) |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 商户管理账号 (staff)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| tenant_id | INTEGER | 租户ID |
| phone | VARCHAR(20) | 手机号(唯一) |
| password_hash | VARCHAR(255) | 密码哈希 |
| role | VARCHAR(20) | 角色(admin/staff) |
| status | TINYINT | 状态 |
| created_at | DATETIME | 创建时间 |

## 功能模块

### 用户端（移动端H5）

1. **商户识别**
   - 支持URL路径/参数确定当前访问的租户
   - 提供选店入口选择商户

2. **首页**
   - 展示商户配置的轮播图
   - 商品/服务分类展示
   - 推荐商品展示

3. **商品/服务**
   - 列表展示
   - 详情查看
   - 搜索功能
   - 分类筛选

4. **购物车**
   - 添加/减少商品数量
   - 结算功能（仅当前商户商品）

5. **订单**
   - 下单功能
   - 支付接口（预留）
   - 订单列表
   - 订单详情
   - 取消订单

6. **个人中心**
   - 收货地址管理
   - 手机号绑定
   - 我的订单
   - 联系客服

### 商户管理端（PC + H5共用API）

1. **登录/登出**
   - 商户管理员手机号+密码登录
   - 验证码登录（预留）

## 项目结构

```
├── api/                    # 后端API
│   ├── routes/             # 路由文件
│   │   ├── auth.ts         # 认证路由
│   │   ├── tenant.ts       # 租户路由
│   │   ├── product.ts      # 商品路由
│   │   ├── banner.ts       # 轮播图路由
│   │   ├── endUser.ts      # 用户路由
│   │   ├── order.ts        # 订单路由
│   │   └── staff.ts        # 商户管理账号路由
│   ├── app.ts              # Express应用配置
│   ├── server.ts           # 服务器入口
│   └── db.ts               # 数据库连接
├── src/                    # 前端代码
│   ├── components/         # 公共组件
│   │   ├── TabBar.tsx      # 底部导航栏
│   │   ├── Banner.tsx      # 轮播图组件
│   │   └── ProductCard.tsx # 商品卡片
│   ├── pages/              # 页面组件
│   │   ├── SelectTenantPage.tsx    # 商户选择页
│   │   ├── LoginPage.tsx           # 登录页
│   │   ├── HomePage.tsx            # 首页
│   │   ├── ProductsPage.tsx        # 商品列表页
│   │   ├── ProductDetailPage.tsx   # 商品详情页
│   │   ├── CartPage.tsx            # 购物车页
│   │   ├── CheckoutPage.tsx        # 结算页
│   │   ├── OrderSuccessPage.tsx    # 下单成功页
│   │   ├── OrdersPage.tsx          # 订单列表页
│   │   ├── OrderDetailPage.tsx     # 订单详情页
│   │   └── ProfilePage.tsx         # 个人中心页
│   ├── store/              # 状态管理
│   │   └── index.ts        # Zustand store
│   ├── api/                # 前端API调用
│   │   └── index.ts        # API接口定义
│   ├── utils/              # 工具函数
│   │   └── index.ts        # 通用工具
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── sql/                    # 数据库脚本
│   └── init.sql            # 初始化脚本
├── data/                   # 数据库文件目录
├── .env                    # 环境变量
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
├── tailwind.config.js      # Tailwind配置
└── README.md               # 项目说明
```

## 安装与运行

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run client:dev   # 前端开发服务器
npm run server:dev   # 后端开发服务器
```

### 生产构建

```bash
npm run build
```

## API接口

### 租户接口
- `GET /api/tenant` - 获取所有租户列表
- `GET /api/tenant/:id` - 获取单个租户详情

### 商品接口
- `GET /api/product/tenant/:tenantId` - 获取租户商品列表
- `GET /api/product/tenant/:tenantId/categories` - 获取商品分类
- `GET /api/product/:id` - 获取商品详情

### 轮播图接口
- `GET /api/banner/tenant/:tenantId` - 获取租户轮播图

### 用户接口
- `POST /api/end-user/login` - 用户登录
- `PUT /api/end-user/:id` - 更新用户信息
- `GET /api/end-user/:id` - 获取用户信息

### 订单接口
- `POST /api/order` - 创建订单
- `GET /api/order/user/:userId` - 获取用户订单列表
- `GET /api/order/:id` - 获取订单详情
- `PUT /api/order/:id/cancel` - 取消订单
- `PUT /api/order/:id/pay` - 支付订单

### 商户管理账号接口
- `POST /api/staff/login` - 商户管理员登录

## 默认测试数据

系统初始化时会创建以下测试数据：

- **商户**: 测试商户 (ID: 1)
- **商户管理员**: 手机号 `13800138000`
- **商品**: 6个示例商品（精品咖啡、抹茶蛋糕、芝士汉堡等）
- **分类**: 热门推荐、新品上市、限时特惠
- **轮播图**: 2张示例轮播图

## 注意事项

1. 本项目仅适配移动端页面
2. 数据库使用SQLite，数据文件存储在`data/database.sqlite`
3. 首次启动时会自动执行初始化脚本创建数据库和测试数据
4. 前端使用localStorage持久化用户状态