import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.template_engine import template_engine
from app.services.component_executor import component_executor
from sqlalchemy.orm import Session
from app.models.models import Component, TaskExecutionLog

class FlowExecutor:
    def __init__(self, db: Session):
        self.db = db
        self.context = {}
        self.execution_log = []
    
    def _find_start_nodes(self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        node_ids = set(node.get('id') for node in nodes)
        target_node_ids = set(edge.get('target') for edge in edges)
        start_node_ids = node_ids - target_node_ids
        return [n for n in nodes if n.get('id') in start_node_ids]
    
    def _get_component(self, component_name: str) -> Optional[Component]:
        return self.db.query(Component).filter(Component.name == component_name).first()
    
    def _get_next_nodes(self, current_node_id: str, edges: List[Dict[str, Any]], result_label: Optional[str] = None) -> List[str]:
        next_node_ids = []
        
        for edge in edges:
            if edge.get('source') == current_node_id:
                condition = edge.get('condition')
                
                if condition and result_label:
                    try:
                        if condition == result_label:
                            next_node_ids.append(edge.get('target'))
                    except Exception:
                        pass
                elif not condition:
                    next_node_ids.append(edge.get('target'))
        
        return next_node_ids
    
    def _execute_node(self, node: Dict[str, Any]) -> Dict[str, Any]:
        node_id = node.get('id')
        component_name = node.get('component')
        input_data = node.get('input', {})
        
        component = self._get_component(component_name)
        if not component:
            raise ValueError(f"组件不存在: {component_name}")
        
        result = component_executor.execute_component(
            component_name=component_name,
            code=component.code,
            input_data=input_data,
            context=self.context
        )
        
        self.context[f"node_{node_id}_output"] = result
        
        if component_name == "json_extractor" and result.get("temp_vars"):
            for key, value in result.get("temp_vars", {}).items():
                self.context[key] = value
        
        self.execution_log.append({
            "node_id": node_id,
            "component": component_name,
            "input": input_data,
            "output": result,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return result
    
    def execute_flow(self, flow_data: Dict[str, Any], initial_context: Dict[str, Any] = None) -> Dict[str, Any]:
        nodes = flow_data.get('nodes', [])
        edges = flow_data.get('edges', [])
        
        if initial_context:
            self.context.update(initial_context)
        
        start_nodes = self._find_start_nodes(nodes, edges)
        
        if not start_nodes:
            raise ValueError("流程图中没有起始节点")
        
        node_map = {node.get('id'): node for node in nodes}
        
        visited_nodes = set()
        execution_queue = [node.get('id') for node in start_nodes]
        
        while execution_queue:
            current_node_id = execution_queue.pop(0)
            
            if current_node_id in visited_nodes:
                continue
            
            if current_node_id not in node_map:
                continue
            
            current_node = node_map[current_node_id]
            component_name = current_node.get('component')
            
            try:
                result = self._execute_node(current_node)
                visited_nodes.add(current_node_id)
                
                result_label = None
                if component_name == "logic_condition":
                    result_label = result.get("result_label")
                
                next_node_ids = self._get_next_nodes(current_node_id, edges, result_label)
                
                for next_id in next_node_ids:
                    if next_id not in visited_nodes and next_id not in execution_queue:
                        execution_queue.append(next_id)
            except Exception as e:
                self.execution_log.append({
                    "node_id": current_node_id,
                    "component": component_name,
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                })
                raise e
        
        return {
            "success": True,
            "execution_log": self.execution_log,
            "final_context": self.context
        }

def execute_test_flow(db: Session, flow_data: Dict[str, Any], initial_context: Dict[str, Any] = None) -> Dict[str, Any]:
    executor = FlowExecutor(db)
    return executor.execute_flow(flow_data, initial_context)

def execute_spider_task(db: Session, task_id: int, flow_data: Dict[str, Any]) -> Dict[str, Any]:
    execution_id = str(uuid.uuid4())
    
    execution_log = TaskExecutionLog(
        task_id=task_id,
        execution_id=execution_id,
        status="running",
        start_time=datetime.utcnow()
    )
    db.add(execution_log)
    db.commit()
    
    try:
        executor = FlowExecutor(db)
        result = executor.execute_flow(flow_data)
        
        execution_log.status = "completed"
        execution_log.end_time = datetime.utcnow()
        execution_log.result = result
        db.commit()
        
        return result
    except Exception as e:
        execution_log.status = "failed"
        execution_log.end_time = datetime.utcnow()
        execution_log.error_message = str(e)
        db.commit()
        
        raise e
