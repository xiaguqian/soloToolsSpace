
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, ClipboardList, Phone, Settings, ChevronRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';
import { tenantApi } from '../api';
import { Tenant } from '../types';

export default function Profile() {
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);

  const currentTenant = useStore((state) => state.currentTenant);
  const userPhone = useStore((state) => state.userPhone);

  useEffect(() => {
    if (currentTenant) {
      setTenant(currentTenant);
    } else {
      const fetchDefaultTenant = async () => {
        try {
          const tenants = await tenantApi.getAll();
          if (tenants.length > 0) {
            setTenant(tenants[0]);
          }
        } catch (error) {
          console.error('Failed to fetch tenant:', error);
        }
      };
      fetchDefaultTenant();
    }
  }, [currentTenant]);

  const handleCall = () => {
    if (tenant?.tel) {
      window.location.href = `tel:${tenant.tel}`;
    }
  };

  const menuItems = [
    { icon: ClipboardList, label: '我的订单', path: '/orders' },
    { icon: MapPin, label: '收货地址', path: '/profile/addresses' },
    { icon: Phone, label: '联系商家', action: handleCall, highlight: true },
    { icon: Settings, label: '设置', path: '/profile/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold">我的账户</h2>
            <p className="text-orange-100 text-sm mt-1">{userPhone}</p>
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="bg-white rounded-xl p-4 mb-4">
          <h3 className="font-medium mb-4">订单统计</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-orange-500">0</div>
              <div className="text-xs text-gray-500 mt-1">待支付</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-500">0</div>
              <div className="text-xs text-gray-500 mt-1">待接单</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-500">0</div>
              <div className="text-xs text-gray-500 mt-1">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-400">0</div>
              <div className="text-xs text-gray-500 mt-1">已取消</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
              className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                item.highlight ? 'bg-orange-100' : 'bg-gray-100'
              }`}>
                <item.icon size={20} className={item.highlight ? 'text-orange-500' : 'text-gray-500'} />
              </div>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          ))}
        </div>

        {tenant && (
          <div className="mt-4 bg-white rounded-xl p-4">
            <h3 className="font-medium mb-3">当前商户</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <ShoppingBag size={24} className="text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{tenant.name}</p>
                <p className="text-sm text-gray-500">{tenant.business_hours}</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium"
              >
                切换商户
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
