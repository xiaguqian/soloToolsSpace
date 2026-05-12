# 迅读 (XunReader)

跨平台桌面小说阅读软件，基于 Electron + React + SQLite 构建。

## 功能特性

### 1. 阅读模块
- 支持 TXT、CHM、PDF 等多种格式
- 可调整字体大小
- 日间/夜间阅读模式切换
- 多种背景颜色可选
- 多种背景图案可选

### 2. 书架管理
- 个人书架分组管理
- 默认书架与自定义书架
- 书架预览（最多 9 本）
- 点击展开查看全部书籍

### 3. 阅读历史
- 自动记录阅读历史
- 统计阅读次数
- 支持删除历史记录

### 4. 云书城
- 获取云端书籍列表
- 展示书籍名称、简介、封面、更新状态
- 点击进入书籍详情页
- 支持目录浏览

### 5. AI 智能解析
- 输入在线小说链接
- 自动识别类型（书籍/书城/章节）
- 智能跳转对应页面

### 6. 环境切换
- 本地环境：读取 mock JSON 文件
- 开发环境：连接开发服务器
- 生产环境：连接生产服务器

### 7. 付费机制
- 保留付费能力
- 当前版本免费使用
- 调用接口查询付费状态

## 技术栈

- **Electron**: 跨平台桌面应用框架
- **React**: 前端 UI 框架
- **TypeScript**: 类型安全
- **Vite**: 构建工具
- **SQLite (better-sqlite3)**: 本地数据存储
- **electron-store**: 配置存储
- **react-router-dom**: 路由管理

## 项目结构

```
xunReader/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── main.ts        # 主进程入口
│   │   ├── preload.ts     # 预加载脚本
│   │   ├── database.ts    # SQLite 数据库
│   │   └── api.ts         # IPC 接口处理
│   ├── renderer/          # 渲染进程（前端）
│   │   ├── main.tsx       # 入口文件
│   │   ├── App.tsx        # 根组件
│   │   ├── styles.css     # 全局样式
│   │   ├── pages/         # 页面组件
│   │   └── components/    # 公共组件
│   └── shared/            # 共享类型
├── mock/                  # 本地 mock 数据
├── script/                # 打包脚本
├── api.md                 # API 文档
├── package.json
├── tsconfig.json
├── tsconfig.main.json
└── vite.config.ts
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 运行

```bash
npm start
```

### 打包

#### Windows
```bash
npm run package:win
```
或
```bash
./script/package-win.bat
```

#### macOS
```bash
npm run package:mac
```
或
```bash
./script/package-mac.sh
```

## 环境配置

### 切换环境

在应用顶部导航栏右侧的下拉框中选择：
- **本地**：读取 mock 目录下的 JSON 文件
- **开发**：连接 https://dev-api.xunreader.com
- **生产**：连接 https://api.xunreader.com

### 设备标识

应用首次启动时会生成唯一设备标识（deviceId），并持久化存储。所有后端接口请求都会带上该标识。

## 本地 Mock 数据

Mock 文件位于 `mock/` 目录下：

- `_bookstore_list.json` - 云书城列表
- `_book_detail.json` - 书籍详情
- `_ai_parse.json` - AI 解析结果
- `_payment_check.json` - 付费状态查询

文件命名规则：将接口路径中的 `/` 替换为 `_`，前面加 `_`。

## API 文档

详细的后端接口文档请参考 [api.md](./api.md)。

## 数据存储

应用数据存储位置：
- Windows: `%APPDATA%/xun-reader/`
- macOS: `~/Library/Application Support/xun-reader/`

包含：
- `xunreader.db` - SQLite 数据库（书架、历史记录）
- `xunreader-config.json` - 应用配置

## 许可证

MIT
