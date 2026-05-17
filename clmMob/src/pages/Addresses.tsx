
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Trash2, Edit2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { addressApi, tenantApi } from '../api';
import { UserAddress } from '../types';

export default function Addresses() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [loading, setLoading] = useState(true);

  const userPhone = useStore((state) => state.userPhone);
  const currentTenant = useStore((state) => state.currentTenant);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await addressApi.getAll(userPhone);
        setAddresses(data);
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [userPhone]);

  const handleSave = async () => {
    if (!currentTenant || !formData.receiver || !formData.phone || !formData.addressDetail) {
      alert('请填写完整地址信息');
      return;
    }

    try {
      if (editingAddress) {
        await addressApi.update(
          editingAddress.id,
          formData.receiver,
          formData.phone,
          formData.addressDetail,
          formData.isDefault
        );
      } else {
        await addressApi.create(
          currentTenant.id,
          userPhone,
          formData.receiver,
          formData.phone,
          formData.addressDetail,
          formData.isDefault
        );
      }

      const data = await addressApi.getAll(userPhone);
      setAddresses(data);
      setShowForm(false);
      setEditingAddress(null);
      setFormData({ receiver: '', phone: '', addressDetail: '', isDefault: false });
    } catch (error) {
      console.error('Failed to save address:', error);
      alert('保存失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该地址吗？')) return;
    try {
      await addressApi.delete(id);
      const data = await addressApi.getAll(userPhone);
      setAddresses(data);
    } catch (error) {
      console.error('Failed to delete address:', error);
      alert('删除失败');
    }
  };

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setFormData({
      receiver: address.receiver,
      phone: address.phone,
      addressDetail: address.address_detail,
      isDefault: address.is_default === 1,
    });
    setShowForm(true);
  };

  const [formData, setFormData] = useState({
    receiver: '',
    phone: '',
    addressDetail: '',
    isDefault: false,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-semibold text-lg">收货地址</h1>
          <button
            onClick={() => setShowForm(true)}
            className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="font-semibold text-lg mb-4">
              {editingAddress ? '编辑地址' : '添加地址'}
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="收货人"
                value={formData.receiver}
                onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm"
              />
              <input
                type="tel"
                placeholder="联系电话"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm"
              />
              <textarea
                placeholder="详细地址"
                value={formData.addressDetail}
                onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
                className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm h-20"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
                默认地址
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAddress(null);
                  setFormData({ receiver: '', phone: '', addressDetail: '', isDefault: false });
                }}
                className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pt-16 p-4">
        {addresses.length === 0 ? (
          <div className="text-center py-20">
            <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">暂无收货地址</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-medium"
            >
              添加地址
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{address.receiver}</span>
                    <span className="text-gray-400 text-sm">{address.phone}</span>
                  </div>
                  {address.is_default === 1 && (
                    <span className="text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded">
                      默认
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-3">{address.address_detail}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Edit2 size={14} />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="flex-1 py-2 bg-red-50 text-red-500 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Trash2 size={14} />
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
