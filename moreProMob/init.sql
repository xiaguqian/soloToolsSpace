CREATE DATABASE IF NOT EXISTS merchant_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE merchant_db;

DROP TABLE IF EXISTS tenant;
CREATE TABLE tenant (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    logo VARCHAR(255),
    status TINYINT DEFAULT 1 COMMENT '0禁用 1启用',
    config_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS end_user;
CREATE TABLE end_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    openid VARCHAR(100),
    phone VARCHAR(20),
    nickname VARCHAR(50),
    address_list TEXT,
    points INT DEFAULT 0,
    tags VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS product;
CREATE TABLE product (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    status TINYINT DEFAULT 1 COMMENT '0下架 1上架',
    category VARCHAR(50),
    description TEXT,
    image_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `order`;
CREATE TABLE `order` (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    end_user_id BIGINT,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TINYINT DEFAULT 0 COMMENT '0待支付 1已支付 2已发货 3已完成 4已取消',
    pay_time DATETIME,
    ship_time DATETIME,
    finish_time DATETIME,
    items_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    FOREIGN KEY (end_user_id) REFERENCES end_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS staff;
CREATE TABLE staff (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role TINYINT DEFAULT 1 COMMENT '0平台管理员 1商户管理员 2商户员工',
    name VARCHAR(50),
    status TINYINT DEFAULT 1 COMMENT '0禁用 1启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tenant (name, logo, status, config_json) VALUES 
('测试商户', 'https://via.placeholder.com/100', 1, '{"service_phone":"400-123-4567","business_hours":"09:00-21:00"}');

INSERT INTO staff (tenant_id, phone, password_hash, role, name) VALUES 
(1, '13800138000', '$2b$10$EixZaYbB.rK4fl8x2q7Meu6Q6D2V5fF5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q', 1, '管理员');

INSERT INTO product (tenant_id, name, price, stock, status, category, description) VALUES 
(1, '商品A', 99.99, 100, 1, '电子产品', '测试商品A'),
(1, '商品B', 199.99, 50, 1, '服装', '测试商品B'),
(1, '商品C', 299.99, 30, 0, '食品', '测试商品C');

INSERT INTO end_user (tenant_id, phone, nickname, points) VALUES 
(1, '13900139001', '用户A', 100),
(1, '13900139002', '用户B', 50);

INSERT INTO `order` (tenant_id, end_user_id, order_no, total_amount, status, items_json) VALUES 
(1, 1, 'ORD202401010001', 99.99, 3, '[{"product_id":1,"name":"商品A","price":99.99,"quantity":1}]'),
(1, 2, 'ORD202401010002', 199.99, 1, '[{"product_id":2,"name":"商品B","price":199.99,"quantity":1}]'),
(1, 1, 'ORD202401020001', 299.99, 0, '[{"product_id":3,"name":"商品C","price":299.99,"quantity":1}]');