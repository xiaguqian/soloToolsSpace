import urllib.request
import urllib.parse
import json
import time

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("数据分析系统 - 重置数据并测试")
print("=" * 60)

# 1. 登录
print("\n1. 登录...")
data = urllib.parse.urlencode({'username': 'admin', 'password': 'admin123'}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=data, method='POST')
resp = urllib.request.urlopen(req)
result = json.loads(resp.read().decode())
token = result['access_token']
print(f"   ✓ 登录成功")

# 2. 重置数据
print("\n2. 重置数据...")
req = urllib.request.Request(
    f"{BASE_URL}/api/reset-data",
    method='POST',
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
)
resp = urllib.request.urlopen(req)
result = json.loads(resp.read().decode())
print(f"   ✓ {result['message']}")

print("\n   等待数据库初始化...")
time.sleep(2)

# 3. 获取维度
print("\n3. 获取维度列表...")
req = urllib.request.Request(f"{BASE_URL}/api/dimensions/")
req.add_header('Authorization', f'Bearer {token}')
resp = urllib.request.urlopen(req)
dimensions = json.loads(resp.read().decode())
print(f"   ✓ 维度数量: {len(dimensions)}")
for d in dimensions[:5]:
    print(f"     - {d['display_name']} ({d['unique_id']})")

# 4. 获取数据记录
print("\n4. 获取数据记录...")
req = urllib.request.Request(f"{BASE_URL}/api/data/?limit=5")
req.add_header('Authorization', f'Bearer {token}')
resp = urllib.request.urlopen(req)
data_records = json.loads(resp.read().decode())
print(f"   ✓ 数据记录数量: {len(data_records)}")
for r in data_records[:5]:
    print(f"     - {r['data_name']}: {r['value']} {r['unit']}")

# 5. 获取换算规则
print("\n5. 获取换算规则...")
req = urllib.request.Request(f"{BASE_URL}/api/conversion/")
req.add_header('Authorization', f'Bearer {token}')
resp = urllib.request.urlopen(req)
rules = json.loads(resp.read().decode())
print(f"   ✓ 换算规则数量: {len(rules)}")
for r in rules[:4]:
    print(f"     - {r['name']}: {r['source_unit']} → {r['target_unit']}")

# 6. 获取系统概览
print("\n6. 获取系统概览...")
req = urllib.request.Request(f"{BASE_URL}/api/analysis/summary")
req.add_header('Authorization', f'Bearer {token}')
resp = urllib.request.urlopen(req)
summary = json.loads(resp.read().decode())
print(f"   ✓ 总数据记录: {summary['total_records']}")
print(f"   ✓ 总维度数: {summary['total_dimensions']}")
print(f"   ✓ 总分类数: {summary['total_categories']}")
print(f"   ✓ 总换算规则: {summary['total_conversion_rules']}")

# 7. 测试创建维度（不传入unique_id）
print("\n7. 测试创建维度（自动生成unique_id）...")
new_dimension = {
    'english_name': 'test_dimension_api',
    'display_name': '测试维度API',
    'default_unit': '个',
    'description': '测试自动生成ID'
}
req = urllib.request.Request(
    f"{BASE_URL}/api/dimensions/",
    data=json.dumps(new_dimension).encode(),
    method='POST',
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
)
resp = urllib.request.urlopen(req)
result = json.loads(resp.read().decode())
print(f"   ✓ 维度创建成功")
print(f"   自动生成的unique_id: {result['unique_id']}")
print(f"   维度名称: {result['display_name']}")

# 8. 测试创建数据记录（不传入unique_id）
print("\n8. 测试创建数据记录（自动生成unique_id）...")
new_record = {
    'data_name': '测试数据API',
    'dimension_unique_id': dimensions[0]['unique_id'],
    'dimension_value': '测试值',
    'value': 9999.99,
    'unit': '元',
    'data_date': '2024-05-10T00:00:00',
    'category_name': '测试分类'
}
req = urllib.request.Request(
    f"{BASE_URL}/api/data/",
    data=json.dumps(new_record).encode(),
    method='POST',
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
)
resp = urllib.request.urlopen(req)
result = json.loads(resp.read().decode())
print(f"   ✓ 数据记录创建成功")
print(f"   自动生成的unique_id: {result['unique_id']}")
print(f"   数据名称: {result['data_name']}")

print("\n" + "=" * 60)
print("所有测试通过！✓")
print("=" * 60)
print("\n系统已就绪，可以访问:")
print(f"  - 前端界面: {BASE_URL}/")
print(f"  - API文档: {BASE_URL}/docs")
print("\n登录信息:")
print("  - 用户名: admin")
print("  - 密码: admin123")
