CREATE DATABASE IF NOT EXISTS data_analysis_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE data_analysis_app;

CREATE TABLE IF NOT EXISTS dimensions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dimension_code VARCHAR(50) NOT NULL UNIQUE,
    dimension_name VARCHAR(100) NOT NULL,
    value_type ENUM('string', 'number', 'date') NOT NULL DEFAULT 'string',
    is_enabled TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dimension_code (dimension_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(50) NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_enabled TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_code (category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS formulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    formula_code VARCHAR(50) NOT NULL UNIQUE,
    formula_name VARCHAR(100) NOT NULL,
    formula_logic TEXT NOT NULL,
    description TEXT,
    is_enabled TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_formula_code (formula_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS data_definitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    code_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    category_id INT,
    is_defined TINYINT(1) NOT NULL DEFAULT 0,
    is_enabled TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code_name (code_name),
    INDEX idx_category_id (category_id),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS data_definition_attributes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_definition_id INT NOT NULL,
    attribute_code VARCHAR(50) NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_type ENUM('dimension', 'data_definition') NOT NULL,
    dimension_id INT,
    referenced_data_definition_id INT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (data_definition_id) REFERENCES data_definitions(id) ON DELETE CASCADE,
    FOREIGN KEY (dimension_id) REFERENCES dimensions(id) ON DELETE SET NULL,
    FOREIGN KEY (referenced_data_definition_id) REFERENCES data_definitions(id) ON DELETE SET NULL,
    INDEX idx_data_definition_id (data_definition_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS data_definition_indexes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_definition_id INT NOT NULL,
    attribute_code VARCHAR(50) NOT NULL,
    index_name VARCHAR(100),
    sort_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (data_definition_id) REFERENCES data_definitions(id) ON DELETE CASCADE,
    INDEX idx_data_definition_id (data_definition_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS query_statements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    query_name VARCHAR(100) NOT NULL,
    query_type ENUM('single', 'multiple') NOT NULL,
    table_info JSON NOT NULL,
    select_fields JSON NOT NULL,
    where_conditions JSON,
    group_by JSON,
    order_by JSON,
    is_enabled TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS charts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chart_name VARCHAR(100) NOT NULL,
    query_statement_id INT NOT NULL,
    chart_type ENUM('pie', 'line', 'bar', 'table') NOT NULL,
    chart_config JSON NOT NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    is_enabled TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (query_statement_id) REFERENCES query_statements(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO dimensions (dimension_code, dimension_name, value_type, is_enabled) VALUES 
('name', '姓名', 'string', 1),
('age', '年龄', 'number', 1),
('score', '成绩', 'number', 1),
('class', '班级', 'string', 1),
('date', '日期', 'date', 1),
('price', '价格', 'number', 1),
('quantity', '数量', 'number', 1),
('product', '产品名称', 'string', 1),
('region', '地区', 'string', 1),
('gender', '性别', 'string', 1);

INSERT INTO categories (category_code, category_name, description, is_enabled) VALUES 
('student', '学生数据', '学生相关数据定义', 1),
('product', '产品数据', '产品销售相关数据定义', 1),
('finance', '财务数据', '财务相关数据定义', 1);

INSERT INTO formulas (formula_code, formula_name, formula_logic, description, is_enabled) VALUES 
('SUM', '求和', 'SUM({field})', '对字段求和', 1),
('AVG', '平均值', 'AVG({field})', '计算字段平均值', 1),
('COUNT', '计数', 'COUNT({field})', '统计记录数', 1),
('MAX', '最大值', 'MAX({field})', '获取字段最大值', 1),
('MIN', '最小值', 'MIN({field})', '获取字段最小值', 1);
