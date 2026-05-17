import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useStore } from '../store';
import { formatPrice } from '../utils';

interface CartPageProps {
  onCheckout: () => void;
}

export function CartPage({ onCheckout }: CartPageProps) {
  const { cart, updateCartQuantity, removeFromCart } = useStore();

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pb-20">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag size={40} className="text-gray-300" />
        </div>
        <p className="text-gray-400 mb-6">购物车是空的</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white">
        <div className="px-4 py-4">
          <h1 className="text-lg font-bold text-gray-800">购物车</h1>
          <p className="text-gray-400 text-sm">共 {totalCount} 件商品</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {cart.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-4 flex gap-3">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
                <span className="text-orange-500 font-bold">¥{formatPrice(item.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                    className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                    className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-sm">合计:</span>
            <span className="text-xl font-bold text-orange-500 ml-2">¥{formatPrice(totalAmount)}</span>
          </div>
          <button
            onClick={onCheckout}
            className="px-8 py-3 bg-orange-500 text-white rounded-xl font-medium active:bg-orange-600 transition-colors"
          >
            结算
          </button>
        </div>
      </div>
    </div>
  );
}