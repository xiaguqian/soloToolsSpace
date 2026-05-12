import React, { useState } from 'react';
import { authApi } from '../services/api';
import useStore from '../store/useStore';

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [toast, setToast] = useState(null);
  
  const [loginData, setLoginData] = useState({ account: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '', password: '', confirmPassword: '',
    phone: '', email: '', code: ''
  });
  const [resetData, setResetData] = useState({
    phone: '', email: '', newPassword: '', confirmPassword: '', code: ''
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [autoLogin, setAutoLogin] = useState(false);
  
  const login = useStore(state => state.login);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startCountdown = () => {
    setCodeCountdown(60);
    const timer = setInterval(() => {
      setCodeCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendCode = async (phone, email) => {
    if (codeCountdown > 0) return;
    try {
      await authApi.sendCode({ phone, email });
      startCountdown();
      showToast('验证码已发送', 'success');
    } catch (e) {
      showToast(e.message || '发送失败', 'error');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.account || !loginData.password) {
      showToast('请填写账号和密码', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.login(loginData);
      login(data);
      if (rememberMe) {
        localStorage.setItem('savedAccount', loginData.account);
      }
      showToast('登录成功', 'success');
    } catch (e) {
      showToast(e.message || '登录失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      showToast('两次密码不一致', 'error');
      return;
    }
    if (!registerData.username || !registerData.password || !registerData.code) {
      showToast('请填写完整信息', 'error');
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        username: registerData.username,
        password: registerData.password,
        phone: registerData.phone || null,
        email: registerData.email || null,
        code: registerData.code
      });
      showToast('注册成功，请登录', 'success');
      setMode('login');
    } catch (e) {
      showToast(e.message || '注册失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (resetData.newPassword !== resetData.confirmPassword) {
      showToast('两次密码不一致', 'error');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({
        phone: resetData.phone || null,
        email: resetData.email || null,
        newPassword: resetData.newPassword,
        code: resetData.code
      });
      showToast('密码重置成功', 'success');
      setMode('login');
    } catch (e) {
      showToast(e.message || '重置失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💬</div>
          <div className="auth-title">SoloIM</div>
          <div className="auth-subtitle">跨平台即时通讯</div>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            登录
          </button>
          <button 
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            注册
          </button>
          {mode === 'reset' && (
            <button className={`auth-tab active`}>找回密码</button>
          )}
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">账号</label>
              <input
                type="text"
                className="form-input"
                placeholder="用户名/手机号/邮箱"
                value={loginData.account}
                onChange={e => setLoginData({ ...loginData, account: e.target.value })}
                defaultValue={localStorage.getItem('savedAccount') || ''}
              />
            </div>
            <div className="form-group">
              <label className="form-label">密码</label>
              <input
                type="password"
                className="form-input"
                placeholder="请输入密码"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            <div className="auth-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                记住密码
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={autoLogin}
                  onChange={e => setAutoLogin(e.target.checked)}
                />
                自动登录
              </label>
              <span className="forgot-link" onClick={() => setMode('reset')}>
                忘记密码?
              </span>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">用户名</label>
              <input
                type="text"
                className="form-input"
                placeholder="请输入用户名"
                value={registerData.username}
                onChange={e => setRegisterData({ ...registerData, username: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">密码</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="请输入密码"
                  value={registerData.password}
                  onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">确认密码</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="请确认密码"
                  value={registerData.confirmPassword}
                  onChange={e => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">手机号</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="选填"
                  value={registerData.phone}
                  onChange={e => setRegisterData({ ...registerData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">邮箱</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="选填"
                  value={registerData.email}
                  onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">验证码</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="请输入验证码"
                  value={registerData.code}
                  onChange={e => setRegisterData({ ...registerData, code: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">&nbsp;</label>
                <button
                  type="button"
                  className="code-btn"
                  disabled={codeCountdown > 0 || (!registerData.phone && !registerData.email)}
                  onClick={() => sendCode(registerData.phone, registerData.email)}
                >
                  {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                </button>
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '注册中...' : '注册'}
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleReset}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">手机号</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="手机号"
                  value={resetData.phone}
                  onChange={e => setResetData({ ...resetData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">或邮箱</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="邮箱"
                  value={resetData.email}
                  onChange={e => setResetData({ ...resetData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">验证码</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="请输入验证码"
                  value={resetData.code}
                  onChange={e => setResetData({ ...resetData, code: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">&nbsp;</label>
                <button
                  type="button"
                  className="code-btn"
                  disabled={codeCountdown > 0 || (!resetData.phone && !resetData.email)}
                  onClick={() => sendCode(resetData.phone, resetData.email)}
                >
                  {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                </button>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">新密码</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="请输入新密码"
                  value={resetData.newPassword}
                  onChange={e => setResetData({ ...resetData, newPassword: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">确认密码</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="请确认新密码"
                  value={resetData.confirmPassword}
                  onChange={e => setResetData({ ...resetData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '提交中...' : '重置密码'}
            </button>
          </form>
        )}

        <div className="auth-switch">
          {mode === 'login' ? (
            <>没有账号? <span onClick={() => setMode('register')}>立即注册</span></>
          ) : (
            <>已有账号? <span onClick={() => setMode('login')}>立即登录</span></>
          )}
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AuthPage;
