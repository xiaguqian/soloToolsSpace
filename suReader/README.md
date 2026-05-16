# SuReader - 桌面小说阅读器

一款基于 Electron + React + SQLite 构建的跨平台桌面小说阅读软件。

## 功能特性

### 📚 阅读模块
- 支持 txt、chm、pdf 格式阅读
- 可调整阅读背景颜色和图案
- 支持日间/夜间阅读模式
- 可调整字体大小
- 翻页导航支持键盘和触控

### 📖 书架管理
- 个人书架分组管理
- 阅读历史记录（自动记录阅读书籍）
- 默认书架不可删除，但可设置新默认书架
- 书籍预览（最多展示9本）

### 🏪 云书城
- 调用后台接口获取书籍列表
- 展示书籍封面、简介、更新时间、完结状态
- 书籍详情页（目录、简介）
- 一键阅读和加入书架

### 🤖 AI智能解析
- 输入在线小说链接自动解析
- 识别书籍、书城、章节类型
- 根据识别结果跳转对应页面

## 技术栈

- **框架**: Electron 28.x + React 18.x
- **状态管理**: Zustand
- **样式**: Tailwind CSS 3.x
- **数据库**: SQLite 3.x
- **构建工具**: Vite 5.x

## 环境要求

- Node.js >= 18.x
- npm >= 9.x

## 安装与运行

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产构建

```bash
# 构建前端资源
npm run build

# Windows 打包
npm run electron:build:win

# Mac 打包
npm run electron:build:mac
```

## 项目结构

```
suReader/
├── src/
│   ├── components/          # 组件目录
│   │   ├── Reader/         # 阅读模块组件
│   │   ├── Shelf/          # 书架组件
│   │   ├── Store/          # 书城组件
│   │   ├── Parser/         # AI解析组件
│   │   └── Layout/         # 布局组件
│   ├── pages/              # 页面组件
│   ├── store/              # 状态管理
│   ├── services/           # API服务
│   ├── utils/              # 工具函数
│   ├── mock/               # Mock数据
│   ├── assets/             # 静态资源
│   ├── App.jsx             # 主应用组件
│   ├── main.jsx            # 入口文件
│   └── index.css           # 全局样式
├── electron.js             # Electron入口
├── vite.config.js          # Vite配置
├── tailwind.config.js      # Tailwind配置
├── postcss.config.js       # PostCSS配置
├── package.json            # 项目配置
├── api.md                  # API文档
├── README.md               # 项目说明
└── script/                 # 打包脚本
```

## 环境切换

默认使用本地mock数据，可通过环境变量切换：

```bash
# 开发环境（本地mock）
NODE_ENV=development

# 生产环境（调用真实接口）
REACT_APP_ENV=production
REACT_APP_API_URL=https://api.sureader.com
```

## 协议

MIT License
