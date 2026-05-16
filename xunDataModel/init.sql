-- 大模型管理平台数据库初始化脚本
-- 创建时间: 2026-05-12

-- 创建数据库
CREATE DATABASE IF NOT EXISTS xun_model_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE xun_model_platform;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    full_name VARCHAR(100) COMMENT '真实姓名',
    role ENUM('admin', 'team_admin', 'user') NOT NULL DEFAULT 'user' COMMENT '用户角色',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否激活',
    last_login_at DATETIME COMMENT '最后登录时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 团队表
CREATE TABLE IF NOT EXISTS teams (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '团队ID',
    name VARCHAR(100) NOT NULL COMMENT '团队名称',
    description TEXT COMMENT '团队描述',
    owner_id INT NOT NULL COMMENT '团队管理员ID',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否激活',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_owner_id (owner_id),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='团队表';

-- 团队成员表
CREATE TABLE IF NOT EXISTS team_members (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    team_id INT NOT NULL COMMENT '团队ID',
    user_id INT NOT NULL COMMENT '用户ID',
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    UNIQUE KEY uk_team_user (team_id, user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='团队成员表';

-- 模型标签表
CREATE TABLE IF NOT EXISTS model_tags (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '标签ID',
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
    description TEXT COMMENT '标签描述',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模型标签表';

-- 模型提供商表
CREATE TABLE IF NOT EXISTS model_providers (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '提供商ID',
    name VARCHAR(100) NOT NULL UNIQUE COMMENT '提供商名称',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模型提供商表';

-- API类型表
CREATE TABLE IF NOT EXISTS api_types (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'API类型ID',
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'API类型名称',
    description TEXT COMMENT '类型描述',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='API类型表';

-- 模型表
CREATE TABLE IF NOT EXISTS models (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '模型ID',
    name VARCHAR(100) NOT NULL COMMENT '模型名称',
    provider_id INT NOT NULL COMMENT '模型提供商ID',
    version VARCHAR(100) COMMENT '模型版本',
    api_type_id INT NOT NULL COMMENT 'API类型ID',
    request_url VARCHAR(500) NOT NULL COMMENT '请求地址',
    api_key VARCHAR(500) NOT NULL COMMENT 'API Key',
    organization_id VARCHAR(255) COMMENT '组织ID',
    proxy_url VARCHAR(500) COMMENT '代理URL',
    default_params JSON COMMENT '默认请求参数',
    description TEXT COMMENT '用途说明',
    is_enabled TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否启用',
    has_free_quota TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否有免费额度',
    remaining_quota INT DEFAULT NULL COMMENT '剩余免费额度',
    request_count INT NOT NULL DEFAULT 0 COMMENT '请求次数',
    owner_id INT NOT NULL COMMENT '所属用户ID',
    is_team_shared TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否团队共享',
    team_id INT DEFAULT NULL COMMENT '所属团队ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_owner_id (owner_id),
    INDEX idx_team_id (team_id),
    INDEX idx_is_enabled (is_enabled),
    INDEX idx_provider_id (provider_id),
    FOREIGN KEY (provider_id) REFERENCES model_providers(id),
    FOREIGN KEY (api_type_id) REFERENCES api_types(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模型表';

-- 模型-标签关联表
CREATE TABLE IF NOT EXISTS model_tag_relations (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    model_id INT NOT NULL COMMENT '模型ID',
    tag_id INT NOT NULL COMMENT '标签ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_model_tag (model_id, tag_id),
    INDEX idx_model_id (model_id),
    INDEX idx_tag_id (tag_id),
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES model_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模型-标签关联表';

-- API网关配置表
CREATE TABLE IF NOT EXISTS api_gateway (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'API ID',
    name VARCHAR(100) NOT NULL COMMENT 'API名称',
    path VARCHAR(255) NOT NULL COMMENT 'API路径',
    method VARCHAR(20) NOT NULL DEFAULT 'POST' COMMENT '请求方法',
    description TEXT COMMENT 'API描述',
    is_enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_path (path),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='API网关配置表';

-- API请求日志表
CREATE TABLE IF NOT EXISTS api_request_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    user_id INT COMMENT '请求用户ID',
    model_id INT COMMENT '使用的模型ID',
    request_path VARCHAR(500) NOT NULL COMMENT '请求路径',
    request_method VARCHAR(20) NOT NULL COMMENT '请求方法',
    source_ip VARCHAR(50) COMMENT '来源IP',
    user_agent VARCHAR(500) COMMENT '用户代理',
    status_code INT COMMENT '状态码',
    response_time INT COMMENT '响应时间(ms)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '请求时间',
    INDEX idx_user_id (user_id),
    INDEX idx_model_id (model_id),
    INDEX idx_created_at (created_at),
    INDEX idx_source_ip (source_ip),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='API请求日志表';

-- 访问控制名单表
CREATE TABLE IF NOT EXISTS access_control (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    type ENUM('whitelist', 'blacklist') NOT NULL COMMENT '名单类型',
    ip_address VARCHAR(50) NOT NULL COMMENT 'IP地址',
    description TEXT COMMENT '说明',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_type_ip (type, ip_address),
    INDEX idx_type (type),
    INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访问控制名单表';

-- 系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    setting_key VARCHAR(100) NOT NULL UNIQUE COMMENT '设置键',
    setting_value TEXT COMMENT '设置值',
    description TEXT COMMENT '设置描述',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统设置表';

-- 插入初始数据

-- 初始管理员用户 (密码: admin123)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES 
('admin', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYGy1cyxqH82qW2', '系统管理员', 'admin');

-- 初始模型标签
INSERT INTO model_tags (name, description) VALUES 
('文本生成', '文本生成类模型'),
('文生图', '根据文本生成图像'),
('图生图', '根据图像生成图像'),
('语音转文字', '语音识别转文字'),
('文字转语音', '文字合成语音'),
('代码生成', '代码生成和补全'),
('多模态', '多模态理解模型'),
('情感分析', '情感分析模型');

-- 初始模型提供商
INSERT INTO model_providers (name) VALUES 
('OpenAI'),
('Claude (Anthropic)'),
('Google (Gemini)'),
('百度文心一言'),
('阿里通义千问'),
('讯飞星火'),
('智谱AI'),
('本地部署');

-- 初始API类型
INSERT INTO api_types (name, description) VALUES 
('OpenAI 兼容', '兼容OpenAI API格式'),
('原生API', '模型提供商原生API'),
('REST API', '标准RESTful API');

-- 初始API网关配置
INSERT INTO api_gateway (name, path, method, description) VALUES 
('聊天补全', '/v1/chat/completions', 'POST', '聊天对话API'),
('文本补全', '/v1/completions', 'POST', '文本补全API'),
('图像生成', '/v1/images/generations', 'POST', '图像生成API'),
('嵌入', '/v1/embeddings', 'POST', '文本嵌入API');

-- 模型快捷入口表
CREATE TABLE IF NOT EXISTS model_shortcuts (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    model_id INT NOT NULL COMMENT '关联模型ID',
    shortcut_type ENUM('official', 'documentation', 'api_reference', 'pricing', 'status') NOT NULL COMMENT '快捷入口类型',
    url VARCHAR(1000) NOT NULL COMMENT '链接地址',
    name VARCHAR(100) COMMENT '入口名称',
    description TEXT COMMENT '描述',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_model_id (model_id),
    INDEX idx_shortcut_type (shortcut_type),
    UNIQUE KEY uk_model_type (model_id, shortcut_type),
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模型快捷入口表';

-- 系统设置
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('system_enabled', '1', '系统是否允许访问'),
('auto_route_priority', 'free_quota,popularity', '自动路由优先级');
