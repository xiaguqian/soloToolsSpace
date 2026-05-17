
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Store, MapPin, Clock, Phone } from 'lucide-react';
import { tenantApi } from '../api';
import { Tenant } from '../types';
import { useStore } from '../store/useStore';

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  
  const setCurrentTenant = useStore((state) => state.setCurrentTenant);
  const setOrderMode = useStore((state) => state.setOrderMode);
  const setCurrentTable = useStore((state) => state.setCurrentTable);

  useEffect(() => {
    const tenantId = searchParams.get('tenantId');
    const tableId = searchParams.get('tableId');
    
    if (tenantId) {
      setOrderMode('dine_in');
      if (tableId) {
        setCurrentTable({
          id: parseInt(tableId),
          tenant_id: parseInt(tenantId),
          table_name: `${tableId}号桌`,
          qrcode_url: '',
          status: 'available'
        });
      }
      navigate(`/menu/${tenantId}`);
    }
  }, [searchParams, navigate, setOrderMode, setCurrentTable]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const data = await tenantApi.getAll();
        setTenants(data);
      } catch (error) {
        console.error('Failed to fetch tenants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const handleSelectTenant = (tenant: Tenant, mode: 'dine_in' | 'takeout') => {
    setCurrentTenant(tenant);
    setOrderMode(mode);
    navigate(`/menu/${tenant.id}`);
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
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
        <h1 className="text-2xl font-bold text-center">美味点餐</h1>
        <p className="text-center text-orange-100 mt-1">选择您要就餐的商户</p>
      </header>

      <main className="p-4">
        {tenants.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Store size={48} className="mx-auto mb-4 opacity-50" />
            <p>暂无商户</p>
          </div>
        ) : (
          tenants.map((tenant) => (
            <div key={tenant.id} className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Store size={24} className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{tenant.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {tenant.business_hours}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span>{tenant.tel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span>配送费: ¥{tenant.delivery_fee} | 起送价: ¥{tenant.min_delivery_amount}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleSelectTenant(tenant, 'dine_in')}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    堂食点餐
                  </button>
                  {tenant.enable_takeout === 1 && (
                    <button
                      onClick={() => handleSelectTenant(tenant, 'takeout')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      外卖配送
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
