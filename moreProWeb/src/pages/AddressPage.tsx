import { useState } from 'react';
import { ArrowLeft, Plus, MapPin, Trash2, Edit2, CheckCircle } from 'lucide-react';
import { useStore } from '../store';
import { Address } from '../store';

interface AddressPageProps {
  onBack: () => void;
}

export function AddressPage({ onBack }: AddressPageProps) {
  const { user, addAddress, updateAddress, removeAddress } = useStore();
  const [showFormModal, setShowFormModal] = useState(false);
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

  const handleOpenFormModal = (address?: Address) => {
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
    setShowFormModal(true);
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
    setShowFormModal(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (id: number) => {
    if (confirm('确定要删除这个地址吗？')) {
      removeAddress(id);
    }
  };

  const handleSetDefault = (address: Address) => {
    updateAddress({ ...address, isDefault: true });
    user?.addressList.forEach((addr) => {
      if (addr.id !== address.id && addr.isDefault) {
        updateAddress({ ...addr, isDefault: false });
      }
    });
  };

  const addresses = user?.addressList || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-800 ml-2">收货地址</h1>
        </div>
      </div>

      <div className="px-4 py-12">
        {addresses.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <MapPin size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 mb-4">暂无收货地址</p>
            <button
              onClick={() => handleOpenFormModal()}
              className="px-8 py-2.5 bg-orange-500 text-white rounded-xl font-medium"
            >
              添加收货地址
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-white rounded-xl p-4 shadow-sm relative"
              >
                {address.isDefault && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                      默认
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">{address.name}</span>
                      <span className="text-gray-400 text-sm">{address.phone}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {address.province} {address.city} {address.district} {address.detail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address)}
                      className="flex items-center gap-1 text-sm text-orange-500"
                    >
                      <CheckCircle size={16} />
                      设为默认
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenFormModal(address)}
                    className="flex items-center gap-1 text-sm text-gray-500"
                  >
                    <Edit2 size={16} />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="flex items-center gap-1 text-sm text-red-500"
                  >
                    <Trash2 size={16} />
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={() => handleOpenFormModal()}
          className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 active:bg-orange-600 transition-colors"
        >
          <Plus size={20} />
          {addresses.length === 0 ? '添加收货地址' : '新增收货地址'}
        </button>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-hidden animate-slide-up">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-medium text-gray-800">{editingAddress ? '编辑地址' : '添加收货地址'}</h3>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 text-sm">
                关闭
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-60px)]">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">收货人</label>
                <input
                  type="text"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  placeholder="请输入收货人姓名"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">手机号</label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                  placeholder="请输入手机号"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">省市区</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addressForm.province}
                    onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                    placeholder="省"
                    className="flex-1 px-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm transition-all"
                  />
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="市"
                    className="flex-1 px-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm transition-all"
                  />
                  <input
                    type="text"
                    value={addressForm.district}
                    onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                    placeholder="区"
                    className="flex-1 px-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">详细地址</label>
                <textarea
                  value={addressForm.detail}
                  onChange={(e) => setAddressForm({ ...addressForm, detail: e.target.value })}
                  placeholder="请输入详细地址"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none transition-all"
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">设为默认地址</span>
                <button
                  onClick={() => setAddressForm({ ...addressForm, isDefault: !addressForm.isDefault })}
                  className={`relative w-12 h-7 rounded-full transition-colors ${addressForm.isDefault ? 'bg-orange-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${addressForm.isDefault ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <button
                onClick={handleSaveAddress}
                className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-medium active:bg-orange-600 transition-colors"
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