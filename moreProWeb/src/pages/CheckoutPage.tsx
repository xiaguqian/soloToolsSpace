import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, ChevronRight, CheckCircle } from 'lucide-react';
import { useStore } from '../store';
import { formatPrice } from '../utils';
import { createOrder } from '../api';

interface CheckoutPageProps {
  onBack: () => void;
  onSuccess: (orderNo: string) => void;
}

export function CheckoutPage({ onBack, onSuccess }: CheckoutPageProps) {
  const { cart, user, tenant, selectedAddress, setSelectedAddress, clearCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    if (user && !selectedAddress && user.addressList.length > 0) {
      const defaultAddress = user.addressList.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else {
        setSelectedAddress(user.addressList[0]);
      }
    }
  }, [user, selectedAddress, setSelectedAddress]);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const config = tenant?.configJson ? JSON.parse(tenant.configJson) : { delivery_fee: 5, free_delivery_threshold: 30 };
  const deliveryFee = totalAmount >= config.free_delivery_threshold ? 0 : config.delivery_fee;
  const finalAmount = totalAmount + deliveryFee;

  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert('请选择收货地址');
      return;
    }
    if (!user) {
      alert('请先登录');
      return;
    }

    setLoading(true);
    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const order = await createOrder(tenant!.id, user.id, items, finalAmount, selectedAddress);
      clearCart();
      onSuccess(order.order_no);
    } catch (error) {
      alert('下单失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-800 ml-2">确认订单</h1>
        </div>
      </div>

      <div className="px-4 py-8">
        <button
          onClick={() => setShowAddressModal(true)}
          className="bg-white rounded-xl p-4 flex items-start gap-3 shadow-sm"
        >
          <MapPin size={24} className="text-orange-500 mt-0.5" />
          <div className="flex-1 text-left">
            {selectedAddress ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800">{selectedAddress.name}</span>
                  <span className="text-gray-400 text-sm">{selectedAddress.phone}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {selectedAddress.province} {selectedAddress.city} {selectedAddress.district} {selectedAddress.detail}
                </p>
              </>
            ) : (
              <span className="text-gray-400">请选择收货地址</span>
            )}
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        <div className="bg-white rounded-xl mt-3 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="font-medium text-gray-800">商品清单</span>
          </div>
          <div className="p-4 space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-800 truncate">{item.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-orange-500 font-medium">¥{formatPrice(item.price)}</span>
                    <span className="text-gray-400 text-sm">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl mt-3 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500">商品金额</span>
            <span className="text-gray-800">¥{formatPrice(totalAmount)}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500">配送费</span>
            <span className="text-gray-800">
              {deliveryFee === 0 ? '免配送费' : `¥${formatPrice(deliveryFee)}`}
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="font-medium text-gray-800">实付金额</span>
            <span className="text-xl font-bold text-orange-500">¥{formatPrice(finalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-sm">实付:</span>
            <span className="text-xl font-bold text-orange-500 ml-2">¥{formatPrice(finalAmount)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-8 py-3 bg-orange-500 text-white rounded-xl font-medium disabled:bg-gray-300 active:bg-orange-600 transition-colors"
          >
            {loading ? '提交中...' : '提交订单'}
          </button>
        </div>
      </div>

      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[70vh] overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-medium text-gray-800">选择收货地址</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-gray-400">
                关闭
              </button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(70vh-60px)]">
              {user?.addressList.map((address) => (
                <button
                  key={address.id}
                  onClick={() => {
                    setSelectedAddress(address);
                    setShowAddressModal(false);
                  }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedAddress?.id === address.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{address.name}</span>
                      <span className="text-gray-400 text-sm">{address.phone}</span>
                    </div>
                    {selectedAddress?.id === address.id && (
                      <CheckCircle size={18} className="text-orange-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {address.province} {address.city} {address.district} {address.detail}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}