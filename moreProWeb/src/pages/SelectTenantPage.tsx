import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { getTenants, Tenant } from '../api';
import { useStore } from '../store';

interface SelectTenantPageProps {
  onSelect: (tenant: Tenant) => void;
}

export function SelectTenantPage({ onSelect }: SelectTenantPageProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenants().then((data) => {
      setTenants(data);
      setLoading(false);
    });
  }, []);

  const { setTenant } = useStore();

  const handleSelect = (tenant: Tenant) => {
    setTenant({
      id: tenant.id,
      name: tenant.name,
      logo: tenant.logo,
      configJson: tenant.config_json,
    });
    onSelect(tenant);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">欢迎使用</h1>
          <p className="text-gray-400 text-sm">请选择您要访问的商户</p>
        </div>
      </div>
      <div className="px-4 py-4">
        {tenants.map((tenant) => (
          <div
            key={tenant.id}
            onClick={() => handleSelect(tenant)}
            className="bg-white rounded-xl p-4 flex items-center gap-4 mb-3 shadow-sm active:bg-gray-50 transition-colors"
          >
            <img
              src={tenant.logo}
              alt={tenant.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">{tenant.name}</h3>
              <p className="text-xs text-gray-400">点击进入</p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
}