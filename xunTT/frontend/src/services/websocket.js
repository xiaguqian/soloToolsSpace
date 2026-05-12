import { API_BASE } from './api';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.connected = false;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 3000;
  }

  connect(token) {
    const wsUrl = API_BASE.replace('http://', 'ws://') + `/ws/chat?token=${token}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit('message', data);
        } catch (e) {
          console.error('解析 WebSocket 消息失败', e);
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.stopHeartbeat();
        this.emit('disconnected');
        this.reconnect(token);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket 错误', error);
        this.emit('error', error);
      };
    } catch (e) {
      console.error('连接 WebSocket 失败', e);
      this.reconnect(token);
    }
  }

  reconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(token);
      }, this.reconnectDelay);
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  sendMessage(data) {
    return this.send({
      type: 'message',
      data: data
    });
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
    }
    this.ws = null;
    this.connected = false;
  }
}

export default new WebSocketService();
