
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ChevronRight } from 'lucide-react';
import { orderApi } from '../api';
import { Order } from '../types';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.getAll();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'unpaid':
        return '待支付';
      case 'paid':
        return '已支付';
      case 'pending':
        return '待接单';
      case 'preparing':
        return '制作中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid':
        return 'text-yellow-500 bg-yellow-50';
      case 'paid':
      case 'pending':
        return 'text-blue-500 bg-blue-50';
      case 'preparing':
        return 'text-orange-500 bg-orange-50';
      case 'completed':
        return 'text-green-500 bg-green-50';
      case 'cancelled':
        return 'text-gray-400 bg-gray-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const formatDate = (dateValue: Date | string) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          <h1 className="font-semibold text-lg">我的订单</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="pt-16 p-4">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Clock size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">暂无订单</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-medium"
            >
              去点餐
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">订单号: {order.order_no}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}
                  >
                    {getStatusText(order.order_status)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">
                    {order.type === 'dine_in' ? '堂食' : '外卖'}
                  </span>
                  <span className="text-gray-400">{formatDate(order.create_time)}</span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500">共{order.items?.length || 0}件商品</span>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold">¥{order.total_amount.toFixed(2)}</span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
