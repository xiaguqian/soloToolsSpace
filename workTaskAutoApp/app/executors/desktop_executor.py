import time
import pyautogui
import pytesseract
from PIL import Image
import numpy as np
import cv2
import sys
from app.config import Config
from app.database import StepType

class DesktopExecutor:
    def __init__(self):
        self._setup_display()
        pyautogui.FAILSAFE = False
        pyautogui.PAUSE = 0.1
        pytesseract.pytesseract.tesseract_cmd = Config.TESSERACT_PATH
    
    def _setup_display(self):
        if sys.platform == 'win32':
            try:
                import ctypes
                PROCESS_PER_MONITOR_DPI_AWARE = 2
                ctypes.windll.shcore.SetProcessDpiAwareness(PROCESS_PER_MONITOR_DPI_AWARE)
            except Exception:
                try:
                    import ctypes
                    ctypes.windll.user32.SetProcessDPIAware()
                except Exception:
                    pass
    
    def _validate_coords(self, x, y):
        if x is None or y is None:
            return None, None
        
        x = int(x)
        y = int(y)
        
        screen_w, screen_h = pyautogui.size()
        
        if x < 0:
            x = 0
        elif x >= screen_w:
            x = screen_w - 10
        
        if y < 0:
            y = 0
        elif y >= screen_h:
            y = screen_h - 10
        
        return x, y
    
    def execute_step(self, step):
        step_type = step.step_type
        params = step.parameters or {}
        
        try:
            if step_type == StepType.MOUSE_CLICK:
                return self._mouse_click(params)
            elif step_type == StepType.MOUSE_DOUBLE_CLICK:
                return self._mouse_double_click(params)
            elif step_type == StepType.MOUSE_MOVE:
                return self._mouse_move(params)
            elif step_type == StepType.MOUSE_SCROLL:
                return self._mouse_scroll(params)
            elif step_type == StepType.KEY_PRESS:
                return self._key_press(params)
            elif step_type == StepType.KEY_RELEASE:
                return self._key_release(params)
            elif step_type == StepType.KEY_TYPE:
                return self._key_type(params)
            elif step_type == StepType.HOTKEY:
                return self._hotkey(params)
            elif step_type == StepType.IMAGE_RECOGNIZE:
                return self._image_recognize(params)
            elif step_type == StepType.OCR_RECOGNIZE:
                return self._ocr_recognize(params)
            elif step_type == StepType.SLEEP:
                return self._sleep(params)
            else:
                raise ValueError(f'不支持的桌面操作类型: {step_type}')
        except Exception as e:
            raise Exception(f'执行步骤失败: {str(e)}')
    
    def _mouse_click(self, params):
        x = params.get('x')
        y = params.get('y')
        button = params.get('button', 'left')
        clicks = int(params.get('clicks', 1))
        interval = float(params.get('interval', 0.1))
        
        if x is not None and y is not None:
            x, y = self._validate_coords(x, y)
            pyautogui.moveTo(x=x, y=y, duration=0.3)
            time.sleep(0.2)
            pyautogui.click(button=button, clicks=clicks, interval=interval)
            time.sleep(0.1)
            actual_pos = pyautogui.position()
            return {'success': True, 'action': 'mouse_click', 'target': (x, y), 'actual': (actual_pos.x, actual_pos.y)}
        else:
            pyautogui.click(button=button, clicks=clicks, interval=interval)
            time.sleep(0.1)
            return {'success': True, 'action': 'mouse_click'}
    
    def _mouse_double_click(self, params):
        x = params.get('x')
        y = params.get('y')
        button = params.get('button', 'left')
        
        if x is not None and y is not None:
            x, y = self._validate_coords(x, y)
            pyautogui.moveTo(x=x, y=y, duration=0.3)
            time.sleep(0.2)
            pyautogui.doubleClick(button=button)
            time.sleep(0.1)
            actual_pos = pyautogui.position()
            return {'success': True, 'action': 'mouse_double_click', 'target': (x, y), 'actual': (actual_pos.x, actual_pos.y)}
        else:
            pyautogui.doubleClick(button=button)
            time.sleep(0.1)
            return {'success': True, 'action': 'mouse_double_click'}
    
    def _mouse_move(self, params):
        x = params.get('x')
        y = params.get('y')
        duration = float(params.get('duration', 0.3))
        
        if x is not None and y is not None:
            x, y = self._validate_coords(x, y)
            pyautogui.moveTo(x=x, y=y, duration=duration)
            time.sleep(0.1)
            actual_pos = pyautogui.position()
            return {'success': True, 'action': 'mouse_move', 'target': (x, y), 'actual': (actual_pos.x, actual_pos.y)}
        return {'success': True, 'action': 'mouse_move', 'position': (x, y)}
    
    def _mouse_scroll(self, params):
        clicks = int(params.get('clicks', 0))
        x = params.get('x')
        y = params.get('y')
        
        if x is not None and y is not None:
            x, y = self._validate_coords(x, y)
            pyautogui.moveTo(x=x, y=y, duration=0.3)
            time.sleep(0.2)
        
        pyautogui.scroll(clicks=clicks)
        time.sleep(0.2)
        return {'success': True, 'action': 'mouse_scroll', 'clicks': clicks}
    
    def _key_press(self, params):
        key = params.get('key')
        if key:
            pyautogui.press(key)
        return {'success': True, 'action': 'key_press', 'key': key}
    
    def _key_release(self, params):
        key = params.get('key')
        if key:
            pyautogui.keyUp(key)
        return {'success': True, 'action': 'key_release', 'key': key}
    
    def _key_type(self, params):
        text = params.get('text', '')
        interval = params.get('interval', 0.1)
        pyautogui.typewrite(text, interval=interval)
        return {'success': True, 'action': 'key_type', 'text': text}
    
    def _hotkey(self, params):
        keys = params.get('keys', [])
        if keys:
            if isinstance(keys, str):
                keys = [k.strip() for k in keys.split(',')]
            pyautogui.hotkey(*keys)
        return {'success': True, 'action': 'hotkey', 'keys': keys}
    
    def _image_recognize(self, params):
        template_path = params.get('template_path')
        confidence = params.get('confidence', 0.8)
        region = params.get('region')
        grayscale = params.get('grayscale', False)
        
        if not template_path:
            raise ValueError('缺少模板图片路径')
        
        try:
            screenshot = pyautogui.screenshot(region=region) if region else pyautogui.screenshot()
            screenshot_cv = cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)
            template = cv2.imread(template_path)
            
            if grayscale:
                screenshot_cv = cv2.cvtColor(screenshot_cv, cv2.COLOR_BGR2GRAY)
                template = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)
            
            result = cv2.matchTemplate(screenshot_cv, template, cv2.TM_CCOEFF_NORMED)
            min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
            
            h, w = template.shape[:2]
            center_x = max_loc[0] + w // 2
            center_y = max_loc[1] + h // 2
            
            if region:
                center_x += region[0]
                center_y += region[1]
            
            if max_val >= confidence:
                return {
                    'success': True, 
                    'action': 'image_recognize',
                    'found': True,
                    'confidence': max_val,
                    'position': (center_x, center_y)
                }
            else:
                return {
                    'success': True, 
                    'action': 'image_recognize',
                    'found': False,
                    'confidence': max_val
                }
        except Exception as e:
            raise Exception(f'图像识别失败: {str(e)}')
    
    def _ocr_recognize(self, params):
        region = params.get('region')
        lang = params.get('lang', 'chi_sim+eng')
        
        try:
            screenshot = pyautogui.screenshot(region=region) if region else pyautogui.screenshot()
            text = pytesseract.image_to_string(screenshot, lang=lang)
            
            return {
                'success': True,
                'action': 'ocr_recognize',
                'text': text.strip()
            }
        except Exception as e:
            raise Exception(f'OCR识别失败: {str(e)}')
    
    def _sleep(self, params):
        seconds = params.get('seconds', 1.0)
        time.sleep(seconds)
        return {'success': True, 'action': 'sleep', 'duration': seconds}
    
    def get_mouse_position(self):
        x, y = pyautogui.position()
        return {'x': x, 'y': y}
    
    def get_screen_size(self):
        width, height = pyautogui.size()
        return {'width': width, 'height': height}
    
    def take_screenshot(self, region=None, save_path=None):
        screenshot = pyautogui.screenshot(region=region) if region else pyautogui.screenshot()
        if save_path:
            screenshot.save(save_path)
        return screenshot
