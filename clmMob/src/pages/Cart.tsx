
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Cart() {
  const navigate = useNavigate();
  const cart = useStore((state) => state.getCurrentCart());
  const updateCartItemQuantity = useStore((state) => state.updateCartItemQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const clearCart = useStore((state) => state.clearCart);
  const cartTotal = useStore((state) => state.getCartTotal());
  const orderMode = useStore((state) => state.orderMode);
  const currentTable = useStore((state) => state.currentTable);
  const currentTenant = useStore((state) => state.currentTenant);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate('/order/confirm');
  };

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
          <h1 className="font-semibold text-lg">购物车</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="pt-16 p-4">
        {orderMode === 'dine_in' && currentTable && (
          <div className="bg-orange-50 rounded-xl p-4 mb-4">
            <span className="text-orange-600 font-medium">当前桌号: {currentTable.table_name}</span>
          </div>
        )}

        {orderMode === 'takeout' && (
          <div className="bg-green-50 rounded-xl p-4 mb-4">
            <span className="text-green-600 font-medium">外卖配送</span>
            {currentTenant && (
              <p className="text-green-500 text-sm mt-1">
                配送费: ¥{currentTenant.delivery_fee} | 起送价: ¥{currentTenant.min_delivery_amount}
              </p>
            )}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">购物车是空的</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-medium"
            >
              去点餐
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={`${item.product_id}-${item.spec_name}`}
                className="bg-white rounded-xl p-4 flex gap-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{item.name}</h3>
                  {item.spec_name && (
                    <p className="text-xs text-gray-400 mt-1">{item.spec_name}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-orange-500 font-bold">
                      ¥{(item.price + (item.price_extra || 0)).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateCartItemQuantity(
                            item.product_id,
                            item.quantity - 1,
                            item.spec_name
                          )
                        }
                        className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateCartItemQuantity(
                            item.product_id,
                            item.quantity + 1,
                            item.spec_name
                          )
                        }
                        className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product_id, item.spec_name)}
                        className="w-7 h-7 text-red-500 flex items-center justify-center ml-2"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="w-full py-2 text-gray-400 text-sm hover:text-red-500 transition-colors"
            >
              清空购物车
            </button>
          </div>
        )}
      </main>

      <footer className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-sm">合计:</span>
            <span className="text-orange-500 text-2xl font-bold ml-2">¥{cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`px-8 py-3 rounded-xl font-medium transition-colors ${
              cart.length === 0
                ? 'bg-gray-300 text-gray-500'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            去结算
          </button>
        </div>
      </footer>
    </div>
  );
}
