import time
import sys
import os

print('=== 测试修复后的执行器 ===\n')

print('1. 导入模块...')
from app.executors.desktop_executor import DesktopExecutor
from app.database import StepType

print('2. 创建执行器实例...')
executor = DesktopExecutor()
print('   执行器创建成功\n')

print('3. 测试鼠标移动和点击...')
print('   注意: 鼠标将移动到 (200, 200)，等待 2 秒后点击')
print('   请观察屏幕左下角区域...')
time.sleep(2)

class MockStep:
    def __init__(self, step_type, parameters):
        self.step_type = step_type
        self.parameters = parameters

step_move = MockStep(StepType.MOUSE_MOVE, {'x': 200, 'y': 200, 'duration': 0.5})
result = executor.execute_step(step_move)
print(f'   鼠标移动结果: {result}')

time.sleep(1)

step_click = MockStep(StepType.MOUSE_CLICK, {'x': 200, 'y': 200})
result = executor.execute_step(step_click)
print(f'   鼠标点击结果: {result}\n')

print('4. 测试键盘按键 (win + d = 显示桌面)...')
print('   注意: 2 秒后按下 Win+D 显示/隐藏桌面')
time.sleep(2)

step_hotkey = MockStep(StepType.HOTKEY, {'keys': 'win, d'})
result = executor.execute_step(step_hotkey)
print(f'   快捷键结果: {result}\n')

print('5. 测试等待 2 秒...')
step_sleep = MockStep(StepType.SLEEP, {'seconds': 2})
result = executor.execute_step(step_sleep)
print(f'   等待结果: {result}\n')

print('6. 再次按下 Win+D 恢复桌面...')
step_hotkey2 = MockStep(StepType.HOTKEY, {'keys': 'win, d'})
result = executor.execute_step(step_hotkey2)
print(f'   快捷键结果: {result}\n')

print('=== 测试完成 ===')
print('如果您看到桌面被显示又恢复，说明修复成功！')
