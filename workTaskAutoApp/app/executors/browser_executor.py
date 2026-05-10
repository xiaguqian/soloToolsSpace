import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
import pyautogui
from app.config import Config
from app.database import StepType

class BrowserExecutor:
    def __init__(self, browser_type='chrome'):
        self.browser_type = browser_type.lower()
        self.driver = None
        self.current_window_handle = None
        self.frames = []
    
    def _init_driver(self):
        if self.driver is not None:
            return
        
        options = self._get_options()
        
        if self.browser_type == 'chrome':
            self.driver = webdriver.Chrome(
                service=ChromeService(ChromeDriverManager().install()),
                options=options
            )
        elif self.browser_type == 'firefox':
            self.driver = webdriver.Firefox(
                service=FirefoxService(GeckoDriverManager().install()),
                options=options
            )
        elif self.browser_type == 'edge':
            self.driver = webdriver.Edge(
                service=EdgeService(EdgeChromiumDriverManager().install()),
                options=options
            )
        else:
            raise ValueError(f'不支持的浏览器类型: {self.browser_type}')
        
        self.current_window_handle = self.driver.current_window_handle
        self.driver.maximize_window()
    
    def _get_options(self):
        if self.browser_type == 'chrome':
            options = webdriver.ChromeOptions()
            options.add_argument('--start-maximized')
            options.add_argument('--disable-notifications')
            options.add_argument('--disable-popup-blocking')
            return options
        elif self.browser_type == 'firefox':
            options = webdriver.FirefoxOptions()
            return options
        elif self.browser_type == 'edge':
            options = webdriver.EdgeOptions()
            options.add_argument('--start-maximized')
            return options
        return None
    
    def execute_step(self, step):
        step_type = step.step_type
        params = step.parameters or {}
        
        try:
            if step_type == StepType.BROWSER_OPEN:
                return self._browser_open(params)
            elif step_type == StepType.BROWSER_CLOSE:
                return self._browser_close(params)
            elif step_type == StepType.BROWSER_GOTO:
                return self._browser_goto(params)
            elif step_type == StepType.BROWSER_FIND_ELEMENT:
                return self._browser_find_element(params)
            elif step_type == StepType.BROWSER_CLICK:
                return self._browser_click(params)
            elif step_type == StepType.BROWSER_INPUT:
                return self._browser_input(params)
            elif step_type == StepType.BROWSER_GET_TEXT:
                return self._browser_get_text(params)
            elif step_type == StepType.BROWSER_SWITCH_WINDOW:
                return self._browser_switch_window(params)
            elif step_type == StepType.BROWSER_SWITCH_FRAME:
                return self._browser_switch_frame(params)
            elif step_type == StepType.BROWSER_EXECUTE_JS:
                return self._browser_execute_js(params)
            elif step_type == StepType.BROWSER_SCREENSHOT:
                return self._browser_screenshot(params)
            else:
                raise ValueError(f'不支持的浏览器操作类型: {step_type}')
        except Exception as e:
            raise Exception(f'执行步骤失败: {str(e)}')
    
    def _browser_open(self, params):
        self._init_driver()
        browser_type = params.get('browser_type', 'chrome')
        self.browser_type = browser_type.lower()
        if self.driver is None:
            self._init_driver()
        return {'success': True, 'action': 'browser_open', 'browser': self.browser_type}
    
    def _browser_close(self, params):
        close_all = params.get('close_all', False)
        if self.driver:
            if close_all:
                self.driver.quit()
                self.driver = None
                self.frames = []
            else:
                self.driver.close()
                handles = self.driver.window_handles
                if handles:
                    self.driver.switch_to.window(handles[-1])
        return {'success': True, 'action': 'browser_close'}
    
    def _browser_goto(self, params):
        self._init_driver()
        url = params.get('url')
        if not url:
            raise ValueError('缺少URL参数')
        self.driver.get(url)
        return {'success': True, 'action': 'browser_goto', 'url': url}
    
    def _browser_find_element(self, params):
        self._init_driver()
        by = params.get('by', 'css_selector')
        value = params.get('value')
        timeout = params.get('timeout', 10)
        
        if not value:
            raise ValueError('缺少元素定位参数')
        
        by_mapping = {
            'id': By.ID,
            'name': By.NAME,
            'xpath': By.XPATH,
            'css_selector': By.CSS_SELECTOR,
            'class_name': By.CLASS_NAME,
            'tag_name': By.TAG_NAME,
            'link_text': By.LINK_TEXT,
            'partial_link_text': By.PARTIAL_LINK_TEXT
        }
        
        locator = by_mapping.get(by, By.CSS_SELECTOR)
        
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((locator, value))
            )
            return {
                'success': True,
                'action': 'browser_find_element',
                'found': True,
                'element': str(element)
            }
        except TimeoutException:
            return {
                'success': True,
                'action': 'browser_find_element',
                'found': False
            }
    
    def _browser_click(self, params):
        self._init_driver()
        by = params.get('by', 'css_selector')
        value = params.get('value')
        timeout = params.get('timeout', 10)
        
        if not value:
            raise ValueError('缺少元素定位参数')
        
        by_mapping = {
            'id': By.ID,
            'name': By.NAME,
            'xpath': By.XPATH,
            'css_selector': By.CSS_SELECTOR,
            'class_name': By.CLASS_NAME,
            'tag_name': By.TAG_NAME,
            'link_text': By.LINK_TEXT,
            'partial_link_text': By.PARTIAL_LINK_TEXT
        }
        
        locator = by_mapping.get(by, By.CSS_SELECTOR)
        
        element = WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable((locator, value))
        )
        element.click()
        return {'success': True, 'action': 'browser_click'}
    
    def _browser_input(self, params):
        self._init_driver()
        by = params.get('by', 'css_selector')
        value = params.get('value')
        text = params.get('text', '')
        timeout = params.get('timeout', 10)
        clear_first = params.get('clear_first', True)
        
        if not value:
            raise ValueError('缺少元素定位参数')
        
        by_mapping = {
            'id': By.ID,
            'name': By.NAME,
            'xpath': By.XPATH,
            'css_selector': By.CSS_SELECTOR,
            'class_name': By.CLASS_NAME,
            'tag_name': By.TAG_NAME,
            'link_text': By.LINK_TEXT,
            'partial_link_text': By.PARTIAL_LINK_TEXT
        }
        
        locator = by_mapping.get(by, By.CSS_SELECTOR)
        
        element = WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located((locator, value))
        )
        
        if clear_first:
            element.clear()
        element.send_keys(text)
        return {'success': True, 'action': 'browser_input', 'text': text}
    
    def _browser_get_text(self, params):
        self._init_driver()
        by = params.get('by', 'css_selector')
        value = params.get('value')
        timeout = params.get('timeout', 10)
        
        if not value:
            raise ValueError('缺少元素定位参数')
        
        by_mapping = {
            'id': By.ID,
            'name': By.NAME,
            'xpath': By.XPATH,
            'css_selector': By.CSS_SELECTOR,
            'class_name': By.CLASS_NAME,
            'tag_name': By.TAG_NAME,
            'link_text': By.LINK_TEXT,
            'partial_link_text': By.PARTIAL_LINK_TEXT
        }
        
        locator = by_mapping.get(by, By.CSS_SELECTOR)
        
        element = WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located((locator, value))
        )
        
        return {
            'success': True,
            'action': 'browser_get_text',
            'text': element.text
        }
    
    def _browser_switch_window(self, params):
        self._init_driver()
        window_index = params.get('index', -1)
        window_title = params.get('title')
        
        if window_title:
            current_handle = self.driver.current_window_handle
            for handle in self.driver.window_handles:
                if handle != current_handle:
                    self.driver.switch_to.window(handle)
                    if window_title in self.driver.title:
                        self.current_window_handle = handle
                        self.frames = []
                        return {'success': True, 'action': 'browser_switch_window', 'title': self.driver.title}
        else:
            handles = self.driver.window_handles
            if window_index < 0:
                window_index = len(handles) + window_index
            if 0 <= window_index < len(handles):
                self.driver.switch_to.window(handles[window_index])
                self.current_window_handle = handles[window_index]
                self.frames = []
                return {'success': True, 'action': 'browser_switch_window', 'index': window_index}
        
        raise ValueError('未找到目标窗口')
    
    def _browser_switch_frame(self, params):
        self._init_driver()
        frame_index = params.get('index')
        frame_by = params.get('by', 'css_selector')
        frame_value = params.get('value')
        back_to_default = params.get('back_to_default', False)
        
        if back_to_default:
            self.driver.switch_to.default_content()
            self.frames = []
            return {'success': True, 'action': 'browser_switch_frame', 'default': True}
        
        if frame_index is not None:
            self.driver.switch_to.frame(frame_index)
            self.frames.append(frame_index)
        elif frame_value:
            by_mapping = {
                'id': By.ID,
                'name': By.NAME,
                'xpath': By.XPATH,
                'css_selector': By.CSS_SELECTOR
            }
            locator = by_mapping.get(frame_by, By.CSS_SELECTOR)
            frame_element = self.driver.find_element(locator, frame_value)
            self.driver.switch_to.frame(frame_element)
            self.frames.append(frame_value)
        
        return {'success': True, 'action': 'browser_switch_frame'}
    
    def _browser_execute_js(self, params):
        self._init_driver()
        script = params.get('script')
        args = params.get('args', [])
        
        if not script:
            raise ValueError('缺少JavaScript脚本')
        
        result = self.driver.execute_script(script, *args)
        return {
            'success': True,
            'action': 'browser_execute_js',
            'result': str(result) if result else None
        }
    
    def _browser_screenshot(self, params):
        self._init_driver()
        filename = params.get('filename')
        element_by = params.get('element_by')
        element_value = params.get('element_value')
        
        if not filename:
            timestamp = time.strftime('%Y%m%d_%H%M%S')
            filename = f'browser_screenshot_{timestamp}.png'
        
        save_path = os.path.join(Config.SCREENSHOT_DIR, filename)
        os.makedirs(Config.SCREENSHOT_DIR, exist_ok=True)
        
        if element_by and element_value:
            by_mapping = {
                'id': By.ID,
                'name': By.NAME,
                'xpath': By.XPATH,
                'css_selector': By.CSS_SELECTOR
            }
            locator = by_mapping.get(element_by, By.CSS_SELECTOR)
            element = self.driver.find_element(locator, element_value)
            element.screenshot(save_path)
        else:
            self.driver.save_screenshot(save_path)
        
        return {
            'success': True,
            'action': 'browser_screenshot',
            'path': save_path
        }
    
    def close(self):
        if self.driver:
            self.driver.quit()
            self.driver = None
            self.frames = []
