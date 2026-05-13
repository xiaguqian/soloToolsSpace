import React, { useState, useEffect } from 'react';
import './PaymentDialog.css';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  message?: string;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ isOpen, onClose, message }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const plans = [
    {
      name: '月度订阅',
      price: '¥29',
      period: '/月',
      features: [
        '无限 AI 调用次数',
        '高级导出功能',
        '优先客服支持',
        '未来所有付费功能'
      ]
    },
    {
      name: '年度订阅',
      price: '¥199',
      period: '/年',
      popular: true,
      features: [
        '所有月度功能',
        '节省 ¥149',
        '专属 AI 模型',
        '高级主题定制'
      ]
    },
    {
      name: '终身版',
      price: '¥499',
      period: '',
      features: [
        '所有年度功能',
        '终身免费更新',
        '优先 beta 体验',
        '专属功能投票权'
      ]
    }
  ];

  const handleSubscribe = async (plan: typeof plans[0]) => {
    try {
      alert(`即将跳转到支付页面: ${plan.name} - ${plan.price}${plan.period}`);
      handleClose();
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`payment-dialog-overlay ${isVisible ? 'visible' : ''}`} onClick={handleClose}>
      <div className="payment-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>💎 升级到 Pro</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        {message && (
          <div className="dialog-message">
            <p>{message}</p>
          </div>
        )}

        <div className="plans-container">
          {plans.map((plan, index) => (
            <div key={index} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && (
                <div className="popular-badge">最受欢迎</div>
              )}
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="plan-price">
                  <span className="price">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>
              </div>
              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
              <button 
                className={`subscribe-btn ${plan.popular ? 'primary' : ''}`}
                onClick={() => handleSubscribe(plan)}
              >
                立即订阅
              </button>
            </div>
          ))}
        </div>

        <div className="dialog-footer">
          <p>🔒 安全支付 · 随时取消 · 7天无理由退款</p>
          <button className="later-btn" onClick={handleClose}>
            稍后再说
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDialog;
