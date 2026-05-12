# 寻味 - 菜谱管理系统

一个智能菜谱管理软件，让烹饪更加轻松、智能。

## ✨ 功能特性

### 首页
- 🔍 顶部搜索：支持搜索菜谱和用户
- 🎠 走马灯展示："唯有爱与美食不可辜负"
- 📱 瀑布流展示：
  - **推荐**：双列瀑布流，按时间排序
  - **点击榜**：单列，按点赞数排序
  - **收藏榜**：单列，按收藏数排序
- 🎬 智能封面：视频媒体显示视频封面，图片媒体显示图片

### 菜谱详情
- 👨‍🍳 作者展示：可点击进入作者主页
- ❤️ 关注/取关：可关注喜欢的厨师
- 📝 步骤展示：完整的食材和步骤列表
- ⭐ 收藏点赞：底部吸底操作栏
- 🍳 开始做菜：一键进入智能做菜模式

### 智能做菜
- 🤖 AI智能拆分：通过大模型智能拆分菜谱步骤
- ⏱️ 智能计时：每个步骤都有估算时间
- ✏️ 时间调整：可手动调整每个步骤的时间
- 📢 语音提醒：倒计时结束自动语音提醒
- ⏯️ 暂停/继续：支持暂停和继续
- 🔜 下一步：手动切换到下一步

### 我的
- 📱 手机号注册：验证码验证（测试环境123456）
- 🔐 登录方式：账号密码 / 手机验证码
- 👤 个人主页：
  - 发布菜谱数
  - 获得点赞数
  - 粉丝数、关注数
  - 我的菜谱、我的收藏入口
- 🏆 用户等级：
  - **十指不沾阳春水**：未发布菜谱
  - **家庭掌勺人**：已发布菜谱
  - **厨神**：点赞或收藏超过100

## 🛠️ 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **Vant 4** - 移动端UI组件库
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Pinia** - Vue状态管理库
- **Axios** - HTTP客户端
- **SCSS** - CSS预处理器

### 后端
- **Spring Boot 3.2** - Java应用框架
- **MyBatis-Plus** - MyBatis增强工具
- **MySQL 8** - 关系型数据库
- **Redis** - 内存数据库
- **JWT** - 无状态身份认证
- **Hutool** - Java工具类库
- **FastJSON2** - JSON处理库

## 📁 项目结构

```
xunFood/
├── backend/                    # Spring Boot后端
│   ├── src/main/java/com/xunfood/
│   │   ├── XunFoodApplication.java    # 启动类
│   │   ├── common/                    # 通用类
│   │   │   ├── Result.java            # 统一响应
│   │   │   ├── PageResult.java        # 分页响应
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── config/                    # 配置类
│   │   │   ├── CorsConfig.java        # 跨域配置
│   │   │   ├── JwtConfig.java         # JWT配置
│   │   │   ├── AiConfig.java          # AI配置
│   │   │   ├── MybatisPlusConfig.java
│   │   │   └── WebMvcConfig.java
│   │   ├── controller/                # 控制器
│   │   │   ├── AuthController.java    # 认证
│   │   │   ├── UserController.java    # 用户
│   │   │   ├── RecipeController.java  # 菜谱
│   │   │   └── SearchController.java  # 搜索
│   │   ├── service/                   # 服务层
│   │   │   ├── UserService.java
│   │   │   ├── RecipeService.java
│   │   │   └── AiService.java         # AI服务（含兜底逻辑）
│   │   ├── mapper/                    # 数据访问层
│   │   ├── entity/                    # 实体类
│   │   ├── interceptor/               # 拦截器
│   │   └── utils/                     # 工具类
│   └── src/main/resources/
│       └── application.yml            # 配置文件
│
├── frontend/                   # Vue3前端
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   │   ├── Home/           # 首页（瀑布流）
│   │   │   ├── Search/         # 搜索页
│   │   │   ├── RecipeDetail/   # 菜谱详情
│   │   │   ├── Cook/           # 智能做菜
│   │   │   ├── Login/          # 登录
│   │   │   ├── Register/       # 注册
│   │   │   ├── Profile/        # 我的主页
│   │   │   ├── UserProfile/    # 用户主页
│   │   │   └── Favorites/      # 我的收藏
│   │   ├── api/                # API接口
│   │   ├── stores/             # Pinia状态
│   │   ├── router/             # 路由配置
│   │   ├── utils/              # 工具函数
│   │   ├── styles/             # 样式文件
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   └── vite.config.js
│
├── sql/
│   └── schema.sql             # 数据库脚本
├── api.md                      # 接口文档
└── readme.md                   # 项目说明
```

