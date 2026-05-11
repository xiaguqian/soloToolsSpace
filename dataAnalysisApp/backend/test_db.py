print("测试数据库连接...")

try:
    from app.database import get_db, get_engine, SessionLocal
    from app.models import Dimension
    
    engine = get_engine()
    print("✓ 数据库引擎创建成功")
    
    db = SessionLocal()
    print("✓ 数据库会话创建成功")
    
    dimensions = db.query(Dimension).all()
    print(f"✓ 查询成功，维度数量: {len(dimensions)}")
    
    for d in dimensions:
        print(f"  - {d.dimension_code}: {d.dimension_name}")
    
    db.close()
    print("✓ 数据库连接测试完成")
except Exception as e:
    print(f"✗ 数据库连接失败: {e}")
    import traceback
    traceback.print_exc()
