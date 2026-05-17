import { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Banner } from '../components/Banner';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../store';
import { getBanners, getCategories, getProducts, Banner as BannerType, Category, Product } from '../api';

interface HomePageProps {
  onProductClick: (product: Product) => void;
  onSearch: () => void;
  onCategoryClick: (category: string) => void;
}

export function HomePage({ onProductClick, onSearch, onCategoryClick }: HomePageProps) {
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { tenant, addToCart } = useStore();

  useEffect(() => {
    if (!tenant) return;
    Promise.all([
      getBanners(tenant.id),
      getCategories(tenant.id),
      getProducts(tenant.id),
    ]).then(([bannersData, categoriesData, productsData]) => {
      setBanners(bannersData);
      setCategories(categoriesData);
      setProducts(productsData);
      setLoading(false);
    });
  }, [tenant]);

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

  const handleBannerClick = (link: string) => {
    if (link) {
      if (link.startsWith('/products')) {
        onCategoryClick('');
      }
    }
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
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={tenant?.logo}
            alt={tenant?.name}
            className="w-10 h-10 rounded-full bg-white p-0.5"
          />
          <div className="flex-1">
            <h1 className="text-white font-bold">{tenant?.name}</h1>
            <div className="flex items-center gap-1 text-white/80 text-xs">
              <MapPin size={12} />
              <span>配送范围 3km</span>
            </div>
          </div>
        </div>
        <button
          onClick={onSearch}
          className="flex items-center gap-2 bg-white/90 rounded-full px-4 py-2.5"
        >
          <Search size={18} className="text-gray-400" />
          <span className="text-gray-400 text-sm">搜索商品</span>
        </button>
      </div>

      <div className="px-4 py-4">
        <Banner banners={banners} onBannerClick={handleBannerClick} />
      </div>

      <div className="px-4 mb-4">
        <h2 className="text-base font-bold text-gray-800 mb-3">分类</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.name)}
              className="flex-shrink-0 flex flex-col items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-sm"
            >
              <span className="text-2xl">{category.icon}</span>
              <span className="text-xs text-gray-600">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800">推荐商品</h2>
          <button onClick={() => onCategoryClick('')} className="text-sm text-orange-500">
            查看全部
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {products.slice(0, 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}