## 🚀 快速开始

### 前置条件
- JDK 17+
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+

### 数据库配置

1. 创建数据库并执行脚本：
```bash
mysql -uroot -p < sql/schema.sql
```

2. 数据库密码已配置为 `871502794`，如需修改请编辑 `backend/src/main/resources/application.yml`

### 后端启动

```bash
cd backend

# Maven方式
mvn spring-boot:run

# 或打包后运行
mvn clean package
java -jar target/xunfood-backend-1.0.0.jar
```

后端服务地址：`http://localhost:8080`

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

前端开发地址：`http://localhost:5173`

## ⚙️ 配置说明

### AI大模型配置

编辑 `backend/src/main/resources/application.yml`：

```yaml
xunfood:
  ai:
    provider: openai           # 模型提供商：openai / deepseek / qwen
    enabled: true              # 是否启用AI
    timeout: 30000             # 超时时间(毫秒)
    models:
      openai:
        api-key: your-openai-api-key
        base-url: https://api.openai.com/v1
        model: gpt-3.5-turbo
      deepseek:
        api-key: your-deepseek-api-key
        base-url: https://api.deepseek.com/v1
        model: deepseek-chat
      qwen:
        api-key: your-qwen-api-key
        base-url: https://dashscope.aliyuncs.com/compatible-mode/v1
        model: qwen-plus
```

**兜底逻辑说明**：
- 当AI服务禁用、配置错误、调用失败或返回空结果时，系统会自动使用兜底逻辑
- 兜底逻辑根据步骤关键词估算时间：
  - 煮/炖/蒸/煲：较长时间（至少10分钟）
  - 炒/煎/炸：中等时间（至少5分钟）
  - 切/备/洗/准备：较短时间（至少3分钟）
  - 腌/泡/醒/静置：长时间（至少15分钟）

### JWT配置

```yaml
xunfood:
  jwt:
    secret: your-secret-key
    expiration: 86400000    # 24小时
```

### Redis配置

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: ""
      database: 0
```

## 🔐 测试账号

测试环境验证码统一为：`123456`

可使用任意手机号注册登录。

## 📱 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/home` | 首页 | 瀑布流展示菜谱 |
| `/search` | 搜索 | 搜索菜谱和用户 |
| `/recipe/:id` | 菜谱详情 | 查看菜谱完整信息 |
| `/cook/:id` | 开始做菜 | 智能计时烹饪 |
| `/profile` | 我的 | 个人主页 |
| `/user/:id` | 用户主页 | 查看其他用户 |
| `/login` | 登录 | 手机号/密码登录 |
| `/register` | 注册 | 手机号注册 |
| `/favorites` | 我的收藏 | 收藏的菜谱列表 |

## 📄 接口文档

详细接口文档请查看 [api.md](./api.md)

## 🤝 大模型支持

目前支持以下大模型提供商：

| 提供商 | 配置标识 | 默认模型 |
|--------|----------|----------|
| OpenAI | `openai` | gpt-3.5-turbo |
| DeepSeek | `deepseek` | deepseek-chat |
| 通义千问 | `qwen` | qwen-plus |

**切换模型**：修改 `application.yml` 中的 `xunfood.ai.provider` 配置即可。

## 📝 开发计划

- [ ] 菜谱发布功能
- [ ] 图片/视频上传
- [ ] 评论系统
- [ ] 消息通知
- [ ] 社交分享
- [ ] 数据分析
- [ ] 暗黑模式
- [ ] PWA支持

## 📄 License

MIT License
