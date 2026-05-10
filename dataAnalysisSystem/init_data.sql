-- 数据分析系统初始化数据
-- 注意：此SQL文件适用于SQLite数据库

-- 清除现有数据（可选）
-- DELETE FROM data_records;
-- DELETE FROM data_categories;
-- DELETE FROM conversion_rules;
-- DELETE FROM dimensions;
-- DELETE FROM users;

-- ============================================
-- 创建默认管理员用户
-- 用户名: admin
-- 密码: admin123
-- 密码哈希值需要使用bcrypt生成
-- ============================================
-- 这个INSERT需要在应用启动时通过代码执行
-- 因为bcrypt哈希需要在Python代码中生成

-- ============================================
-- 维度初始化
-- ============================================
INSERT OR IGNORE INTO dimensions (unique_id, english_name, display_name, default_unit, description, is_active, created_at, updated_at)
VALUES 
('REGION001', 'region', '地区', '元', '地理区域维度', 1, datetime('now'), datetime('now')),
('PRODUCT01', 'product', '产品', '件', '产品维度', 1, datetime('now'), datetime('now')),
('TIME00001', 'time', '时间', '天', '时间维度', 1, datetime('now'), datetime('now')),
('PRICE0001', 'price', '价格', '元', '价格维度', 1, datetime('now'), datetime('now')),
('CATEGORY01', 'category', '类别', '个', '分类维度', 1, datetime('now'), datetime('now')),
('SALES0001', 'sales', '销售数据', '元', '销售相关数据', 1, datetime('now'), datetime('now')),
('TEMP00001', 'temperature', '温度', '摄氏度', '温度相关数据', 1, datetime('now'), datetime('now')),
('QUANTITY01', 'quantity', '数量', '件', '数量相关数据', 1, datetime('now'), datetime('now'));

-- ============================================
-- 数据分类初始化
-- ============================================
INSERT OR IGNORE INTO data_categories (name, description, is_active, created_at)
VALUES 
('销售数据', '销售相关的所有数据', 1, datetime('now')),
('运营数据', '运营相关的所有数据', 1, datetime('now')),
('财务数据', '财务相关的所有数据', 1, datetime('now')),
('市场数据', '市场营销相关数据', 1, datetime('now')),
('人力资源', '人力资源相关数据', 1, datetime('now'));

-- ============================================
-- 度量换算规则初始化
-- ============================================
INSERT OR IGNORE INTO conversion_rules (name, source_unit, target_unit, expression, is_enabled, description, created_at, updated_at)
VALUES 
('万元转元', '万元', '元', 'x * 10000', 1, '将万元转换为元', datetime('now'), datetime('now')),
('元转万元', '元', '万元', 'x / 10000', 1, '将元转换为万元', datetime('now'), datetime('now')),
('华氏度转摄氏度', '华氏度', '摄氏度', '(x - 32) / 1.8', 1, '将华氏度转换为摄氏度', datetime('now'), datetime('now')),
('摄氏度转华氏度', '摄氏度', '华氏度', 'x * 1.8 + 32', 1, '将摄氏度转换为华氏度', datetime('now'), datetime('now')),
('千件转件', '千件', '件', 'x * 1000', 1, '将千件转换为件', datetime('now'), datetime('now')),
('件转千件', '件', '千件', 'x / 1000', 1, '将件转换为千件', datetime('now'), datetime('now')),
('百万转元', '百万', '元', 'x * 1000000', 1, '将百万转换为元', datetime('now'), datetime('now')),
('元转百万', '元', '百万', 'x / 1000000', 1, '将元转换为百万', datetime('now'), datetime('now'));

