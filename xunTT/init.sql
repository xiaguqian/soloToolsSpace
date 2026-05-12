-- ============================================
-- SoloIM 数据库初始化脚本
-- ============================================

CREATE DATABASE IF NOT EXISTS solo_im DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE solo_im;

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS t_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    phone VARCHAR(20) UNIQUE COMMENT '手机号',
    email VARCHAR(100) UNIQUE COMMENT '邮箱',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(500) COMMENT '头像URL',
    signature VARCHAR(200) COMMENT '个性签名',
    gender TINYINT DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
    region VARCHAR(100) COMMENT '地区',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
    is_online TINYINT DEFAULT 0 COMMENT '是否在线：0-离线，1-在线',
    last_login_time DATETIME COMMENT '最后登录时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_phone (phone),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================
-- 用户设置表
-- ============================================
CREATE TABLE IF NOT EXISTS t_user_setting (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE COMMENT '用户ID',
    auto_startup TINYINT DEFAULT 0 COMMENT '开机自启：0-关闭，1-开启',
    remember_password TINYINT DEFAULT 0 COMMENT '记住密码：0-否，1-是',
    auto_login TINYINT DEFAULT 0 COMMENT '自动登录：0-否，1-是',
    last_login_username VARCHAR(50) COMMENT '上次登录用户名',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户设置表';

-- ============================================
-- 好友分组表
-- ============================================
CREATE TABLE IF NOT EXISTS t_friend_group (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    group_name VARCHAR(50) NOT NULL COMMENT '分组名称',
    is_default TINYINT DEFAULT 0 COMMENT '是否默认分组：0-否，1-是',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='好友分组表';

-- ============================================
-- 好友关系表
-- ============================================
CREATE TABLE IF NOT EXISTS t_friend (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    friend_id BIGINT NOT NULL COMMENT '好友ID',
    group_id BIGINT COMMENT '分组ID',
    remark VARCHAR(50) COMMENT '备注名称',
    tags VARCHAR(500) COMMENT '标签（JSON格式）',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，2-黑名单',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_friend (user_id, friend_id),
    INDEX idx_user_id (user_id),
    INDEX idx_friend_id (friend_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='好友关系表';

-- ============================================
-- 好友请求表
-- ============================================
CREATE TABLE IF NOT EXISTS t_friend_request (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_user_id BIGINT NOT NULL COMMENT '发送者ID',
    to_user_id BIGINT NOT NULL COMMENT '接收者ID',
    message VARCHAR(200) COMMENT '验证消息',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待处理，1-已通过，2-已拒绝，3-已忽略',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_from_user (from_user_id),
    INDEX idx_to_user (to_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='好友请求表';

-- ============================================
-- 群组表
-- ============================================
CREATE TABLE IF NOT EXISTS t_group (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(50) NOT NULL COMMENT '群名称',
    group_avatar VARCHAR(500) COMMENT '群头像',
    group_owner_id BIGINT NOT NULL COMMENT '群主ID',
    announcement VARCHAR(500) COMMENT '群公告',
    member_count INT DEFAULT 0 COMMENT '成员数量',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_owner (group_owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='群组表';

-- ============================================
-- 群成员表
-- ============================================
CREATE TABLE IF NOT EXISTS t_group_member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL COMMENT '群组ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role TINYINT DEFAULT 2 COMMENT '角色：1-群主，2-管理员，3-普通成员',
    group_nickname VARCHAR(50) COMMENT '群内昵称',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_group_user (group_id, user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='群成员表';

-- ============================================
-- 消息表
-- ============================================
CREATE TABLE IF NOT EXISTS t_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL COMMENT '会话ID（单聊：user1_user2，群聊：group_groupId）',
    conversation_type TINYINT NOT NULL COMMENT '会话类型：1-单聊，2-群聊',
    sender_id BIGINT NOT NULL COMMENT '发送者ID',
    receiver_id BIGINT COMMENT '接收者ID（单聊时使用）',
    group_id BIGINT COMMENT '群组ID（群聊时使用）',
    message_type TINYINT NOT NULL COMMENT '消息类型：1-文本，2-图片，3-表情，4-文件，5-系统消息',
    content TEXT COMMENT '消息内容',
    file_url VARCHAR(500) COMMENT '文件/图片URL',
    file_name VARCHAR(255) COMMENT '文件名',
    file_size BIGINT COMMENT '文件大小',
    quote_message_id BIGINT COMMENT '引用的消息ID',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，2-已撤回',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation (conversation_id, created_at),
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_group (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- ============================================
-- 消息已读记录表
-- ============================================
CREATE TABLE IF NOT EXISTS t_message_read (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL COMMENT '消息ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_message_user (message_id, user_id),
    INDEX idx_message (message_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息已读记录表';

-- ============================================
-- 会话表
-- ============================================
CREATE TABLE IF NOT EXISTS t_conversation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    conversation_id VARCHAR(100) NOT NULL COMMENT '会话ID',
    conversation_type TINYINT NOT NULL COMMENT '会话类型：1-单聊，2-群聊',
    target_id BIGINT NOT NULL COMMENT '目标ID（好友ID或群ID）',
    last_message_id BIGINT COMMENT '最后一条消息ID',
    unread_count INT DEFAULT 0 COMMENT '未读消息数',
    is_top TINYINT DEFAULT 0 COMMENT '是否置顶：0-否，1-是',
    is_mute TINYINT DEFAULT 0 COMMENT '是否静音：0-否，1-是',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_conversation (user_id, conversation_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会话表';

-- ============================================
-- 表情表
-- ============================================
CREATE TABLE IF NOT EXISTS t_emoji (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT COMMENT '用户ID（系统表情为NULL）',
    emoji_name VARCHAR(50) NOT NULL COMMENT '表情名称',
    emoji_url VARCHAR(500) NOT NULL COMMENT '表情图片URL',
    is_system TINYINT DEFAULT 0 COMMENT '是否系统表情：0-否，1-是',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='表情表';

-- ============================================
-- 插入系统表情数据
-- ============================================
INSERT INTO t_emoji (emoji_name, emoji_url, is_system, sort_order) VALUES
('smile', '😊', 1, 1),
('laugh', '😂', 1, 2),
('cry', '😭', 1, 3),
('angry', '😠', 1, 4),
('heart', '❤️', 1, 5),
('thumbs_up', '👍', 1, 6),
('ok', '👌', 1, 7),
('bye', '👋', 1, 8),
('rose', '🌹', 1, 9),
('sun', '☀️', 1, 10),
('moon', '🌙', 1, 11),
('star', '⭐', 1, 12),
('fire', '🔥', 1, 13),
('cool', '😎', 1, 14),
('shock', '😱', 1, 15);

-- ============================================
-- 创建索引
-- ============================================
CREATE INDEX idx_message_conversation_created ON t_message(conversation_id, created_at DESC);
CREATE INDEX idx_conversation_user_updated ON t_conversation(user_id, updated_at DESC);
