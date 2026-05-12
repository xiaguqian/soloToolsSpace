import React from 'react';

const TitleBar = () => {
  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.window.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.window.maximize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.window.close();
    }
  };

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <div className="app-logo"></div>
        <span className="app-title">SoloIM</span>
      </div>
      <div className="title-bar-right">
        <button className="title-btn" onClick={handleMinimize} title="最小化">
          ─
        </button>
        <button className="title-btn" onClick={handleMaximize} title="最大化">
          ▢
        </button>
        <button className="title-btn close" onClick={handleClose} title="关闭">
          ✕
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
