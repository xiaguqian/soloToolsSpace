import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../store';
import { getProducts, getCategories, Product, Category } from '../api';

interface ProductsPageProps {
  onProductClick: (product: Product) => void;
  initialCategory?: string;
}

export function ProductsPage({ onProductClick, initialCategory = '' }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { tenant, addToCart } = useStore();

  useEffect(() => {
    if (!tenant) return;
    Promise.all([
      getProducts(tenant.id, selectedCategory || undefined, keyword || undefined),
      getCategories(tenant.id),
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData);
      setCategories(categoriesData);
      setLoading(false);
    });
  }, [tenant, selectedCategory, keyword]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
      quantity: 1,
      tenantId: product.tenant_id,
    });
  };

  const handleSearch = () => {
    setLoading(true);
  };

  const handleClearSearch = () => {
    setKeyword('');
    setLoading(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索商品"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-full text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              />
              {keyword && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2.5 bg-orange-500 text-white rounded-full text-sm font-medium active:bg-orange-600 transition-colors"
            >
              搜索
            </button>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => {
                setSelectedCategory('');
                setLoading(true);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all ${
                selectedCategory === ''
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setLoading(true);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all ${
                  selectedCategory === category.name
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">暂无商品</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                onClick={() => onProductClick(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}