
# 多租户餐饮点餐系统 - 用户端

这是一个多租户餐饮点餐系统的用户端代码，支持堂食扫码点餐和外卖点餐两种模式，采用前后端分离架构。

## 功能特性

### 入口与识别
- **堂食入口**: 扫描桌码 → URL 携带 tenant_id 和 table_id → 自动进入点餐页面
- **外卖入口**: 首页直接展示外卖模式（若有多个商户则先选商户）
- 支持切换堂食/外卖模式

### 点餐流程
| 模块 | 功能 |
|------|------|
| 商品展示 | 按分类展示商品（名称、价格、图片），支持搜索 |
| 商品详情 | 规格选择、数量调整 |
| 购物车 | 堂食/外卖购物车独立，显示商品列表、总价；支持增减、清空 |
| 下单 | 堂食：自动带入桌号 → 确认订单 → 支付；外卖：填写/选择收货地址 → 确认订单 → 支付 |
| 订单记录 | 历史订单列表、订单详情（商品、价格、状态） |
| 订单状态 | 待支付、已支付/待接单、制作中、已完成、已取消 |

### 个人中心
- 收货地址管理（外卖用）
- 我的订单（查询与状态跟踪）
- 联系商家（一键拨打商户电话）

## 技术架构

### 前端技术栈
- React 18 + TypeScript
- Vite 构建工具
- Tailwind CSS 3 样式框架
- Zustand 状态管理
- React Router DOM 路由
- Axios HTTP 客户端
- Lucide React 图标库

### 后端技术栈
- Express.js 4 + TypeScript
- MySQL 8.0+ 数据库

### 端口配置
- 后端服务端口: 8011
- 前端开发端口: 5173

## 项目结构

```
├── .trae/
│   └── documents/          # 项目文档
│       ├── PRD.md          # 产品需求文档
│       └── TechnicalArchitecture.md  # 技术架构文档
├── api/                    # 后端代码
│   ├── config/             # 配置文件
│   │   └── db.ts          # 数据库连接配置
│   ├── routes/             # API 路由
│   │   ├── tenants.ts      # 租户相关接口
│   │   ├── products.ts     # 商品相关接口
│   │   ├── orders.ts       # 订单相关接口
│   │   ├── addresses.ts    # 地址相关接口
│   │   └── auth.ts         # 认证接口
│   ├── types/              # TypeScript 类型定义
│   ├── app.ts              # Express 应用配置
│   ├── server.ts           # 服务器入口
│   └── index.ts            # 导出模块
├── src/                    # 前端代码
│   ├── components/         # 公共组件
│   │   └── BottomNav.tsx   # 底部导航栏
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx        # 首页（商户选择）
│   │   ├── Menu.tsx        # 点餐页面
│   │   ├── ProductDetail.tsx # 商品详情页
│   │   ├── Cart.tsx        # 购物车页面
│   │   ├── OrderConfirm.tsx # 订单确认页
│   │   ├── Orders.tsx      # 订单列表页
│   │   ├── OrderDetail.tsx # 订单详情页
│   │   ├── Profile.tsx     # 个人中心
│   │   ├── Addresses.tsx   # 收货地址管理
│   │   └── Settings.tsx    # 设置页面
│   ├── store/              # 状态管理
│   │   └── useStore.ts     # Zustand store
│   ├── api/                # API 封装
│   │   └── index.ts        # API 接口定义
│   ├── types/              # TypeScript 类型定义
│   ├── App.tsx             # 应用入口组件
│   ├── main.tsx            # React 入口文件
│   └── index.css           # 全局样式
├── init.sql                # 数据库初始化脚本
├── package.json            # 项目依赖配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
├── tailwind.config.js      # Tailwind CSS 配置
└── postcss.config.js       # PostCSS 配置
```

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- MySQL >= 8.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 数据库配置

1. 创建 MySQL 数据库：
```sql
CREATE DATABASE clm_mob;
```

2. 数据库密码已在配置中设置为：`871502794`

3. 运行数据库初始化脚本：
```bash
mysql -u root -p clm_mob < init.sql
```

### 启动开发服务器

```bash
# 同时启动前端和后端
pnpm run dev

# 或分别启动
pnpm run dev:front  # 前端开发服务器
pnpm run dev:back   # 后端开发服务器
```

### 访问地址

- 前端页面: http://localhost:5173
- 后端 API: http://localhost:8011/api

## API 接口

### 租户相关
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/tenants | 获取所有租户列表 |
| GET | /api/tenants/:id | 获取租户详情 |

### 商品相关
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/:tenantId/categories | 获取商户商品分类 |
| GET | /api/:tenantId/products | 获取商户商品列表 |
| GET | /api/:tenantId/products/:productId | 获取商品详情 |

### 订单相关
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/orders | 创建订单 |
| GET | /api/orders | 获取订单列表 |
| GET | /api/orders/:orderId | 获取订单详情 |
| POST | /api/orders/:orderId/pay | 支付订单 |
| POST | /api/orders/:orderId/cancel | 取消订单 |

### 地址相关
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/addresses | 获取收货地址列表 |
| POST | /api/addresses | 创建收货地址 |
| PUT | /api/addresses/:id | 更新收货地址 |
| DELETE | /api/addresses/:id | 删除收货地址 |

## 桌码扫描说明

桌码 URL 格式：
```
http://localhost:5173?tenantId=1&tableId=1
```

扫描该 URL 后，系统会自动进入堂食点餐模式，并带入对应的桌号信息。

## 数据库结构

### 核心表结构

**tenant（租户表）**
- id, name, logo, tel, business_hours, enable_takeout, min_delivery_amount, delivery_fee

**dining_table（桌号表）**
- id, tenant_id, table_name, qrcode_url, status

**category（商品分类）**
- id, tenant_id, name, sort_order

**product（商品表）**
- id, tenant_id, category_id, name, price, image, stock, status, description

**product_sku（商品规格）**
- id, product_id, spec_name, price_extra

**orders（订单表）**
- id, tenant_id, order_no, type, table_id, address_id, total_amount, pay_status, order_status, pay_time, create_time

**order_item（订单商品明细）**
- id, order_id, product_name, price, quantity

**user_address（外卖地址）**
- id, tenant_id, user_phone, receiver, phone, address_detail, is_default

**admin_user（管理端账号）**
- id, tenant_id, phone, password_hash, name, role

## 部署说明

### 前端部署

```bash
# 构建生产版本
pnpm run build

# 将 dist 目录部署到静态服务器
```

### 后端部署

```bash
# 构建后端
pnpm run build:back

# 启动生产服务器
pnpm run start
```

### 注意事项
- 用户端部署到公网
- 管理端（需另行开发）部署到用户内网
- 数据库统一使用本地数据库，确保两套系统数据一致性

## 开发规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 组件文件不超过 200 行
- 使用 Tailwind CSS 进行样式开发
- 使用 Zustand 进行状态管理

## 许可证

MIT License
