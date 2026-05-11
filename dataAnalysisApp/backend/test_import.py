print("开始测试导入...")

try:
    from app.database import get_db, get_engine, get_settings
    print("✓ database 导入成功")
except Exception as e:
    print(f"✗ database 导入失败: {e}")
    import traceback
    traceback.print_exc()

try:
    from app.models import (
        Dimension, Category, Formula, DataDefinition, 
        DataDefinitionAttribute, DataDefinitionIndex,
        QueryStatement, Chart
    )
    print("✓ models 导入成功")
except Exception as e:
    print(f"✗ models 导入失败: {e}")
    import traceback
    traceback.print_exc()

try:
    from app.schemas import (
        DimensionCreate, DimensionUpdate, DimensionResponse,
        CategoryCreate, CategoryUpdate, CategoryResponse,
        FormulaCreate, FormulaUpdate, FormulaResponse,
        DataDefinitionCreate, DataDefinitionUpdate, DataDefinitionResponse,
        DataDefinitionAttributeResponse,
        QueryStatementCreate, QueryStatementUpdate, QueryStatementResponse,
        ChartCreate, ChartUpdate, ChartResponse,
        GenericResponse, DynamicDataCreate, DynamicDataUpdate, ChartDataRequest
    )
    print("✓ schemas 导入成功")
except Exception as e:
    print(f"✗ schemas 导入失败: {e}")
    import traceback
    traceback.print_exc()

try:
    from app.main import app
    print("✓ main 导入成功")
    print(f"✓ 路由数量: {len(app.routes)}")
except Exception as e:
    print(f"✗ main 导入失败: {e}")
    import traceback
    traceback.print_exc()

print("测试完成")
