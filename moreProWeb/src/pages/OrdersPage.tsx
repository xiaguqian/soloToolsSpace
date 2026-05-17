import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { getOrdersByUser, Order } from '../api';
import { formatPrice, formatDate, getOrderStatusText } from '../utils';

interface OrdersPageProps {
  onBack: () => void;
  onOrderDetail: (order: Order) => void;
}

export function OrdersPage({ onBack, onOrderDetail }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useStore();

  useEffect(() => {
    if (!user) return;
    getOrdersByUser(user.id).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-800 ml-2">我的订单</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">暂无订单</p>
          </div>
        ) : (
          orders.map((order) => {
            const items = JSON.parse(order.items || '[]');
            return (
              <div
                key={order.id}
                onClick={() => onOrderDetail(order)}
                className="bg-white rounded-xl shadow-sm overflow-hidden active:bg-gray-50 transition-colors"
              >
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                  <span className="text-sm text-gray-400">订单号: {order.order_no}</span>
                  <span className={`text-sm font-medium ${
                    order.status === 'pending' ? 'text-orange-500' :
                    order.status === 'paid' ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    {getOrderStatusText(order.status)}
                  </span>
                </div>
                <div className="p-4">
                  {items.map((item: any, index: number) => (
                    <div key={index} className="flex gap-3 mb-2 last:mb-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 truncate">{item.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-orange-500">¥{formatPrice(item.price)}</span>
                          <span className="text-xs text-gray-400">x{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-400">{formatDate(order.created_at)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">合计:</span>
                    <span className="text-orange-500 font-bold">¥{formatPrice(order.total_amount)}</span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}