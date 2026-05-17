
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, CreditCard } from 'lucide-react';
import { orderApi } from '../api';
import { Order } from '../types';

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const data = await orderApi.getById(parseInt(orderId));
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handlePay = async () => {
    if (!orderId) return;
    setIsPaying(true);
    try {
      await orderApi.pay(parseInt(orderId));
      const data = await orderApi.getById(parseInt(orderId));
      setOrder(data);
    } catch (error) {
      console.error('Failed to pay:', error);
      alert('支付失败');
    } finally {
      setIsPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!orderId) return;
    if (!confirm('确定取消订单吗？')) return;
    setIsCancelling(true);
    try {
      await orderApi.cancel(parseInt(orderId));
      const data = await orderApi.getById(parseInt(orderId));
      setOrder(data);
    } catch (error) {
      console.error('Failed to cancel:', error);
      alert('取消失败');
    } finally {
      setIsCancelling(false);
    }
  };

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
        return 'text-yellow-500';
      case 'paid':
      case 'pending':
        return 'text-blue-500';
      case 'preparing':
        return 'text-orange-500';
      case 'completed':
        return 'text-green-500';
      case 'cancelled':
        return 'text-gray-400';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (dateValue: Date | string) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
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

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">订单不存在</p>
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
          <h1 className="font-semibold text-lg">订单详情</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="pt-16 p-4">
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">订单号</span>
            <span className="font-medium">{order.order_no}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">订单状态</span>
            <span className={`font-medium ${getStatusColor(order.order_status)}`}>
              {getStatusText(order.order_status)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">订单类型</span>
            <span className="font-medium">{order.type === 'dine_in' ? '堂食' : '外卖'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">下单时间</span>
            <span className="font-medium">{formatDate(order.create_time)}</span>
          </div>
        </div>

        {order.type === 'dine_in' && order.table_id && (
          <div className="bg-orange-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-orange-500" />
              <div>
                <h3 className="font-medium">堂食</h3>
                <p className="text-sm text-gray-600">桌号: {order.table_id}号桌</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 mb-4">
          <h3 className="font-medium mb-3">订单商品</h3>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <span className="text-sm">{item.product_name}</span>
                  <span className="text-gray-400 text-sm ml-2">x{item.quantity}</span>
                </div>
                <span className="text-sm">¥{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">商品金额</span>
            <span>¥{order.total_amount.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between">
            <span className="font-medium">合计</span>
            <span className="text-orange-500 font-bold text-lg">¥{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3">
          {order.order_status === 'unpaid' && (
            <>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-medium transition-colors"
              >
                {isCancelling ? '取消中...' : '取消订单'}
              </button>
              <button
                onClick={handlePay}
                disabled={isPaying}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <CreditCard size={18} />
                {isPaying ? '支付中...' : '去支付'}
              </button>
            </>
          )}
          {order.order_status === 'pending' && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-medium transition-colors"
            >
              {isCancelling ? '取消中...' : '取消订单'}
            </button>
          )}
          {(order.order_status === 'preparing' || order.order_status === 'completed') && (
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
            >
              再次购买
            </button>
          )}
          {order.order_status === 'cancelled' && (
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
            >
              重新点餐
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
