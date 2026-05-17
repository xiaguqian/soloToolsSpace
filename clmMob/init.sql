
CREATE TABLE IF NOT EXISTS tenant (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    logo VARCHAR(255),
    tel VARCHAR(20),
    business_hours VARCHAR(50),
    enable_takeout TINYINT DEFAULT 1,
    min_delivery_amount DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dining_table (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    qrcode_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenant(id)
);

CREATE TABLE IF NOT EXISTS category (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenant(id)
);

CREATE TABLE IF NOT EXISTS product (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    stock INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE IF NOT EXISTS product_sku (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    spec_name VARCHAR(50) NOT NULL,
    price_extra DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES product(id)
);

CREATE TABLE IF NOT EXISTS user_address (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    user_phone VARCHAR(20) NOT NULL,
    receiver VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_detail TEXT NOT NULL,
    is_default TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenant(id)
);

CREATE TABLE IF NOT EXISTS admin_user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50),
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenant(id)
);

CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL,
    table_id INT,
    address_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    pay_status VARCHAR(20) DEFAULT 'unpaid',
    order_status VARCHAR(20) DEFAULT 'pending',
    pay_time DATETIME,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (table_id) REFERENCES dining_table(id),
    FOREIGN KEY (address_id) REFERENCES user_address(id)
);

CREATE TABLE IF NOT EXISTS order_item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

INSERT IGNORE INTO tenant (id, name, logo, tel, business_hours, enable_takeout, min_delivery_amount, delivery_fee) VALUES
(1, '美味餐厅', 'https://via.placeholder.com/100', '13800138000', '10:00-22:00', 1, 20, 5);

INSERT IGNORE INTO dining_table (tenant_id, table_name, qrcode_url, status) VALUES
(1, '1号桌', 'http://localhost:8012?tenantId=1&tableId=1', 'available'),
(1, '2号桌', 'http://localhost:8012?tenantId=1&tableId=2', 'available'),
(1, '3号桌', 'http://localhost:8012?tenantId=1&tableId=3', 'available'),
(1, '4号桌', 'http://localhost:8012?tenantId=1&tableId=4', 'available'),
(1, '5号桌', 'http://localhost:8012?tenantId=1&tableId=5', 'available');

INSERT IGNORE INTO category (tenant_id, name, sort_order) VALUES
(1, '热销推荐', 1),
(1, '主食', 2),
(1, '配菜', 3),
(1, '饮品', 4);

INSERT IGNORE INTO product (tenant_id, category_id, name, price, image, stock, status, description) VALUES
(1, 1, '招牌红烧肉', 38.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300', 100, 1, '精选五花肉，肥而不腻'),
(1, 1, '清蒸鲈鱼', 48.00, 'https://images.unsplash.com/photo-1547592166-23ac551ab31f?w=300', 50, 1, '新鲜鲈鱼，肉质鲜嫩'),
(1, 2, '蛋炒饭', 18.00, 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300', 200, 1, '粒粒分明，蛋香浓郁'),
(1, 2, '红烧牛肉面', 28.00, 'https://images.unsplash.com/photo-1623595119784-4c6595119567?w=300', 100, 1, '大块牛肉，汤汁浓郁'),
(1, 3, '蒜蓉西兰花', 22.00, 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300', 80, 1, '新鲜西兰花，蒜香扑鼻'),
(1, 3, '凉拌黄瓜', 12.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300', 100, 1, '清爽可口，开胃解腻'),
(1, 4, '可乐', 8.00, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300', 200, 1, '冰镇可乐，消暑解渴'),
(1, 4, '鲜榨橙汁', 15.00, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300', 50, 1, '新鲜橙子，现榨现卖');

INSERT IGNORE INTO product_sku (product_id, spec_name, price_extra) VALUES
(1, '微辣', 0),
(1, '中辣', 2),
(1, '特辣', 4),
(4, '少面', 0),
(4, '正常', 0),
(4, '多加面', 5);
