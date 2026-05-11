PRESET_COMPONENTS = [
    {
        "name": "html_extractor",
        "chinese_name": "HTML 数据提取",
        "description": "根据指定检索方式和路径，从输入的 HTML 中检索结果",
        "category": "data_extraction",
        "input_schema": {
            "type": "object",
            "properties": {
                "html": {
                    "type": "string",
                    "description": "html串"
                },
                "method": {
                    "type": "string",
                    "enum": ["css", "xpath", "re"],
                    "description": "检索方式"
                },
                "selector": {
                    "type": "string",
                    "description": "检索路径"
                },
                "attribute": {
                    "type": "string",
                    "description": "属性名称"
                }
            },
            "required": ["html", "method", "selector"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "results": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "提取结果列表"
                },
                "first_result": {
                    "type": "string",
                    "description": "第一个提取结果"
                }
            }
        },
        "code": """
import re
from bs4 import BeautifulSoup
from lxml import etree

def execute(input_data, context):
    html = input_data.get('html', '')
    method = input_data.get('method', 'css')
    selector = input_data.get('selector', '')
    attribute = input_data.get('attribute')
    
    results = []
    
    if method == 'css':
        soup = BeautifulSoup(html, 'lxml')
        elements = soup.select(selector)
        for el in elements:
            if attribute:
                val = el.get(attribute)
                if val:
                    results.append(val)
            else:
                results.append(el.get_text(strip=True))
    elif method == 'xpath':
        parser = etree.HTMLParser()
        tree = etree.fromstring(html, parser)
        if tree is not None:
            elements = tree.xpath(selector)
            for el in elements:
                if isinstance(el, etree._Element):
                    if attribute:
                        val = el.get(attribute)
                        if val:
                            results.append(val)
                    else:
                        results.append(el.text.strip() if el.text else '')
                else:
                    results.append(str(el))
    elif method == 're':
        matches = re.findall(selector, html)
        results = [str(m) for m in matches]
    
    return {
        "results": results,
        "first_result": results[0] if results else ""
    }
""",
        "is_preset": True
    },
    {
        "name": "html_open",
        "chinese_name": "打开 HTML 页面",
        "description": "请求并获取指定 URL 的 HTML 页面内容",
        "category": "request",
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "目标页面 URL"
                },
                "method": {
                    "type": "string",
                    "enum": ["GET", "POST"],
                    "default": "GET",
                    "description": "HTTP 请求方法"
                },
                "params": {
                    "type": "object",
                    "description": "URL 查询参数（GET）"
                },
                "data": {
                    "type": "object",
                    "description": "请求体数据（POST）"
                },
                "headers": {
                    "type": "object",
                    "description": "请求头"
                },
                "encoding": {
                    "type": "string",
                    "description": "响应编码，如 utf-8、gbk"
                }
            },
            "required": ["url"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "status_code": {
                    "type": "integer",
                    "description": "HTTP 状态码"
                },
                "html": {
                    "type": "string",
                    "description": "响应的 HTML 内容"
                },
                "url": {
                    "type": "string",
                    "description": "最终响应的 URL（可能重定向后）"
                }
            }
        },
        "code": """
import requests

def execute(input_data, context):
    url = input_data.get('url')
    method = input_data.get('method', 'GET').upper()
    params = input_data.get('params')
    data = input_data.get('data')
    headers = input_data.get('headers', {})
    encoding = input_data.get('encoding')
    
    if not headers.get('User-Agent'):
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    
    response = requests.request(
        method,
        url,
        params=params,
        data=data,
        headers=headers,
        timeout=30
    )
    
    if encoding:
        response.encoding = encoding
    
    return {
        "status_code": response.status_code,
        "html": response.text,
        "url": response.url
    }
""",
        "is_preset": True
    },
    {
        "name": "api_request",
        "chinese_name": "后端接口请求",
        "description": "请求指定不需要登录的纯后端接口，得到一个 JSON 对象",
        "category": "request",
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "接口 URL"
                },
                "method": {
                    "type": "string",
                    "enum": ["GET", "POST", "PUT", "DELETE"],
                    "default": "GET",
                    "description": "HTTP 请求方法"
                },
                "params": {
                    "type": "object",
                    "description": "URL 查询参数"
                },
                "json_data": {
                    "type": "object",
                    "description": "JSON 请求体"
                },
                "headers": {
                    "type": "object",
                    "description": "请求头"
                }
            },
            "required": ["url"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "status_code": {
                    "type": "integer",
                    "description": "HTTP 状态码"
                },
                "data": {
                    "type": "object",
                    "description": "响应的 JSON 数据"
                },
                "success": {
                    "type": "boolean",
                    "description": "请求是否成功"
                }
            }
        },
        "code": """
import requests

def execute(input_data, context):
    url = input_data.get('url')
    method = input_data.get('method', 'GET').upper()
    params = input_data.get('params')
    json_data = input_data.get('json_data')
    headers = input_data.get('headers', {})
    
    if not headers.get('Content-Type'):
        headers['Content-Type'] = 'application/json'
    if not headers.get('User-Agent'):
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    
    response = requests.request(
        method,
        url,
        params=params,
        json=json_data,
        headers=headers,
        timeout=30
    )
    
    try:
        data = response.json()
        success = True
    except Exception:
        data = {"raw": response.text}
        success = False
    
    return {
        "status_code": response.status_code,
        "data": data,
        "success": success
    }
""",
        "is_preset": True
    },
    {
        "name": "api_request_with_headers",
        "chinese_name": "带报文头接口请求",
        "description": "指定报文头，请求后台接口，返回 JSON 对象",
        "category": "request",
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "接口 URL"
                },
                "method": {
                    "type": "string",
                    "enum": ["GET", "POST", "PUT", "DELETE"],
                    "default": "GET"
                },
                "params": {
                    "type": "object",
                    "description": "URL 查询参数"
                },
                "json_data": {
                    "type": "object",
                    "description": "JSON 请求体"
                },
                "headers": {
                    "type": "object",
                    "description": "请求头（包含 Token、Cookie 等认证信息）"
                },
                "cookies": {
                    "type": "object",
                    "description": "Cookie 数据"
                }
            },
            "required": ["url", "headers"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "status_code": {"type": "integer"},
                "data": {"type": "object"},
                "success": {"type": "boolean"},
                "response_headers": {"type": "object"}
            }
        },
        "code": """
import requests

def execute(input_data, context):
    url = input_data.get('url')
    method = input_data.get('method', 'GET').upper()
    params = input_data.get('params')
    json_data = input_data.get('json_data')
    headers = input_data.get('headers', {})
    cookies = input_data.get('cookies')
    
    response = requests.request(
        method,
        url,
        params=params,
        json=json_data,
        headers=headers,
        cookies=cookies,
        timeout=30
    )
    
    try:
        data = response.json()
        success = True
    except Exception:
        data = {"raw": response.text}
        success = False
    
    return {
        "status_code": response.status_code,
        "data": data,
        "success": success,
        "response_headers": dict(response.headers)
    }
""",
        "is_preset": True
    },
    {
        "name": "json_extractor",
        "chinese_name": "JSON 数据提取",
        "description": "从 JSON 中按指定方式获取数据，放到临时变量中",
        "category": "data_extraction",
        "input_schema": {
            "type": "object",
            "properties": {
                "json_data": {
                    "type": "object",
                    "description": "输入的 JSON 数据"
                },
                "extractions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "path": {
                                "type": "string",
                                "description": "JSON 路径表达式，如 data.items[0].name"
                            },
                            "temp_var": {
                                "type": "string",
                                "description": "临时变量名"
                            }
                        },
                        "required": ["path", "temp_var"]
                    },
                    "description": "提取规则列表"
                }
            },
            "required": ["json_data", "extractions"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "temp_vars": {
                    "type": "object",
                    "description": "提取的临时变量"
                }
            }
        },
        "code": """
def get_value_by_path(data, path):
    parts = path.split('.')
    current = data
    
    for part in parts:
        if '[' in part and ']' in part:
            key_part = part[:part.index('[')]
            if key_part:
                if isinstance(current, dict):
                    current = current.get(key_part)
                else:
                    return None
            
            idx_start = part.index('[')
            idx_end = part.index(']')
            while idx_start != -1 and idx_end != -1:
                idx_str = part[idx_start+1:idx_end]
                try:
                    idx = int(idx_str)
                    if isinstance(current, (list, tuple)) and 0 <= idx < len(current):
                        current = current[idx]
                    else:
                        return None
                except ValueError:
                    return None
                
                idx_start = part.find('[', idx_end)
                idx_end = part.find(']', idx_start) if idx_start != -1 else -1
        else:
            if isinstance(current, dict):
                current = current.get(part)
            else:
                return None
        
        if current is None:
            return None
    
    return current

def execute(input_data, context):
    json_data = input_data.get('json_data', {})
    extractions = input_data.get('extractions', [])
    
    temp_vars = {}
    
    for extraction in extractions:
        path = extraction.get('path')
        temp_var = extraction.get('temp_var')
        
        if path and temp_var:
            value = get_value_by_path(json_data, path)
            temp_vars[temp_var] = value
    
    return {"temp_vars": temp_vars}
""",
        "is_preset": True
    },
    {
        "name": "logic_condition",
        "chinese_name": "逻辑判断",
        "description": "根据输入的表达式，进行逻辑判断，决定流程走向",
        "category": "flow_control",
        "input_schema": {
            "type": "object",
            "properties": {
                "expressions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "expr": {
                                "type": "string",
                                "description": "判断表达式，如 a > 10 and b == 'test'"
                            },
                            "label": {
                                "type": "string",
                                "description": "条件标签，用于连接到下一节点"
                            }
                        },
                        "required": ["expr", "label"]
                    },
                    "description": "条件表达式列表"
                },
                "default_label": {
                    "type": "string",
                    "default": "default",
                    "description": "所有条件不满足时的默认标签"
                }
            },
            "required": ["expressions"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "result_label": {
                    "type": "string",
                    "description": "匹配到的条件标签"
                },
                "matched": {
                    "type": "boolean",
                    "description": "是否匹配到条件"
                }
            }
        },
        "code": """
from app.core.template_engine import template_engine

def execute(input_data, context):
    expressions = input_data.get('expressions', [])
    default_label = input_data.get('default_label', 'default')
    
    for expr_item in expressions:
        expr = expr_item.get('expr', '')
        label = expr_item.get('label', '')
        
        try:
            result = template_engine.safe_eval(expr, context)
            if result:
                return {
                    "result_label": label,
                    "matched": True
                }
        except Exception:
            continue
    
    return {
        "result_label": default_label,
        "matched": False
    }
""",
        "is_preset": True
    }
]
