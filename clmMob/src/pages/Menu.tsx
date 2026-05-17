
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Plus, Minus } from 'lucide-react';
import { productApi, tenantApi } from '../api';
import { Product, Category, Tenant } from '../types';
import { useStore } from '../store/useStore';

export default function Menu() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const orderMode = useStore((state) => state.orderMode);
  const setOrderMode = useStore((state) => state.setOrderMode);
  const currentTable = useStore((state) => state.currentTable);
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantId) return;
      try {
        const [tenantData, categoriesData, productsData] = await Promise.all([
          tenantApi.getById(parseInt(tenantId)),
          productApi.getCategories(parseInt(tenantId)),
          productApi.getProducts(parseInt(tenantId)),
        ]);
        setTenant(tenantData);
        setCategories(categoriesData);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    const fetchProducts = async () => {
      try {
        const data = await productApi.getProducts(
          parseInt(tenantId),
          selectedCategory || undefined,
          searchKeyword || undefined
        );
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, [tenantId, selectedCategory, searchKeyword]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  const handleProductClick = (productId: number) => {
    navigate(`/menu/${tenantId}/product/${productId}`);
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
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">{tenant?.name}</h2>
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setOrderMode('dine_in')}
                className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                  orderMode === 'dine_in'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600'
                }`}
              >
                堂食
              </button>
              <button
                onClick={() => setOrderMode('takeout')}
                className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                  orderMode === 'takeout'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600'
                }`}
              >
                外卖
              </button>
            </div>
          </div>

          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索商品..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm"
            />
          </div>
        </div>

        {orderMode === 'dine_in' && currentTable && (
          <div className="px-4 py-2 bg-orange-50 border-t border-orange-100">
            <span className="text-sm text-orange-600">当前桌号: {currentTable.table_name}</span>
          </div>
        )}
      </header>

      <div className="flex">
        <div className="w-24 bg-gray-100 min-h-screen sticky top-20 hidden md:block">
          <div className="p-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                selectedCategory === null
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="flex gap-2 overflow-x-auto pb-2 md:hidden">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300';
                    }}
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 h-10">{product.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-orange-500 font-bold">¥{product.price.toFixed(2)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>暂无商品</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
