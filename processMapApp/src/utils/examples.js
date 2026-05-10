import { generateId } from './helpers.js'

export const exampleFlows = [
  {
    name: '用户注册流程',
    description: '一个典型的用户注册流程示例',
    data: {
      nodes: [
        {
          id: generateId(),
          type: 'start',
          position: { x: 300, y: 50 },
          data: { label: '开始', bgColor: '#10b981', borderColor: '#059669', fontSize: 14 },
          style: { width: 120, height: 50 }
        },
        {
          id: generateId(),
          type: 'rectangle',
          position: { x: 260, y: 150 },
          data: { label: '填写注册信息', bgColor: '#ffffff', borderColor: '#cbd5e1', fontSize: 14 },
          style: { width: 200, height: 60 }
        },
        {
          id: generateId(),
          type: 'diamond',
          position: { x: 240, y: 280 },
          data: { label: '信息是否有效？', bgColor: '#fef3c7', borderColor: '#f59e0b', fontSize: 14 },
          style: { width: 240, height: 80 }
        },
        {
          id: generateId(),
          type: 'rectangle',
          position: { x: 520, y: 280 },
          data: { label: '提示错误信息', bgColor: '#fee2e2', borderColor: '#ef4444', fontSize: 14 },
          style: { width: 160, height: 60 }
        },
        {
          id: generateId(),
          type: 'rectangle',
          position: { x: 260, y: 420 },
          data: { label: '发送验证邮件', bgColor: '#dbeafe', borderColor: '#3b82f6', fontSize: 14 },
          style: { width: 200, height: 60 }
        },
        {
          id: generateId(),
          type: 'end',
          position: { x: 300, y: 540 },
          data: { label: '结束', bgColor: '#ef4444', borderColor: '#dc2626', fontSize: 14 },
          style: { width: 120, height: 50 }
        }
      ],
      edges: []
    }
  },
  {
    name: '订单处理流程',
    description: '电商订单处理的完整流程',
    data: {
      nodes: [
        {
          id: generateId(),
          type: 'start',
          position: { x: 400, y: 30 },
          data: { label: '用户下单', bgColor: '#10b981', borderColor: '#059669', fontSize: 14 },
          style: { width: 140, height: 50 }
        },
        {
          id: generateId(),
          type: 'parallelogram',
          position: { x: 360, y: 130 },
          data: { label: '接收订单数据', bgColor: '#e0e7ff', borderColor: '#6366f1', fontSize: 14 },
          style: { width: 220, height: 60 }
        },
        {
          id: generateId(),
          type: 'diamond',
          position: { x: 340, y: 250 },
          data: { label: '库存是否充足？', bgColor: '#fef3c7', borderColor: '#f59e0b', fontSize: 14 },
          style: { width: 260, height: 80 }
        },
        {
          id: generateId(),
          type: 'rectangle',
          position: { x: 650, y: 250 },
          data: { label: '通知用户缺货', bgColor: '#fee2e2', borderColor: '#ef4444', fontSize: 14 },
          style: { width: 160, height: 60 }
        },
        {
          id: generateId(),
          type: 'roundrect',
          position: { x: 350, y: 400 },
          data: { label: '生成发货单', bgColor: '#dcfce7', borderColor: '#22c55e', fontSize: 14 },
          style: { width: 240, height: 60 }
        },
        {
          id: generateId(),
          type: 'end',
          position: { x: 390, y: 520 },
          data: { label: '订单完成', bgColor: '#ef4444', borderColor: '#dc2626', fontSize: 14 },
          style: { width: 160, height: 50 }
        }
      ],
      edges: []
    }
  }
]

export const addExampleEdges = (nodes) => {
  const edges = []
  
  const addEdge = (sourceIdx, targetIdx, options = {}) => {
    const sourceNode = nodes[sourceIdx]
    const targetNode = nodes[targetIdx]
    
    if (!sourceNode || !targetNode) return
    
    edges.push({
      id: generateId(),
      source: sourceNode.id,
      target: targetNode.id,
      type: 'smoothstep',
      animated: false,
      markerEnd: { type: 'arrowclosed' },
      data: {
        label: options.label || '',
        lineWidth: options.lineWidth || 2,
        color: options.color || '#64748b',
        arrowType: options.arrowType || 'single'
      },
      sourceHandle: options.sourceHandle,
      targetHandle: options.targetHandle
    })
  }
  
  if (nodes.length >= 6) {
    addEdge(0, 1)
    addEdge(1, 2)
    
    addEdge(2, 4, { label: '是' })
    addEdge(2, 3, { label: '否', color: '#ef4444', sourceHandle: 'right', targetHandle: 'left' })
    
    addEdge(4, 5)
  }
  
  return edges
}
