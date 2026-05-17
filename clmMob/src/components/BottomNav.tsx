
import { ShoppingCart, User, Utensils } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useStore((state) => state.getCartCount());

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
            isActive('/') ? 'text-orange-500' : 'text-gray-400'
          }`}
        >
          <Utensils size={22} />
          <span className="text-xs mt-1">点餐</span>
        </button>
        <button
          onClick={() => navigate('/cart')}
          className={`flex flex-col items-center justify-center w-16 h-full transition-colors relative ${
            isActive('/cart') ? 'text-orange-500' : 'text-gray-400'
          }`}
        >
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
          <span className="text-xs mt-1">购物车</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
            isActive('/profile') ? 'text-orange-500' : 'text-gray-400'
          }`}
        >
          <User size={22} />
          <span className="text-xs mt-1">我的</span>
        </button>
      </div>
    </nav>
  );
}
