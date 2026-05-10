#!/usr/bin/env python3
"""
测试刚刚修复的三个问题：
1. 无数据时的提示
2. 按维度过滤分类
3. 分析API正常工作
"""

import json
import requests
import time

BASE_URL = 'http://localhost:8000'


def main():
    print("=" * 60)
    print("数据分析系统 - 修复验证测试")
    print("=" * 60)
    
    # 1. 登录
    print("\n1. 登录...")
    response = requests.post(f'{BASE_URL}/api/auth/login', data={
        'username': 'admin',
        'password': 'admin123'
    })
    if response.status_code != 200:
        print(f"   ✗ 登录失败: {response.text}")
        return
    token = response.json()['access_token']
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    print("   ✓ 登录成功")
    
    # 2. 测试无数据时的提示
    print("\n2. 测试无数据时的提示...")
    response = requests.post(f'{BASE_URL}/api/analysis/', headers=headers, json={
        'chart_type': 'line',
        'filters': {
            'dimension_unique_ids': ['NONEXISTENT001']  # 不存在的维度
        }
    })
    result = response.json()
    if result.get('message') == '没有匹配的数据':
        print("   ✓ 正确返回'没有匹配的数据'消息")
    else:
        print(f"   ✗ 未检测到无数据提示，返回: {result}")
    
    # 3. 测试按维度获取分类（新端点）
    print("\n3. 测试新API端点: /api/analysis/categories-by-dimensions")
    
    # 先获取可用维度
    print("   获取可用维度...")
    response = requests.get(f'{BASE_URL}/api/analysis/available-options', headers=headers)
    options = response.json()
    dimensions = options['dimensions']
    all_categories = options['categories']
    print(f"   全部可用分类: {all_categories}")
    
    # 使用地区维度测试
    region_dim = next((d for d in dimensions if d['display_name'] == '地区'), None)
    if region_dim:
        print(f"\n   使用维度: 地区 ({region_dim['unique_id']})")
        response = requests.get(
            f"{BASE_URL}/api/analysis/categories-by-dimensions?dimension_unique_ids={region_dim['unique_id']}",
            headers=headers
        )
        result = response.json()
        filtered_cats = result.get('categories', [])
        print(f"   与地区关联的分类: {filtered_cats}")
        
        if len(filtered_cats) > 0 and len(filtered_cats) < len(all_categories):
            print("   ✓ 分类已正确过滤（数量少于全部）")
        elif len(filtered_cats) == len(all_categories):
            print("   ⚠ 过滤后分类数量不变（可能所有分类都关联该维度）")
        else:
            print("   ⚠ 无关联分类")
    else:
        print("   ✗ 未找到地区维度")
    
    # 4. 测试完整分析流程（有数据）
    print("\n4. 测试正常数据分析...")
    if region_dim:
        response = requests.post(f'{BASE_URL}/api/analysis/', headers=headers, json={
            'chart_type': 'bar',
            'filters': {
                'dimension_unique_ids': [region_dim['unique_id']]
            },
            'aggregations': [{
                'group_by': 'dimension_value',
                'aggregation_func': 'sum'
            }]
        })
        result = response.json()
        if result.get('records_count', 0) > 0:
            print(f"   ✓ 匹配到 {result['records_count']} 条数据")
            if result.get('chart_data'):
                print("   ✓ 图表数据已生成")
        else:
            print(f"   ✗ 未匹配到数据: {result}")
    
    print("\n" + "=" * 60)
    print("修复验证测试完成！")
    print("=" * 60)
    print("\n前端修改说明：")
    print("  - 维度和分类选择已从多选改为下拉单选")
    print("  - 选择维度后会自动过滤关联的分类")
    print("  - 无数据时会显示提示消息")
    print("\n请在浏览器中测试前端交互:")
    print(f"  {BASE_URL}/")


if __name__ == '__main__':
    main()
