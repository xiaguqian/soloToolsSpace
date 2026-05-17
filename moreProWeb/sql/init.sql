CREATE TABLE IF NOT EXISTS tenant (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  logo VARCHAR(500),
  status TINYINT DEFAULT 1,
  config_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS end_user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  openid VARCHAR(100),
  phone VARCHAR(20),
  nickname VARCHAR(50),
  address_list TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenant(id)
);

CREATE TABLE IF NOT EXISTS product (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  status TINYINT DEFAULT 1,
  image_url VARCHAR(500),
  description TEXT,
  category VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenant(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  end_user_id INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  order_no VARCHAR(50) UNIQUE,
  address TEXT,
  items TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  FOREIGN KEY (end_user_id) REFERENCES end_user(id)
);

CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenant(id)
);

CREATE TABLE IF NOT EXISTS banner (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenant(id)
);

CREATE TABLE IF NOT EXISTS category (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenant(id)
);

INSERT OR IGNORE INTO tenant (id, name, logo, status, config_json) VALUES (1, '测试商户', 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=modern%20store%20logo%20design&image_size=square', 1, '{"contact_phone":"13800138000","contact_wechat":"test_merchant","delivery_fee":5,"free_delivery_threshold":30}');
INSERT OR IGNORE INTO staff (id, tenant_id, phone, password_hash, role) VALUES (1, 1, '13800138000', '$2b$10$EixZaYbB.rK4fl8x2q7Meu6Q6D2V5fF5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q', 'admin');
INSERT OR IGNORE INTO category (id, tenant_id, name, icon, sort_order) VALUES (1, 1, '热门推荐', '🔥', 1), (2, 1, '新品上市', '✨', 2), (3, 1, '限时特惠', '⏰', 3);
INSERT OR IGNORE INTO banner (id, tenant_id, image_url, link_url, sort_order) VALUES (1, 1, 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=promotional%20banner%20for%20online%20store%20sale&image_size=landscape_16_9', '/products', 1), (2, 1, 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=modern%20fashion%20products%20banner&image_size=landscape_16_9', '/products', 2);
INSERT OR IGNORE INTO product (id, tenant_id, name, price, stock, image_url, description, category) VALUES 
(1, 1, '精品咖啡', 28.00, 100, 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=premium%20coffee%20cup%20on%20table&image_size=square', '精选阿拉比卡咖啡豆，手工研磨', '热门推荐'),
(2, 1, '抹茶蛋糕', 35.00, 50, 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=matcha%20green%20tea%20cake&image_size=square', '日式抹茶，口感细腻', '新品上市'),
(3, 1, '芝士汉堡', 42.00, 80, 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=delicious%20cheese%20burger&image_size=square', '100%纯牛肉饼，芝士浓郁', '限时特惠'),
(4, 1, '水果沙拉', 22.00, 60, 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fresh%20fruit%20salad%20bowl&image_size=square', '新鲜时令水果，营养健康', '热门推荐'),
(5, 1, '拿铁咖啡', 32.00, 120, 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=latte%20coffee%20with%20milk%20foam&image_size=square', '香浓牛奶与咖啡完美融合', '新品上市'),
(6, 1, '提拉米苏', 38.00, 40, 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=italian%20tiramisu%20dessert&image_size=square', '意大利经典甜品', '限时特惠');