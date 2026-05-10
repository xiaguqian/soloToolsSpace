import time
import sys
import ctypes

print('=== 测试 pyautogui 基本功能 ===')
print('当前 Python 版本:', sys.version)

print('\n1. 设置 DPI 感知...')
try:
    PROCESS_PER_MONITOR_DPI_AWARE = 2
    ctypes.windll.shcore.SetProcessDpiAwareness(PROCESS_PER_MONITOR_DPI_AWARE)
    print('   DPI 感知设置成功 (shcore.SetProcessDpiAwareness)')
except Exception as e:
    print(f'   shcore 失败: {e}')
    try:
        ctypes.windll.user32.SetProcessDPIAware()
        print('   DPI 感知设置成功 (user32.SetProcessDPIAware)')
    except Exception as e2:
        print(f'   user32 也失败: {e2}')

print('\n2. 导入 pyautogui...')
import pyautogui

print(f'   pyautogui 版本: {pyautogui.__version__}')
print(f'   FAILSAFE: {pyautogui.FAILSAFE}')
print(f'   PAUSE: {pyautogui.PAUSE}')

print('\n3. 获取屏幕信息...')
screen_size = pyautogui.size()
print(f'   屏幕尺寸: {screen_size}')

current_pos = pyautogui.position()
print(f'   当前鼠标位置: {current_pos}')

print('\n4. 测试鼠标移动 (将鼠标移到 100, 100)...')
print('   注意: 请观察鼠标是否移动')
pyautogui.moveTo(x=100, y=100, duration=0.5)
time.sleep(0.5)
new_pos = pyautogui.position()
print(f'   移动后位置: {new_pos}')
print(f'   移动成功: {new_pos.x == 100 and new_pos.y == 100}')

print('\n5. 测试鼠标点击 (点击 100, 100)...')
print('   注意: 请观察是否有点击效果')
pyautogui.moveTo(x=100, y=100, duration=0.2)
time.sleep(0.1)
pyautogui.click(x=100, y=100, button='left')
time.sleep(0.5)
print('   点击完成')

print('\n6. 测试键盘输入...')
print('   请打开一个文本编辑器，3秒后将输入测试文本')
time.sleep(3)
pyautogui.typewrite('Hello, pyautogui!', interval=0.1)
print('   输入完成')

print('\n=== 测试完成 ===')
print('如果以上操作都没有效果，请检查:')
print('1. 是否以管理员权限运行')
print('2. 是否在远程桌面环境')
print('3. 是否有其他软件拦截了输入')
