import { useState } from 'react';
import { Phone, ArrowLeft } from 'lucide-react';
import { loginEndUser } from '../api';
import { useStore } from '../store';

interface LoginPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function LoginPage({ onSuccess, onBack }: LoginPageProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { tenant, setUser } = useStore();

  const handleSubmit = async () => {
    if (!phone || phone.length !== 11) {
      alert('请输入正确的手机号');
      return;
    }
    setLoading(true);
    try {
      const user = await loginEndUser(tenant!.id, phone);
      setUser({
        id: user.id,
        tenantId: user.tenant_id,
        phone: user.phone,
        nickname: user.nickname,
        addressList: user.address_list ? JSON.parse(user.address_list) : [],
      });
      onSuccess();
    } catch (error) {
      alert('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="px-4 py-4 flex items-center">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-800 ml-2">手机号登录</h1>
        </div>
      </div>
      <div className="px-4 py-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="relative mb-6">
            <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="请输入手机号"
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !phone || phone.length !== 11}
            className="w-full py-4 bg-orange-500 text-white rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed active:bg-orange-600 transition-colors"
          >
            {loading ? '登录中...' : '获取验证码登录'}
          </button>
          <p className="text-center text-gray-400 text-xs mt-4">
            登录即表示同意《用户协议》和《隐私政策》
          </p>
        </div>
      </div>
    </div>
  );
}