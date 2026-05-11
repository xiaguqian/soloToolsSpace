import re
import ast
import operator
from typing import Any, Dict, List
from jinja2 import Environment, BaseLoader

class TemplateEngine:
    def __init__(self):
        self.jinja_env = Environment(loader=BaseLoader())
        
        self.operators = {
            ast.Add: operator.add,
            ast.Sub: operator.sub,
            ast.Mult: operator.mul,
            ast.Div: operator.truediv,
            ast.FloorDiv: operator.floordiv,
            ast.Mod: operator.mod,
            ast.Pow: operator.pow,
            ast.Eq: operator.eq,
            ast.NotEq: operator.ne,
            ast.Lt: operator.lt,
            ast.LtE: operator.le,
            ast.Gt: operator.gt,
            ast.GtE: operator.ge,
            ast.And: lambda a, b: a and b,
            ast.Or: lambda a, b: a or b,
            ast.Not: operator.not_,
        }
        
    def safe_eval(self, expr: str, context: Dict[str, Any]) -> Any:
        try:
            tree = ast.parse(expr, mode='eval')
            return self._eval_node(tree.body, context)
        except Exception as e:
            raise ValueError(f"表达式解析错误: {e}")
    
    def _eval_node(self, node: ast.AST, context: Dict[str, Any]) -> Any:
        if isinstance(node, ast.Constant):
            return node.value
        elif isinstance(node, ast.Num):
            return node.n
        elif isinstance(node, ast.Str):
            return node.s
        elif isinstance(node, ast.Name):
            if node.id in context:
                return context[node.id]
            raise ValueError(f"变量未定义: {node.id}")
        elif isinstance(node, ast.Attribute):
            value = self._eval_node(node.value, context)
            if isinstance(value, dict):
                if node.attr in value:
                    return value[node.attr]
            if hasattr(value, node.attr):
                return getattr(value, node.attr)
            raise ValueError(f"属性不存在: {node.attr}")
        elif isinstance(node, ast.Subscript):
            value = self._eval_node(node.value, context)
            key = self._eval_node(node.slice.value if hasattr(node.slice, 'value') else node.slice, context)
            if isinstance(value, (list, tuple)) and isinstance(key, int):
                return value[key]
            elif isinstance(value, dict):
                return value[key]
            raise ValueError(f"无法索引: {type(value)}")
        elif isinstance(node, ast.BinOp):
            left = self._eval_node(node.left, context)
            right = self._eval_node(node.right, context)
            if type(node.op) in self.operators:
                return self.operators[type(node.op)](left, right)
            raise ValueError(f"不支持的运算符: {type(node.op)}")
        elif isinstance(node, ast.UnaryOp):
            operand = self._eval_node(node.operand, context)
            if type(node.op) in self.operators:
                return self.operators[type(node.op)](operand)
            raise ValueError(f"不支持的一元运算符: {type(node.op)}")
        elif isinstance(node, ast.BoolOp):
            values = [self._eval_node(v, context) for v in node.values]
            if isinstance(node.op, ast.And):
                result = True
                for v in values:
                    result = result and v
                return result
            elif isinstance(node.op, ast.Or):
                result = False
                for v in values:
                    result = result or v
                return result
            raise ValueError(f"不支持的布尔运算符: {type(node.op)}")
        elif isinstance(node, ast.Compare):
            left = self._eval_node(node.left, context)
            for op, comparator in zip(node.ops, node.comparators):
                right = self._eval_node(comparator, context)
                if type(op) in self.operators:
                    if not self.operators[type(op)](left, right):
                        return False
                    left = right
                else:
                    raise ValueError(f"不支持的比较运算符: {type(op)}")
            return True
        elif isinstance(node, ast.IfExp):
            test = self._eval_node(node.test, context)
            if test:
                return self._eval_node(node.body, context)
            else:
                return self._eval_node(node.orelse, context)
        elif isinstance(node, ast.List):
            return [self._eval_node(elt, context) for elt in node.elts]
        elif isinstance(node, ast.Tuple):
            return tuple(self._eval_node(elt, context) for elt in node.elts)
        elif isinstance(node, ast.Dict):
            return {
                self._eval_node(k, context): self._eval_node(v, context)
                for k, v in zip(node.keys, node.values)
            }
        elif isinstance(node, ast.Call):
            func_name = self._eval_node(node.func, context)
            args = [self._eval_node(arg, context) for arg in node.args]
            kwargs = {
                kw.arg: self._eval_node(kw.value, context)
                for kw in node.keywords
            }
            if callable(func_name):
                return func_name(*args, **kwargs)
            raise ValueError(f"不是可调用对象: {func_name}")
        else:
            raise ValueError(f"不支持的表达式节点: {type(node)}")
    
    def render_template(self, template_str: str, context: Dict[str, Any]) -> Any:
        if not isinstance(template_str, str):
            return template_str
        
        if '{{' in template_str or '{%' in template_str:
            try:
                template = self.jinja_env.from_string(template_str)
                return template.render(**context)
            except Exception as e:
                raise ValueError(f"Jinja2 模板渲染错误: {e}")
        
        if template_str.startswith('${') and template_str.endswith('}'):
            expr = template_str[2:-1].strip()
            return self.safe_eval(expr, context)
        
        if '${' in template_str and '}' in template_str:
            def replace_expr(match):
                expr = match.group(1).strip()
                return str(self.safe_eval(expr, context))
            return re.sub(r'\$\{([^}]+)\}', replace_expr, template_str)
        
        return template_str
    
    def render_json(self, data: Any, context: Dict[str, Any]) -> Any:
        if isinstance(data, dict):
            return {k: self.render_json(v, context) for k, v in data.items()}
        elif isinstance(data, list):
            return [self.render_json(item, context) for item in data]
        elif isinstance(data, str):
            return self.render_template(data, context)
        else:
            return data

template_engine = TemplateEngine()
