import { useState } from 'react';
import { ChevronRight, MapPin, Phone, Package, MessageCircle, Settings, LogOut, Edit, User } from 'lucide-react';
import { useStore } from '../store';
import { Address } from '../store';

interface ProfilePageProps {
  onLogin: () => void;
  onViewOrders: () => void;
}

export function ProfilePage({ onLogin, onViewOrders }: ProfilePageProps) {
  const { user, addAddress, updateAddress, removeAddress, logout, tenant } = useStore();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false,
  });

  const config = tenant?.configJson ? JSON.parse(tenant.configJson) : {};

  const handleOpenAddressModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        name: address.name,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        detail: address.detail,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        isDefault: false,
      });
    }
    setShowAddressModal(true);
  };

  const handleSaveAddress = () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.detail) {
      alert('请填写完整信息');
      return;
    }
    if (editingAddress) {
      updateAddress({ ...addressForm, id: editingAddress.id });
    } else {
      addAddress(addressForm);
    }
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (id: number) => {
    if (confirm('确定要删除这个地址吗？')) {
      removeAddress(id);
    }
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
    }
  };

  const menuItems = [
    { icon: Package, label: '我的订单', onClick: onViewOrders },
    { icon: MapPin, label: '收货地址', onClick: () => setShowAddressModal(true) },
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

      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-medium text-gray-800">{editingAddress ? '编辑地址' : '添加收货地址'}</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-gray-400">
                关闭
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(80vh-60px)]">
              <div>
                <label className="block text-sm text-gray-600 mb-1">收货人</label>
                <input
                  type="text"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  placeholder="请输入收货人姓名"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">手机号</label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                  placeholder="请输入手机号"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">省市区</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addressForm.province}
                    onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                    placeholder="省"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                  />
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="市"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                  />
                  <input
                    type="text"
                    value={addressForm.district}
                    onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                    placeholder="区"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">详细地址</label>
                <textarea
                  value={addressForm.detail}
                  onChange={(e) => setAddressForm({ ...addressForm, detail: e.target.value })}
                  placeholder="请输入详细地址"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 resize-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">设为默认地址</span>
                <button
                  onClick={() => setAddressForm({ ...addressForm, isDefault: !addressForm.isDefault })}
                  className={`w-10 h-6 rounded-full transition-colors ${addressForm.isDefault ? 'bg-orange-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${addressForm.isDefault ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <button
                onClick={handleSaveAddress}
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium active:bg-orange-600 transition-colors"
              >
                {editingAddress ? '保存修改' : '添加地址'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}