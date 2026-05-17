
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, CreditCard, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { orderApi, addressApi } from '../api';
import { UserAddress } from '../types';

export default function OrderConfirm() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNo, setOrderNo] = useState('');

  const cart = useStore((state) => state.getCurrentCart());
  const cartTotal = useStore((state) => state.getCartTotal());
  const orderMode = useStore((state) => state.orderMode);
  const currentTable = useStore((state) => state.currentTable);
  const currentTenant = useStore((state) => state.currentTenant);
  const clearCart = useStore((state) => state.clearCart);
  const userPhone = useStore((state) => state.userPhone);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }

    if (orderMode === 'takeout') {
      const fetchAddresses = async () => {
        try {
          const data = await addressApi.getAll(userPhone);
          setAddresses(data);
          if (data.length > 0) {
            const defaultAddress = data.find((a) => a.is_default === 1) || data[0];
            setSelectedAddress(defaultAddress);
          }
        } catch (error) {
          console.error('Failed to fetch addresses:', error);
        }
      };
      fetchAddresses();
    }
  }, [cart.length, navigate, orderMode, userPhone]);

  const handleSubmitOrder = async () => {
    if (!currentTenant || cart.length === 0) return;

    if (orderMode === 'takeout' && !selectedAddress) {
      alert('请选择收货地址');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await orderApi.create(
        currentTenant.id,
        orderMode,
        orderMode === 'dine_in' ? currentTable?.id || null : null,
        orderMode === 'takeout' ? selectedAddress?.id || null : null,
        cart,
        cartTotal + (orderMode === 'takeout' ? currentTenant.delivery_fee : 0)
      );

      setOrderNo(result.order_no);
      setOrderSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('下单失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAddress = async () => {
    if (!currentTenant || !formData.receiver || !formData.phone || !formData.addressDetail) {
      alert('请填写完整地址信息');
      return;
    }

    try {
      await addressApi.create(
        currentTenant.id,
        userPhone,
        formData.receiver,
        formData.phone,
        formData.addressDetail,
        formData.isDefault
      );

      const data = await addressApi.getAll(userPhone);
      setAddresses(data);
      setShowAddressForm(false);
      setFormData({ receiver: '', phone: '', addressDetail: '', isDefault: false });
    } catch (error) {
      console.error('Failed to create address:', error);
      alert('添加地址失败');
    }
  };

  const [formData, setFormData] = useState({
    receiver: '',
    phone: '',
    addressDetail: '',
    isDefault: false,
  });

  const totalAmount = cartTotal + (orderMode === 'takeout' && currentTenant ? currentTenant.delivery_fee : 0);

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">下单成功</h2>
        <p className="text-gray-500 mb-4">订单号: {orderNo}</p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium"
          >
            继续点餐
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium"
          >
            查看订单
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-semibold text-lg">确认订单</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="pt-16 p-4">
        {orderMode === 'dine_in' && currentTable && (
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <MapPin size={20} className="text-orange-500" />
              </div>
              <div>
                <h3 className="font-medium">堂食</h3>
                <p className="text-sm text-gray-500">{currentTable.table_name}</p>
              </div>
            </div>
          </div>
        )}

        {orderMode === 'takeout' && (
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">收货地址</h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-orange-500 text-sm"
              >
                {showAddressForm ? '取消' : '添加地址'}
              </button>
            </div>

            {showAddressForm ? (
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
                <button
                  onClick={handleAddAddress}
                  className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium"
                >
                  保存地址
                </button>
              </div>
            ) : addresses.length === 0 ? (
              <button
                onClick={() => setShowAddressForm(true)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-sm"
              >
                请添加收货地址
              </button>
            ) : (
              <div className="space-y-2">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    onClick={() => setSelectedAddress(address)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedAddress?.id === address.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
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
                    <p className="text-sm text-gray-500 mt-1">{address.address_detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl p-4 mb-4">
          <h3 className="font-medium mb-3">订单商品</h3>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={`${item.product_id}-${item.spec_name}`} className="flex justify-between">
                <div>
                  <span className="text-sm">{item.name}</span>
                  <span className="text-gray-400 text-sm ml-2">x{item.quantity}</span>
                </div>
                <span className="text-sm">
                  ¥{((item.price + (item.price_extra || 0)) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">商品金额</span>
            <span>¥{cartTotal.toFixed(2)}</span>
          </div>
          {orderMode === 'takeout' && currentTenant && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">配送费</span>
              <span>¥{currentTenant.delivery_fee.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between">
            <span className="font-medium">合计</span>
            <span className="text-orange-500 font-bold text-lg">¥{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-sm">实付款:</span>
            <span className="text-orange-500 text-2xl font-bold ml-2">¥{totalAmount.toFixed(2)}</span>
          </div>
          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting || (orderMode === 'takeout' && !selectedAddress)}
            className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ${
              isSubmitting || (orderMode === 'takeout' && !selectedAddress)
                ? 'bg-gray-300 text-gray-500'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            <CreditCard size={18} />
            {isSubmitting ? '提交中...' : '提交订单'}
          </button>
        </div>
      </footer>
    </div>
  );
}