-- ============================================
-- 示例数据记录
-- 注意：这些数据的created_by需要指向实际存在的用户ID
-- 这里假设管理员用户ID为1
-- ============================================
INSERT OR IGNORE INTO data_records (unique_id, data_name, dimension_id, dimension_value, value, unit, data_date, category_id, created_by, created_at, updated_at)
VALUES 
-- 2024年1月销售数据
('DATA000000000001', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '北京', 5000000, '元', '2024-01-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000002', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '上海', 6500000, '元', '2024-01-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000003', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '广州', 4200000, '元', '2024-01-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000004', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '深圳', 3800000, '元', '2024-01-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000005', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '杭州', 3200000, '元', '2024-01-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),

-- 2024年2月销售数据
('DATA000000000006', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '北京', 5500000, '元', '2024-02-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000007', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '上海', 7200000, '元', '2024-02-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000008', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '广州', 4800000, '元', '2024-02-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000009', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '深圳', 4100000, '元', '2024-02-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000010', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '杭州', 3600000, '元', '2024-02-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),

-- 2024年3月销售数据
('DATA000000000011', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '北京', 6100000, '元', '2024-03-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000012', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '上海', 7800000, '元', '2024-03-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000013', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '广州', 5300000, '元', '2024-03-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000014', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '深圳', 4500000, '元', '2024-03-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000015', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '杭州', 3900000, '元', '2024-03-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),

-- 2024年4月销售数据
('DATA000000000016', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '北京', 6800000, '元', '2024-04-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000017', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '上海', 8200000, '元', '2024-04-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000018', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '广州', 5800000, '元', '2024-04-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000019', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '深圳', 4900000, '元', '2024-04-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),
('DATA000000000020', '销售额', (SELECT id FROM dimensions WHERE english_name = 'region'), '杭州', 4200000, '元', '2024-04-01 00:00:00', (SELECT id FROM data_categories WHERE name = '销售数据'), 1, datetime('now'), datetime('now')),

-- 产品订单量数据
('DATA000000000021', '订单量', (SELECT id FROM dimensions WHERE english_name = 'product'), '产品A', 1200, '件', '2024-01-01 00:00:00', (SELECT id FROM data_categories WHERE name = '运营数据'), 1, datetime('now'), datetime('now')),
('DATA000000000022', '订单量', (SELECT id FROM dimensions WHERE english_name = 'product'), '产品B', 850, '件', '2024-01-01 00:00:00', (SELECT id FROM data_categories WHERE name = '运营数据'), 1, datetime('now'), datetime('now')),
('DATA000000000023', '订单量', (SELECT id FROM dimensions WHERE english_name = 'product'), '产品C', 620, '件', '2024-01-01 00:00:00', (SELECT id FROM data_categories WHERE name = '运营数据'), 1, datetime('now'), datetime('now')),
('DATA000000000024', '订单量', (SELECT id FROM dimensions WHERE english_name = 'product'), '产品D', 450, '件', '2024-01-01 00:00:00', (SELECT id FROM data_categories WHERE name = '运营数据'), 1, datetime('now'), datetime('now')),
('DATA000000000025', '订单量', (SELECT id FROM dimensions WHERE english_name = 'product'), '产品E', 320, '件', '2024-01-01 00:00:00', (SELECT id FROM data_categories WHERE name = '运营数据'), 1, datetime('now'), datetime('now')),

('DATA000000000026', '订单量', (SELECT id FROM dimensions WHERE english_name = 'product'), '产品A', 1350, '件', '2024-02-01 00:00:00', (SELECT id FROM data_categories WHERE name = '运营数据'), 1, datetime('now'), datetime('now')),
('DATA000000000027', '订单量', (SELECT id FROM dimensions WHERE english_name = 'product'), '产品B', 920, '件', '2024-02-01 00:00:00', (SELECT id FROM data_categories WHERE name = '运营数据'), 1, datetime('now'), datetime('now')),
('DATA000000000028', '订单量', (SELECT id FROM dimensions WHERE english_name = 'product'), '产品C', 680, '件', '2024-02-01 00:00:00', (SELECT id FROM data_categories WHERE name = '运营数据'), 1, datetime('now'), datetime('now')),
('DATA000000000029', '订单量', (SELECT id FROM dimensions WHERE english_name = 'product'), '产品D', 510, '件', '2024-02-01 00:00:00', (SELECT id FROM data_categories WHERE name = '运营数据'), 1, datetime('now'), datetime('now')),
('DATA000000000030', '订单量', (SELECT id FROM dimensions WHERE english_name = 'product'), '产品E', 380, '件', '2024-02-01 00:00:00', (SELECT id FROM data_categories WHERE name = '运营数据'), 1, datetime('now'), datetime('now'));
