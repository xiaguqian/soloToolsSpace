CREATE DATABASE IF NOT EXISTS xunfood DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE xunfood;

CREATE TABLE IF NOT EXISTS user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    phone VARCHAR(20) UNIQUE COMMENT '手机号',
    username VARCHAR(50) COMMENT '用户名',
    nickname VARCHAR(50) COMMENT '昵称',
    password VARCHAR(255) COMMENT '密码',
    avatar VARCHAR(255) COMMENT '头像',
    bio VARCHAR(500) COMMENT '简介',
    recipe_count INT DEFAULT 0 COMMENT '发布菜谱数',
    like_count INT DEFAULT 0 COMMENT '获得点赞数',
    favorite_count INT DEFAULT 0 COMMENT '获得收藏数',
    follower_count INT DEFAULT 0 COMMENT '粉丝数',
    following_count INT DEFAULT 0 COMMENT '关注数',
    level TINYINT DEFAULT 0 COMMENT '用户等级：0-十指不沾阳春水 1-家庭掌勺人 2-厨神',
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS recipe (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '菜谱ID',
    user_id BIGINT NOT NULL COMMENT '作者ID',
    title VARCHAR(100) NOT NULL COMMENT '菜谱标题',
    description VARCHAR(500) COMMENT '简介',
    cover VARCHAR(255) COMMENT '封面图',
    difficulty TINYINT DEFAULT 1 COMMENT '难度：1-简单 2-中等 3-困难',
    cook_time INT DEFAULT 30 COMMENT '烹饪时间(分钟)',
    serving INT DEFAULT 2 COMMENT '份量',
    ingredients TEXT COMMENT '食材列表(JSON)',
    steps TEXT COMMENT '步骤列表(JSON)',
    media TEXT COMMENT '媒体列表(JSON)',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    favorite_count INT DEFAULT 0 COMMENT '收藏数',
    view_count INT DEFAULT 0 COMMENT '浏览数',
    status TINYINT DEFAULT 1 COMMENT '状态：0-隐藏 1-公开',
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_like_count (like_count),
    INDEX idx_favorite_count (favorite_count),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜谱表';

CREATE TABLE IF NOT EXISTS user_like (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    recipe_id BIGINT NOT NULL COMMENT '菜谱ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_recipe (user_id, recipe_id),
    INDEX idx_recipe_id (recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞表';

CREATE TABLE IF NOT EXISTS user_favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    recipe_id BIGINT NOT NULL COMMENT '菜谱ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_recipe (user_id, recipe_id),
    INDEX idx_recipe_id (recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

CREATE TABLE IF NOT EXISTS user_follow (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    follower_id BIGINT NOT NULL COMMENT '关注者ID',
    following_id BIGINT NOT NULL COMMENT '被关注者ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_follower_following (follower_id, following_id),
    INDEX idx_following_id (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注表';
