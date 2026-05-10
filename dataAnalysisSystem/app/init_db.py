from sqlalchemy import text
from . import models
from datetime import datetime
import os


def init_sample_data(db):
    dimension_count = db.query(models.Dimension).count()
    if dimension_count > 0:
        print("数据库已有数据，跳过初始化")
        return
    
    print("开始初始化数据...")
    
    dimensions = [
        {'unique_id': 'REGION001', 'english_name': 'region', 'display_name': '地区', 'default_unit': '元', 'description': '地理区域维度'},
        {'unique_id': 'PRODUCT01', 'english_name': 'product', 'display_name': '产品', 'default_unit': '件', 'description': '产品维度'},
        {'unique_id': 'TIME00001', 'english_name': 'time', 'display_name': '时间', 'default_unit': '天', 'description': '时间维度'},
        {'unique_id': 'PRICE0001', 'english_name': 'price', 'display_name': '价格', 'default_unit': '元', 'description': '价格维度'},
        {'unique_id': 'CATEGORY01', 'english_name': 'category', 'display_name': '类别', 'default_unit': '个', 'description': '分类维度'},
        {'unique_id': 'SALES0001', 'english_name': 'sales', 'display_name': '销售数据', 'default_unit': '元', 'description': '销售相关数据'},
        {'unique_id': 'TEMP00001', 'english_name': 'temperature', 'display_name': '温度', 'default_unit': '摄氏度', 'description': '温度相关数据'},
        {'unique_id': 'QUANTITY01', 'english_name': 'quantity', 'display_name': '数量', 'default_unit': '件', 'description': '数量相关数据'}
    ]
    
    for dim in dimensions:
        dimension = models.Dimension(
            unique_id=dim['unique_id'],
            english_name=dim['english_name'],
            display_name=dim['display_name'],
            default_unit=dim['default_unit'],
            description=dim['description'],
            is_active=True
        )
        db.add(dimension)
    
    categories = [
        {'name': '销售数据', 'description': '销售相关的所有数据'},
        {'name': '运营数据', 'description': '运营相关的所有数据'},
        {'name': '财务数据', 'description': '财务相关的所有数据'},
        {'name': '市场数据', 'description': '市场营销相关数据'},
        {'name': '人力资源', 'description': '人力资源相关数据'}
    ]
    
    for cat in categories:
        category = models.DataCategory(
            name=cat['name'],
            description=cat['description'],
            is_active=True
        )
        db.add(category)
    
    rules = [
        {'name': '万元转元', 'source_unit': '万元', 'target_unit': '元', 'expression': 'x * 10000', 'description': '将万元转换为元'},
        {'name': '元转万元', 'source_unit': '元', 'target_unit': '万元', 'expression': 'x / 10000', 'description': '将元转换为万元'},
        {'name': '华氏度转摄氏度', 'source_unit': '华氏度', 'target_unit': '摄氏度', 'expression': '(x - 32) / 1.8', 'description': '将华氏度转换为摄氏度'},
        {'name': '摄氏度转华氏度', 'source_unit': '摄氏度', 'target_unit': '华氏度', 'expression': 'x * 1.8 + 32', 'description': '将摄氏度转换为华氏度'},
        {'name': '千件转件', 'source_unit': '千件', 'target_unit': '件', 'expression': 'x * 1000', 'description': '将千件转换为件'},
        {'name': '件转千件', 'source_unit': '件', 'target_unit': '千件', 'expression': 'x / 1000', 'description': '将件转换为千件'},
        {'name': '百万转元', 'source_unit': '百万', 'target_unit': '元', 'expression': 'x * 1000000', 'description': '将百万转换为元'},
        {'name': '元转百万', 'source_unit': '元', 'target_unit': '百万', 'expression': 'x / 1000000', 'description': '将元转换为百万'}
    ]
    
    for rule in rules:
        conversion = models.ConversionRule(
            name=rule['name'],
            source_unit=rule['source_unit'],
            target_unit=rule['target_unit'],
            expression=rule['expression'],
            description=rule['description'],
            is_enabled=True
        )
        db.add(conversion)
    
    db.flush()
    
    dimension_map = {}
    for dim in dimensions:
        d = db.query(models.Dimension).filter(models.Dimension.unique_id == dim['unique_id']).first()
        dimension_map[dim['english_name']] = d.id
    
    category_map = {}
    for cat in categories:
        c = db.query(models.DataCategory).filter(models.DataCategory.name == cat['name']).first()
        category_map[cat['name']] = c.id
    
    sample_data = [
        ('销售额', 'region', '北京', 5000000, '元', '2024-01-01', '销售数据'),
        ('销售额', 'region', '上海', 6500000, '元', '2024-01-01', '销售数据'),
        ('销售额', 'region', '广州', 4200000, '元', '2024-01-01', '销售数据'),
        ('销售额', 'region', '深圳', 3800000, '元', '2024-01-01', '销售数据'),
        ('销售额', 'region', '杭州', 3200000, '元', '2024-01-01', '销售数据'),
        ('销售额', 'region', '北京', 5500000, '元', '2024-02-01', '销售数据'),
        ('销售额', 'region', '上海', 7200000, '元', '2024-02-01', '销售数据'),
        ('销售额', 'region', '广州', 4800000, '元', '2024-02-01', '销售数据'),
        ('销售额', 'region', '深圳', 4100000, '元', '2024-02-01', '销售数据'),
        ('销售额', 'region', '杭州', 3600000, '元', '2024-02-01', '销售数据'),
        ('销售额', 'region', '北京', 6100000, '元', '2024-03-01', '销售数据'),
        ('销售额', 'region', '上海', 7800000, '元', '2024-03-01', '销售数据'),
        ('销售额', 'region', '广州', 5300000, '元', '2024-03-01', '销售数据'),
        ('销售额', 'region', '深圳', 4500000, '元', '2024-03-01', '销售数据'),
        ('销售额', 'region', '杭州', 3900000, '元', '2024-03-01', '销售数据'),
        ('销售额', 'region', '北京', 6800000, '元', '2024-04-01', '销售数据'),
        ('销售额', 'region', '上海', 8200000, '元', '2024-04-01', '销售数据'),
        ('销售额', 'region', '广州', 5800000, '元', '2024-04-01', '销售数据'),
        ('销售额', 'region', '深圳', 4900000, '元', '2024-04-01', '销售数据'),
        ('销售额', 'region', '杭州', 4200000, '元', '2024-04-01', '销售数据'),
        ('订单量', 'product', '产品A', 1200, '件', '2024-01-01', '运营数据'),
        ('订单量', 'product', '产品B', 850, '件', '2024-01-01', '运营数据'),
        ('订单量', 'product', '产品C', 620, '件', '2024-01-01', '运营数据'),
        ('订单量', 'product', '产品D', 450, '件', '2024-01-01', '运营数据'),
        ('订单量', 'product', '产品E', 320, '件', '2024-01-01', '运营数据'),
        ('订单量', 'product', '产品A', 1350, '件', '2024-02-01', '运营数据'),
        ('订单量', 'product', '产品B', 920, '件', '2024-02-01', '运营数据'),
        ('订单量', 'product', '产品C', 680, '件', '2024-02-01', '运营数据'),
        ('订单量', 'product', '产品D', 510, '件', '2024-02-01', '运营数据'),
        ('订单量', 'product', '产品E', 380, '件', '2024-02-01', '运营数据')
    ]
    
    import uuid
    for data in sample_data:
        record = models.DataRecord(
            unique_id=str(uuid.uuid4()).replace("-", "")[:16].upper(),
            data_name=data[0],
            dimension_id=dimension_map[data[1]],
            dimension_value=data[2],
            value=data[3],
            unit=data[4],
            data_date=datetime.strptime(data[5], '%Y-%m-%d'),
            category_id=category_map.get(data[6]),
            created_by=1
        )
        db.add(record)
    
    db.commit()
    print("初始化数据加载完成")
    print(f"  - 维度: {len(dimensions)} 个")
    print(f"  - 分类: {len(categories)} 个")
    print(f"  - 换算规则: {len(rules)} 个")
    print(f"  - 数据记录: {len(sample_data)} 条")
