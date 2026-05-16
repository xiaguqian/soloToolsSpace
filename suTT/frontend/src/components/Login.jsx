
import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    email: '',
    code: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let response;
      if (isRegister) {
        response = await axios.post('http://localhost:8080/api/auth/register', formData);
      } else {
        response = await axios.post('http://localhost:8080/api/auth/login', {
          account: formData.username,
          password: formData.password
        });
      }
      
      if (response.data.code === 200) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        onLogin(response.data.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || '操作失败');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isRegister ? '注册' : '登录'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{isRegister ? '用户名' : '账号'}</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={isRegister ? '请输入用户名' : '请输入账号/手机号/邮箱'}
              required
            />
          </div>
          
          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码"
              required
            />
          </div>
          
          {isRegister && (
            <>
              <div className="form-group">
                <label>手机号（可选）</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="请输入手机号"
                />
              </div>
              <div className="form-group">
                <label>邮箱（可选）</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="请输入邮箱"
                />
              </div>
            </>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="btn btn-primary">
            {isRegister ? '注册' : '登录'}
          </button>
        </form>
        
        <div className="toggle-link">
          <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); }}>
            {isRegister ? '已有账号？立即登录' : '没有账号？立即注册'}
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
