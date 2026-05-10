import time
import sys
import os

print('=== 测试任务执行器 ===')
print(f'工作目录: {os.getcwd()}')
print(f'Python路径: {sys.executable}\n')

print('1. 导入模块...')
from app.executors.desktop_executor import DesktopExecutor
from app.database import StepType

print('2. 创建执行器实例...')
executor = DesktopExecutor()
print('   执行器创建成功\n')

print('3. 测试鼠标点击 (坐标 500, 500)...')
print('   注意: 请观察鼠标是否移动到 (500, 500) 并点击')
time.sleep(2)

class MockStep:
    def __init__(self, step_type, parameters):
        self.step_type = step_type
        self.parameters = parameters

step_click = MockStep(StepType.MOUSE_CLICK, {'x': 500, 'y': 500})
result = executor.execute_step(step_click)
print(f'   结果: {result}\n')

print('4. 测试鼠标滚动...')
time.sleep(1)
step_scroll = MockStep(StepType.MOUSE_SCROLL, {'clicks': -10, 'x': 500, 'y': 500})
result = executor.execute_step(step_scroll)
print(f'   结果: {result}\n')

print('5. 测试等待...')
time.sleep(1)
step_sleep = MockStep(StepType.SLEEP, {'seconds': 2})
result = executor.execute_step(step_sleep)
print(f'   结果: {result}\n')

print('=== 测试完成 ===')
print('如果鼠标没有移动，请检查:')
print('1. 是否有安全软件拦截')
print('2. 是否在远程桌面或虚拟机环境')
print('3. 尝试以管理员权限运行')
