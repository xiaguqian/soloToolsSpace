import importlib.util
import sys
from typing import Dict, Any
from app.core.template_engine import template_engine

class ComponentExecutor:
    def __init__(self):
        self._module_cache = {}
    
    def _load_module_from_code(self, module_name: str, code: str):
        if module_name in self._module_cache:
            return self._module_cache[module_name]
        
        spec = importlib.util.spec_from_loader(module_name, loader=None)
        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        
        exec(code, module.__dict__)
        self._module_cache[module_name] = module
        
        return module
    
    def execute_component(self, component_name: str, code: str, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        rendered_input = template_engine.render_json(input_data, context)
        
        module = self._load_module_from_code(f"dynamic_component_{component_name}", code)
        
        if not hasattr(module, 'execute'):
            raise ValueError(f"组件 {component_name} 缺少 execute 函数")
        
        execute_func = getattr(module, 'execute')
        result = execute_func(rendered_input, context)
        
        return result

component_executor = ComponentExecutor()
