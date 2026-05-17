import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

interface OrderSuccessPageProps {
  orderNo: string;
  onGoHome: () => void;
  onViewOrder: () => void;
}

export function OrderSuccessPage({ orderNo, onGoHome, onViewOrder }: OrderSuccessPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h1 className="text-xl font-bold text-gray-800 mb-2">下单成功</h1>
      <p className="text-gray-400 mb-6">订单号: {orderNo}</p>

      <div className="bg-white rounded-xl p-4 w-full mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <ShoppingBag size={24} className="text-orange-500" />
          <div className="flex-1">
            <p className="text-sm text-gray-500">预计 30-45 分钟送达</p>
          </div>
          <ArrowRight size={20} className="text-gray-400" />
        </div>
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onViewOrder}
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
        >
          查看订单
        </button>
        <button
          onClick={onGoHome}
          className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium"
        >
          继续购物
        </button>
      </div>
    </div>
  );
}