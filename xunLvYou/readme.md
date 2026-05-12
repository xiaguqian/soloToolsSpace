# 寻旅游 - 旅游与穿搭结合的移动端H5应用

## 项目简介

寻旅游是一款集旅游攻略、出行计划、智能穿搭于一体的移动端H5应用。用户可以浏览景点、发布出行笔记、创建出行计划、使用AI生成穿搭效果和智能出行图片集。

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **UI组件库**: Vant 4
- **路由管理**: Vue Router 4
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **构建工具**: Vite

## 项目结构

```
xunLvYou/
├── src/
│   ├── api/              # API接口层
│   │   ├── scenic.js     # 景点相关接口
│   │   ├── note.js       # 笔记相关接口
│   │   ├── plan.js       # 计划相关接口
│   │   ├── smartTravel.js # 智能云出行接口
│   │   ├── outfit.js     # 穿搭模块接口
│   │   ├── gallery.js    # 图集接口
│   │   ├── favorite.js   # 收藏接口
│   │   └── user.js       # 用户接口
│   ├── components/       # 公共组件
│   │   ├── Tabbar.vue
│   │   ├── WaterfallList.vue
│   │   ├── PlanList.vue
│   │   └── GalleryGrid.vue
│   ├── config/           # 配置文件
│   │   └── env.js        # 环境配置
│   ├── data/             # 本地模拟数据
│   │   ├── scenic-list.json
│   │   ├── scenic-detail.json
│   │   ├── note-list.json
│   │   ├── note-detail.json
│   │   ├── plan-list.json
│   │   ├── plan-detail.json
│   │   ├── guide-result.json
│   │   ├── smart-travel-result.json
│   │   ├── outfit-result.json
│   │   ├── gallery-list.json
│   │   ├── favorites-list.json
│   │   └── user-info.json
│   ├── router/           # 路由配置
│   │   └── index.js
│   ├── styles/           # 全局样式
│   │   └── index.css
│   ├── utils/            # 工具函数
│   │   ├── request.js    # HTTP请求封装
│   │   └── localDataLoader.js # 本地数据加载器
│   ├── views/            # 页面视图
│   │   ├── scenic/       # 景点模块
│   │   ├── notes/        # 笔记模块
│   │   ├── plans/        # 计划模块
│   │   ├── smart-travel/ # 智能云出行
│   │   ├── outfit/       # 穿搭模块
│   │   ├── gallery/      # 个人图集
│   │   ├── favorites/    # 个人收藏
│   │   └── profile/      # 个人中心
│   ├── App.vue
│   └── main.js
├── index.html
├── vite.config.js
├── package.json
├── api.md                # API接口文档
└── readme.md             # 项目说明
```

## 核心功能

### 1. 景点浏览
- 瀑布流展示景点列表
- 支持搜索和筛选（出行方式、收费类型、景点类型）
- 根据定位智能推荐
- 景点详情查看和收藏

### 2. 出行笔记
- 浏览所有用户的出行笔记
- 按景点查看相关笔记
- 发布自己的出行笔记
- 收藏喜欢的笔记

### 3. 出行计划
- 创建和管理出行计划
- 选择多个景点
- AI生成出行攻略
- 计划状态管理（待出行/已出行/已取消）
- 取消计划时可选择进入智能云出行

### 4. 智能云出行
- 选择景点和穿搭图片
- 调用AI服务生成旅行图片集
- 支持从个人图集中选择图片
- 生成结果可保存到个人图集

### 5. 穿搭模块
- 上传衣服图片和个人照片
- AI生成试穿效果
- 支持从个人图集中选择
- 结果可保存到个人图集

### 6. 个人图集
- 支持手动上传图片
- 自动保存AI生成的图片
- 按类型分类（穿搭/智能出行/手动上传）
- 支持删除图片

### 7. 个人收藏
- 收藏笔记
- 收藏景点
- 收藏图片
- 分类展示

## 环境切换

### 环境配置文件
`src/config/env.js`

### 支持的环境
- **local**: 本地开发环境，使用本地JSON模拟数据
- **dev**: 开发环境
- **test**: 测试环境
- **prod**: 生产环境

### 切换环境
修改 `src/config/env.js` 文件中的 `currentEnv` 变量：

```javascript
const currentEnv = ENV.LOCAL  // 本地环境
// const currentEnv = ENV.DEV   // 开发环境
// const currentEnv = ENV.TEST  // 测试环境
// const currentEnv = ENV.PROD  // 生产环境
```

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 本地开发说明

项目默认使用本地环境，所有接口都会读取 `src/data/` 目录下的JSON模拟数据。这样可以确保在没有后端服务的情况下也能完整体验所有功能。

### 本地JSON数据

本地JSON数据文件位于 `src/data/` 目录，包含：

- `scenic-list.json`: 景点列表数据
- `scenic-detail.json`: 景点详情数据
- `note-list.json`: 笔记列表数据
- `note-detail.json`: 笔记详情数据
- `plan-list.json`: 计划列表数据
- `plan-detail.json`: 计划详情数据
- `guide-result.json`: AI生成的攻略结果
- `smart-travel-result.json`: 智能云出行AI生成结果
- `outfit-result.json`: 穿搭AI生成结果
- `gallery-list.json`: 个人图集数据
- `favorites-list.json`: 收藏数据
- `user-info.json`: 用户信息数据

### 修改本地图片地址

在本地环境下，AI生成的图片地址可以直接修改对应的JSON文件：

- 智能云出行结果: `src/data/smart-travel-result.json`
- 穿搭生成结果: `src/data/outfit-result.json`

## 后续集成

### 集成到App

本项目是纯前端H5应用，可以通过以下方式集成到App：

1. **WebView方式**: 在App中使用WebView加载H5页面
2. **混合开发**: 使用UniApp、Flutter等框架打包
3. **小程序**: 可以轻松迁移到微信小程序等平台

### 后端对接

当后端服务就绪后，只需：

1. 修改 `src/config/env.js` 中的环境配置
2. 确保 `src/utils/request.js` 中的baseURL配置正确
3. 后端接口按照 `api.md` 文档实现

## 浏览器兼容性

- iOS 11+
- Android 6.0+
- Chrome 60+
- Safari 11+

## 许可证

MIT License
