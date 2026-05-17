import { useState } from 'react';
import { ArrowLeft, MapPin, Phone } from 'lucide-react';
import { Order } from '../api';
import { formatPrice, formatDate, getOrderStatusText } from '../utils';
import { cancelOrder, payOrder } from '../api';

interface OrderDetailPageProps {
  order: Order;
  onBack: () => void;
  onRefresh: () => void;
}

export function OrderDetailPage({ order, onBack, onRefresh }: OrderDetailPageProps) {
  const [loading, setLoading] = useState(false);
  const items = JSON.parse(order.items || '[]');
  const address = JSON.parse(order.address || '{}');

  const handleCancel = async () => {
    if (!confirm('确定要取消订单吗？')) return;
    setLoading(true);
    try {
      await cancelOrder(order.id);
      alert('订单已取消');
      onRefresh();
    } catch (error) {
      alert('取消失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      await payOrder(order.id);
      alert('支付成功');
      onRefresh();
    } catch (error) {
      alert('支付失败');
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
          <h1 className="text-lg font-medium text-gray-800 ml-2">订单详情</h1>
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">订单号: {order.order_no}</span>
            <span className={`text-sm font-medium ${
              order.status === 'pending' ? 'text-orange-500' :
              order.status === 'paid' ? 'text-green-500' : 'text-gray-400'
            }`}>
              {getOrderStatusText(order.status)}
            </span>
          </div>
          <div className="text-sm text-gray-400">下单时间: {formatDate(order.created_at)}</div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
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
        </div>

        <div className="bg-white rounded-xl mb-3 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="font-medium text-gray-800">商品清单</span>
          </div>
          <div className="p-4 space-y-3">
            {items.map((item: any, index: number) => (
              <div key={index} className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-orange-500">¥{formatPrice(item.price)}</span>
                    <span className="text-gray-400 text-sm">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500">商品金额</span>
            <span className="text-gray-800">¥{formatPrice(order.total_amount)}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="font-medium text-gray-800">实付金额</span>
            <span className="text-xl font-bold text-orange-500">¥{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 flex gap-3">
        {order.status === 'pending' && (
          <>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium disabled:opacity-50"
            >
              取消订单
            </button>
            <button
              onClick={handlePay}
              disabled={loading}
              className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium disabled:opacity-50"
            >
              立即支付
            </button>
          </>
        )}
        {order.status === 'paid' && (
          <button
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
          >
            联系商家
          </button>
        )}
        {order.status === 'cancelled' && (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            订单已取消
          </div>
        )}
      </div>
    </div>
  );
}