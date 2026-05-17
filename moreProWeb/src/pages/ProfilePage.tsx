import { ChevronRight, MapPin, Phone, Package, MessageCircle, Settings, LogOut, Edit, User } from 'lucide-react';
import { useStore } from '../store';

interface ProfilePageProps {
  onLogin: () => void;
  onViewOrders: () => void;
  onViewAddress: () => void;
}

export function ProfilePage({ onLogin, onViewOrders, onViewAddress }: ProfilePageProps) {
  const { user, logout, tenant } = useStore();

  const config = tenant?.configJson ? JSON.parse(tenant.configJson) : {};

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
    }
  };

  const menuItems = [
    { icon: Package, label: '我的订单', onClick: onViewOrders },
    { icon: MapPin, label: '收货地址', onClick: onViewAddress },
    { icon: Phone, label: '手机号绑定', onClick: () => alert('手机号: ' + user?.phone) },
    { icon: MessageCircle, label: '联系客服', onClick: () => alert(`客服电话: ${config.contact_phone || '暂无'}`) },
    { icon: Settings, label: '设置', onClick: () => alert('设置功能开发中') },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-12">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <User size={40} className="text-white" />
            </div>
            <button
              onClick={onLogin}
              className="px-8 py-2 bg-white text-orange-500 rounded-full font-medium"
            >
              登录/注册
            </button>
          </div>
        </div>
        <div className="px-4 py-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full px-4 py-4 flex items-center gap-3 border-b border-gray-100 last:border-0 active:bg-gray-50 transition-colors"
                >
                  <Icon size={20} className="text-gray-500" />
                  <span className="flex-1 text-left text-gray-800">{item.label}</span>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">{user.nickname}</h2>
            <p className="text-white/80 text-sm">{user.phone}</p>
          </div>
          <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Edit size={16} className="text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full px-4 py-4 flex items-center gap-3 border-b border-gray-100 last:border-0 active:bg-gray-50 transition-colors"
              >
                <Icon size={20} className="text-gray-500" />
                <span className="flex-1 text-left text-gray-800">{item.label}</span>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-4 flex items-center gap-3 active:bg-gray-50 transition-colors"
          >
            <LogOut size={20} className="text-red-500" />
            <span className="flex-1 text-left text-red-500">退出登录</span>
          </button>
        </div>
      </div>
    </div>
  );
}