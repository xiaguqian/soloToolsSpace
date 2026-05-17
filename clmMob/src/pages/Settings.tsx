
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Shield, HelpCircle, Info } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Bell, label: '消息通知', toggle: true },
    { icon: Shield, label: '隐私设置', toggle: true },
    { icon: HelpCircle, label: '帮助中心', path: '/help' },
    { icon: Info, label: '关于我们', path: '/about' },
  ];

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
          <h1 className="font-semibold text-lg">设置</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="pt-16 p-4">
        <div className="bg-white rounded-xl overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => item.path && navigate(item.path)}
              className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <item.icon size={20} className="text-gray-500" />
              </div>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {item.toggle && (
                <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 bg-white rounded-xl p-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">版本 1.0.0</p>
            <p className="text-gray-400 text-xs mt-1">多租户餐饮点餐系统</p>
          </div>
        </div>
      </main>
    </div>
  );
}
