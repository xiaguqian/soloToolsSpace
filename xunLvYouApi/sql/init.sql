CREATE DATABASE IF NOT EXISTS xunlvyou DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE xunlvyou;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  avatar VARCHAR(255),
  bio VARCHAR(500),
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scenic_spots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cover_image VARCHAR(255),
  description TEXT,
  type ENUM('culture', 'nature', 'amusement', 'historical') NOT NULL,
  is_paid TINYINT(1) DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  height INT DEFAULT 0,
  tags TEXT,
  address VARCHAR(255),
  open_time VARCHAR(100),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  view_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scenic_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scenic_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scenic_id) REFERENCES scenic_spots(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  cover_image VARCHAR(255),
  author_id INT NOT NULL,
  scenic_id INT,
  status ENUM('active', 'offline', 'top') DEFAULT 'active',
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  favorite_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (scenic_id) REFERENCES scenic_spots(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS note_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  note_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  travel_date DATE,
  people_count INT DEFAULT 1,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  scenic_ids TEXT,
  scenic_names TEXT,
  guide TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('scenic', 'note', 'image') NOT NULL,
  target_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, type, target_id)
);

CREATE TABLE IF NOT EXISTS gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  type ENUM('outfit', 'smart-travel', 'manual') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  login_count INT DEFAULT 0,
  last_login DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user (user_id)
);

INSERT INTO users (nickname, password, role) VALUES ('admin', '$2a$10$rJZx5hK3o5eQJ6bN7m8o9p0q1r2s3t4u5v6w7x8y9z0', 'admin');
INSERT INTO scenic_spots (name, cover_image, description, type, is_paid, price, rating, address, open_time, latitude, longitude) VALUES 
('故宫博物院', 'https://example.com/gugong.jpg', '世界上现存规模最大、保存最为完整的木质结构古建筑群', 'historical', 1, 60, 4.9, '北京市东城区景山前街4号', '8:30-17:00', 39.9163, 116.3972),
('黄山', 'https://example.com/huangshan.jpg', '中国著名的风景名胜区，以奇松、怪石、云海、温泉闻名', 'nature', 1, 200, 4.8, '安徽省黄山市黄山区', '6:00-18:00', 30.1478, 118.1492),
('上海迪士尼乐园', 'https://example.com/disney.jpg', '中国大陆首座迪士尼主题乐园', 'amusement', 1, 599, 4.7, '上海市浦东新区川沙新镇', '9:00-22:00', 31.1443, 121.7173),
('兵马俑', 'https://example.com/bingmayong.jpg', '世界八大奇迹之一，秦始皇陵的陪葬坑', 'historical', 1, 150, 4.8, '陕西省西安市临潼区', '8:30-18:00', 34.3853, 109.2731),
('西湖', 'https://example.com/xihu.jpg', '杭州最著名的风景名胜区', 'nature', 0, 0, 4.8, '浙江省杭州市西湖区', '全天开放', 30.2741, 120.1552);

INSERT INTO scenic_images (scenic_id, image_url) VALUES 
(1, 'https://example.com/gugong1.jpg'),
(1, 'https://example.com/gugong2.jpg'),
(1, 'https://example.com/gugong3.jpg'),
(2, 'https://example.com/huangshan1.jpg'),
(2, 'https://example.com/huangshan2.jpg'),
(3, 'https://example.com/disney1.jpg'),
(4, 'https://example.com/bingmayong1.jpg'),
(5, 'https://example.com/xihu1.jpg');