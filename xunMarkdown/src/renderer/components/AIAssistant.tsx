import React, { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { aiSettingsState, tabsState, activeTabIdState } from '../state/atoms';
import './AIAssistant.css';

interface AIAssistantProps {
  onClose: () => void;
}

type AIAction = 'continue' | 'polish' | 'translate' | 'summarize' | 'proofread';

const AI_ACTIONS: Array<{ id: AIAction; label: string; description: string }> = [
  { id: 'continue', label: '✍️ 续写', description: '基于当前内容继续创作' },
  { id: 'polish', label: '✨ 润色', description: '优化表达和措辞' },
  { id: 'translate', label: '🌐 翻译', description: '翻译选中内容' },
  { id: 'summarize', label: '📝 总结', description: '提炼文章要点' },
  { id: 'proofread', label: '🔍 校对', description: '检查语法和拼写错误' }
];

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose }) => {
  const [aiSettings, setAISettings] = useRecoilState(aiSettingsState);
  const tabs = useRecoilValue(tabsState);
  const activeTabId = useRecoilValue(activeTabIdState);
  const [selectedAction, setSelectedAction] = useState<AIAction | null>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const activeTab = tabs.find(t => t.id === activeTabId);

  const callAI = async () => {
    if (!aiSettings.enabled || !aiSettings.apiKey) {
      setResponse('请先配置AI接口设置');
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      const apiUrl = aiSettings.baseUrl || 'https://api.openai.com/v1/chat/completions';
      
      const systemPrompts: Record<AIAction, string> = {
        continue: '请基于以下内容继续续写，保持风格一致：',
        polish: '请润色以下文本，使其更加流畅自然：',
        translate: '请将以下文本翻译成中文：',
        summarize: '请总结以下文本的主要内容：',
        proofread: '请校对以下文本，指出并修正错误：'
      };

      const userPrompt = prompt || activeTab?.content || '';
      const systemPrompt = selectedAction ? systemPrompts[selectedAction] : '';

      const requestBody = {
        model: aiSettings.model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiSettings.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.requires_payment || response.status === 402) {
          showPaymentDialog();
          setResponse('此功能需要付费订阅');
          return;
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || '无响应';
      setResponse(aiResponse);
    } catch (error) {
      console.error('AI Error:', error);
      setResponse(`错误: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const showPaymentDialog = () => {
    const event = new CustomEvent('show-payment-dialog', {
      detail: {
        feature: selectedAction,
        message: 'AI 高级功能需要订阅'
      }
    });
    window.dispatchEvent(event);
  };

  const insertResponse = () => {
    if (response && activeTab) {
      const insertText = `\n\n--- AI 建议 ---\n${response}\n\n`;
      const event = new CustomEvent('insert-text', {
        detail: { text: insertText }
      });
      window.dispatchEvent(event);
    }
  };

  if (showSettings) {
    return (
      <div className="ai-panel settings-panel">
        <div className="panel-header">
          <span>⚙️ AI 设置</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="settings-content">
          <div className="setting-item">
            <label>启用 AI 助手</label>
            <input 
              type="checkbox" 
              checked={aiSettings.enabled}
              onChange={(e) => setAISettings({ ...aiSettings, enabled: e.target.checked })}
            />
          </div>
          <div className="setting-item">
            <label>API 提供商</label>
            <select 
              value={aiSettings.provider}
              onChange={(e) => setAISettings({ ...aiSettings, provider: e.target.value as any })}
            >
              <option value="openai">OpenAI</option>
              <option value="custom">自定义</option>
              <option value="self-hosted">自部署</option>
            </select>
          </div>
          <div className="setting-item">
            <label>API Key</label>
            <input 
              type="password" 
              value={aiSettings.apiKey}
              onChange={(e) => setAISettings({ ...aiSettings, apiKey: e.target.value })}
              placeholder="sk-..."
            />
          </div>
          <div className="setting-item">
            <label>API Base URL</label>
            <input 
              type="text" 
              value={aiSettings.baseUrl}
              onChange={(e) => setAISettings({ ...aiSettings, baseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1/chat/completions"
            />
          </div>
          <div className="setting-item">
            <label>模型</label>
            <input 
              type="text" 
              value={aiSettings.model}
              onChange={(e) => setAISettings({ ...aiSettings, model: e.target.value })}
              placeholder="gpt-3.5-turbo"
            />
          </div>
          <button 
            className="back-btn"
            onClick={() => setShowSettings(false)}
          >
            ← 返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-panel">
      <div className="panel-header">
        <span>🤖 AI 助手</span>
        <div className="header-actions">
          <button className="settings-btn" onClick={() => setShowSettings(true)} title="设置">
            ⚙️
          </button>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="ai-content">
        <div className="action-buttons">
          {AI_ACTIONS.map(action => (
            <button
              key={action.id}
              className={`action-btn ${selectedAction === action.id ? 'active' : ''}`}
              onClick={() => setSelectedAction(action.id)}
              title={action.description}
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="prompt-area">
          <label>输入内容（留空使用当前文档）:</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入或粘贴要处理的文本..."
            rows={4}
          />
        </div>

        <button 
          className="generate-btn"
          onClick={callAI}
          disabled={isLoading}
        >
          {isLoading ? '思考中...' : '🚀 开始生成'}
        </button>

        {response && (
          <div className="response-area">
            <div className="response-header">
              <span>AI 回应</span>
              <button className="insert-btn" onClick={insertResponse}>
                📋 插入到文档
              </button>
            </div>
            <div className="response-content">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
