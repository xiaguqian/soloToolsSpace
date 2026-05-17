import { Home, Grid3X3, ShoppingCart, User } from 'lucide-react';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cartCount: number;
}

export function TabBar({ activeTab, onTabChange, cartCount }: TabBarProps) {
  const tabs = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'products', label: '商品', icon: Grid3X3 },
    { id: 'cart', label: '购物车', icon: ShoppingCart, badge: cartCount },
    { id: 'profile', label: '我的', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-16 py-1 ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-0.5">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-0.5 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}