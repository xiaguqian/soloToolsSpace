# 桌面任务执行系统

基于 Python + Redis + MySQL + FastAPI 构建的桌面自动化任务执行系统。

## 功能特性

- 任务管理：创建桌面操作和浏览器操作任务
- 步骤配置：支持鼠标点击、键盘操作、图片识别、OCR 等多种操作
- 日程管理：将任务组合成日程，按天/周/月/季度定时执行
- 每日唯一日程：每日只能有一个可用日程，新增时自动作废其他日程
- 实时监控：通过 WebSocket 实时查看任务执行状态
- 手动触发：支持立即执行任务或日程

## 技术栈

- **后端**: FastAPI
- **数据库**: MySQL + SQLAlchemy
- **消息队列**: Redis + Celery
- **桌面自动化**: pyautogui
- **浏览器自动化**: Selenium + webdriver-manager
- **图像识别**: OpenCV + pytesseract (OCR)
- **前端**: Jinja2 模板 + 原生 JavaScript

## 项目结构

```
workTaskAutoApp/
├── app/
│   ├── database/          # 数据库模块
│   │   ├── models.py      # 数据模型
│   │   └── connection.py  # 数据库连接
│   ├── executors/         # 执行引擎
│   │   ├── desktop_executor.py   # 桌面操作引擎
│   │   ├── browser_executor.py   # 浏览器操作引擎
│   │   └── task_executor.py      # 任务协调器
│   ├── routers/           # API 路由
│   │   ├── tasks.py       # 任务管理 API
│   │   ├── schedules.py   # 日程管理 API
│   │   └── execution.py   # 执行 API
│   ├── schemas/           # Pydantic 数据模型
│   ├── templates/         # 前端模板
│   │   ├── index.html     # 主页
│   │   ├── tasks.html     # 任务管理页面
│   │   ├── schedules.html # 日程管理页面
│   │   └── dashboard.html # 执行监控页面
│   ├── config.py          # 配置文件
│   └── celery_app.py      # Celery 配置
├── main.py                # FastAPI 主应用
├── requirements.txt       # 依赖列表
├── .env.example           # 环境变量示例
└── README.md              # 项目说明
```

## 安装步骤

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 安装额外软件

- **Tesseract OCR**: 用于文字识别
  - Windows: 下载安装 https://github.com/UB-Mannheim/tesseract/wiki
  - 安装中文语言包: chi_sim

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=task_auto_app

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# Tesseract OCR 路径
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
```

### 4. 创建数据库

在 MySQL 中创建数据库：

```sql
CREATE DATABASE task_auto_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. 启动服务

需要同时运行以下三个服务：

#### 1) 启动 Web 服务
```bash
python main.py
# 或者
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2) 启动 Celery Worker (新终端)
```bash
celery -A app.celery_app.celery_app worker --loglevel=info --pool=solo
```

#### 3) 启动 Celery Beat (定时任务调度，新终端)
```bash
celery -A app.celery_app.celery_app beat --loglevel=info
```

### 6. 访问系统

打开浏览器访问：http://localhost:8000

## 使用说明

### 1. 创建任务

1. 进入「任务管理」页面
2. 点击「新建任务」
3. 填写任务信息：
   - 任务名称
   - 任务类型（桌面操作 / 浏览器操作）
4. 添加操作步骤：
   - 桌面操作：鼠标点击、键盘输入、图片识别、OCR 等
   - 浏览器操作：打开浏览器、跳转 URL、点击元素、输入文本等
5. 点击「保存」

### 2. 创建日程

1. 进入「日程管理」页面
2. 点击「新建日程」
3. 填写日程信息：
   - 日程名称
   - 执行周期（每天/每周/每月/每季度）
   - 执行时间（格式: HH:MM）
4. 选择要执行的任务（按选择顺序执行）
5. 点击「保存」
   - 注意：新建日程时，其他日程会被自动置为作废

### 3. 执行任务

方式一：定时执行
- Celery Beat 会每分钟检查日程
- 如果时间匹配，自动触发执行

方式二：手动执行
- 在「任务管理」或「日程管理」页面点击「执行」按钮
- 在「执行监控」页面点击「立即执行今日日程」

### 4. 监控执行

1. 进入「执行监控」页面
2. 查看实时执行日志
3. 统计信息：今日执行、运行中、已完成、失败

## 任务步骤类型

### 桌面操作步骤

| 步骤类型 | 说明 | 参数 |
|---------|------|------|
| mouse_click | 鼠标单击 | x, y, button, clicks |
| mouse_double_click | 鼠标双击 | x, y, button |
| mouse_move | 鼠标移动 | x, y, duration |
| mouse_scroll | 鼠标滚动 | clicks, x, y |
| key_press | 按键按下 | key |
| key_release | 按键弹起 | key |
| key_type | 键盘输入 | text, interval |
| hotkey | 快捷键 | keys (逗号分隔) |
| image_recognize | 图片识别 | template_path, confidence, region |
| ocr_recognize | 文字识别 | region, lang |
| sleep | 等待 | seconds |

### 浏览器操作步骤

| 步骤类型 | 说明 | 参数 |
|---------|------|------|
| browser_open | 打开浏览器 | browser_type |
| browser_close | 关闭浏览器 | close_all |
| browser_goto | 跳转 URL | url |
| browser_find_element | 查找元素 | by, value, timeout |
| browser_click | 点击元素 | by, value, timeout |
| browser_input | 输入文本 | by, value, text, clear_first |
| browser_get_text | 获取文本 | by, value, timeout |
| browser_switch_window | 切换窗口 | index, title |
| browser_switch_frame | 切换 Frame | index, by, value, back_to_default |
| browser_execute_js | 执行 JS | script, args |
| browser_screenshot | 截图 | filename, element_by, element_value |

## 注意事项

1. **安全警告**：系统会控制您的鼠标和键盘，执行任务时请确保：
   - 不要在任务执行期间手动操作
   - 配置好 pyautogui 安全区域（移动到屏幕左上角可紧急停止）

2. **OCR 识别**：需要安装 Tesseract OCR 并配置中文语言包

3. **浏览器驱动**：webdriver-manager 会自动下载对应浏览器版本的驱动

4. **Celery Worker**：Windows 下建议使用 `--pool=solo` 参数

5. **每日日程限制**：系统设计为每日只能有一个可用日程，这是业务需求

## 常见问题

### Q: 任务执行失败怎么办？
A: 查看「执行监控」页面的日志，检查具体错误信息

### Q: 如何获取鼠标坐标？
A: 在「任务管理」页面有「鼠标位置获取工具」，可以实时追踪鼠标位置

### Q: 如何停止正在执行的任务？
A: 将鼠标快速移动到屏幕左上角（pyautogui 的 failsafe 机制）

### Q: Celery Worker 在 Windows 下报错？
A: Windows 下 Celery 4.x 不支持 prefork pool，请使用 `--pool=solo` 参数

## 开发建议

1. 建议先创建简单的测试任务（如点击、等待）来验证系统
2. 复杂任务建议分步调试，每步之间添加等待时间
3. 使用截图功能帮助调试和创建图像识别模板
4. 定期查看执行日志，优化任务步骤
