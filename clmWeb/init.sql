CREATE DATABASE IF NOT EXISTS `catering_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `catering_system`;

DROP TABLE IF EXISTS `tenant`;
CREATE TABLE `tenant` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '租户ID',
  `name` VARCHAR(100) NOT NULL COMMENT '店铺名称',
  `logo` VARCHAR(500) DEFAULT '' COMMENT '店铺Logo',
  `tel` VARCHAR(20) DEFAULT '' COMMENT '联系电话',
  `business_hours` VARCHAR(100) DEFAULT '' COMMENT '营业时间',
  `enable_takeout` TINYINT(1) DEFAULT 0 COMMENT '是否开启外卖',
  `min_delivery_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '起送价',
  `delivery_fee` DECIMAL(10,2) DEFAULT 0 COMMENT '配送费',
  `delivery_range` VARCHAR(500) DEFAULT '' COMMENT '配送范围',
  `wx_pay_params` TEXT COMMENT '微信支付参数',
  `alipay_params` TEXT COMMENT '支付宝支付参数',
  `printer_params` TEXT COMMENT '云打印机参数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='租户表';

DROP TABLE IF EXISTS `dining_table`;
CREATE TABLE `dining_table` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '桌号ID',
  `tenant_id` INT UNSIGNED NOT NULL COMMENT '租户ID',
  `table_name` VARCHAR(50) NOT NULL COMMENT '桌号名称',
  `qrcode_url` VARCHAR(500) DEFAULT '' COMMENT '二维码URL',
  `status` TINYINT(1) DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='桌号表';

DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `tenant_id` INT UNSIGNED NOT NULL COMMENT '租户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `tenant_id` INT UNSIGNED NOT NULL COMMENT '租户ID',
  `category_id` INT UNSIGNED NOT NULL COMMENT '分类ID',
  `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `image` VARCHAR(500) DEFAULT '' COMMENT '商品图片',
  `stock` INT DEFAULT -1 COMMENT '库存（-1表示无限）',
  `status` TINYINT(1) DEFAULT 1 COMMENT '状态：0下架，1上架',
  `description` VARCHAR(500) DEFAULT '' COMMENT '商品描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

DROP TABLE IF EXISTS `product_sku`;
CREATE TABLE `product_sku` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '规格ID',
  `product_id` INT UNSIGNED NOT NULL COMMENT '商品ID',
  `spec_name` VARCHAR(50) NOT NULL COMMENT '规格名称',
  `price_extra` DECIMAL(10,2) DEFAULT 0 COMMENT '额外价格',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品规格表';

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `tenant_id` INT UNSIGNED NOT NULL COMMENT '租户ID',
  `order_no` VARCHAR(50) NOT NULL COMMENT '订单号',
  `type` TINYINT(1) NOT NULL COMMENT '类型：1堂食，2外卖',
  `table_id` INT UNSIGNED DEFAULT NULL COMMENT '桌号ID（堂食）',
  `address_id` INT UNSIGNED DEFAULT NULL COMMENT '地址ID（外卖）',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '总金额',
  `pay_status` TINYINT(1) DEFAULT 0 COMMENT '支付状态：0未支付，1已支付',
  `order_status` TINYINT(1) DEFAULT 0 COMMENT '订单状态：0待接单，1制作中，2已完成，3已取消，4已配送',
  `pay_time` DATETIME DEFAULT NULL COMMENT '支付时间',
  `remark` VARCHAR(500) DEFAULT '' COMMENT '顾客备注',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_order_status` (`order_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

DROP TABLE IF EXISTS `order_item`;
CREATE TABLE `order_item` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单项ID',
  `order_id` INT UNSIGNED NOT NULL COMMENT '订单ID',
  `product_name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `price` DECIMAL(10,2) NOT NULL COMMENT '单价',
  `quantity` INT NOT NULL COMMENT '数量',
  `sku_info` VARCHAR(200) DEFAULT '' COMMENT '规格信息',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品明细表';

DROP TABLE IF EXISTS `user_address`;
CREATE TABLE `user_address` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  `tenant_id` INT UNSIGNED NOT NULL COMMENT '租户ID',
  `user_phone` VARCHAR(20) NOT NULL COMMENT '用户手机号',
  `receiver` VARCHAR(50) NOT NULL COMMENT '收货人',
  `phone` VARCHAR(20) NOT NULL COMMENT '收货电话',
  `address_detail` VARCHAR(500) NOT NULL COMMENT '详细地址',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='外卖地址表';

DROP TABLE IF EXISTS `admin_user`;
CREATE TABLE `admin_user` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `tenant_id` INT UNSIGNED DEFAULT NULL COMMENT '租户ID（平台管理员为NULL）',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `role` TINYINT(1) DEFAULT 2 COMMENT '角色：1平台管理员，2商户管理员，3商户员工',
  `status` TINYINT(1) DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理端账号表';

INSERT INTO `admin_user` (`tenant_id`, `phone`, `password_hash`, `name`, `role`) VALUES
(NULL, '13800138000', '$2b$10$EixZaYbB.rK4fl8x2q7Meu6Q6D2V5fF5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q', '平台管理员', 1);

INSERT INTO `tenant` (`name`, `logo`, `tel`, `business_hours`, `enable_takeout`, `min_delivery_amount`, `delivery_fee`) VALUES
('测试餐厅', '', '13800138001', '10:00-22:00', 1, 20.00, 5.00);

INSERT INTO `admin_user` (`tenant_id`, `phone`, `password_hash`, `name`, `role`) VALUES
(1, '13800138001', '$2b$10$EixZaYbB.rK4fl8x2q7Meu6Q6D2V5fF5Q5Q5Q5Q5Q5Q5Q5Q5Q', '商户管理员', 2);

INSERT INTO `category` (`tenant_id`, `name`, `sort_order`) VALUES
(1, '热销菜品', 1),
(1, '主食', 2),
(1, '凉菜', 3),
(1, '饮品', 4);

INSERT INTO `product` (`tenant_id`, `category_id`, `name`, `price`, `image`, `stock`, `status`, `description`) VALUES
(1, 1, '招牌红烧肉', 38.00, '', -1, 1, '精选五花肉，肥而不腻'),
(1, 1, '清蒸鲈鱼', 48.00, '', -1, 1, '新鲜鲈鱼，肉质鲜嫩'),
(1, 2, '蛋炒饭', 15.00, '', -1, 1, '粒粒分明，香气扑鼻'),
(1, 2, '牛肉面', 22.00, '', -1, 1, '劲道面条，浓郁汤汁'),
(1, 3, '拍黄瓜', 12.00, '', -1, 1, '清爽可口'),
(1, 4, '可乐', 8.00, '', -1, 1, '冰镇可乐'),
(1, 4, '雪碧', 8.00, '', -1, 1, '冰镇雪碧');

INSERT INTO `dining_table` (`tenant_id`, `table_name`, `status`) VALUES
(1, 'A01', 1),
(1, 'A02', 1),
(1, 'A03', 1),
(1, 'B01', 1),
(1, 'B02', 1),
(1, 'C01', 0);
