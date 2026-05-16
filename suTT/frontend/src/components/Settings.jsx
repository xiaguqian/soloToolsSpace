
import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

function Settings() {
  const [autoStart, setAutoStart] = useState(false);
  const [trayEnabled, setTrayEnabled] = useState(true);

  useEffect(() => {
    ipcRenderer.send('get-settings');
    ipcRenderer.on('settings', (event, settings) => {
      setAutoStart(settings.autoStart);
      setTrayEnabled(settings.trayEnabled);
    });
  }, []);

  const handleAutoStartChange = (e) => {
    const value = e.target.checked;
    setAutoStart(value);
    ipcRenderer.send('set-auto-start', value);
  };

  const handleTrayEnabledChange = (e) => {
    const value = e.target.checked;
    setTrayEnabled(value);
    ipcRenderer.send('set-tray-enabled', value);
  };

  const handleNewWindow = () => {
    ipcRenderer.send('create-new-window');
  };

  return (
    <div className="settings-container">
      <div className="settings-section">
        <h3>通用设置</h3>
        
        <div className="setting-item">
          <span className="setting-label">开机自启</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={autoStart} onChange={handleAutoStartChange} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <span className="setting-label">托盘常驻</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={trayEnabled} onChange={handleTrayEnabledChange} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <span className="setting-label">新建窗口</span>
          <button className="btn btn-secondary" onClick={handleNewWindow} style={{ width: 'auto', padding: '8px 16px' }}>
            打开新窗口
          </button>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>关于</h3>
        <div style={{ fontSize: 14, color: '#666' }}>
          <p>IM Client v1.0.0</p>
          <p style={{ marginTop: 5 }}>即时通讯客户端</p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
