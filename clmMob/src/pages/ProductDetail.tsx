
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { productApi } from '../api';
import { Product, ProductSku } from '../types';
import { useStore } from '../store/useStore';

export default function ProductDetail() {
  const { tenantId, productId } = useParams<{ tenantId: string; productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSku, setSelectedSku] = useState<ProductSku | null>(null);
  const [loading, setLoading] = useState(true);

  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!tenantId || !productId) return;
      try {
        const data = await productApi.getProductById(parseInt(tenantId), parseInt(productId));
        setProduct(data);
        if (data.skus && data.skus.length > 0) {
          setSelectedSku(data.skus[0]);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [tenantId, productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      product_id: product.id,
      name: product.name + (selectedSku ? ` (${selectedSku.spec_name})` : ''),
      price: product.price,
      image: product.image,
      quantity,
      spec_name: selectedSku?.spec_name,
      price_extra: selectedSku?.price_extra,
    });
    navigate(-1);
  };

  const totalPrice = () => {
    if (!product) return 0;
    return product.price + (selectedSku?.price_extra || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">商品不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-semibold">商品详情</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="pt-16">
        <div className="aspect-square bg-white">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300';
            }}
          />
        </div>

        <div className="bg-white mt-2 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold">{product.name}</h2>
              <p className="text-gray-500 text-sm mt-2">{product.description}</p>
            </div>
            <span className="text-orange-500 text-2xl font-bold">¥{totalPrice().toFixed(2)}</span>
          </div>

          {product.skus && product.skus.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">规格选择</h3>
              <div className="flex flex-wrap gap-2">
                {product.skus.map((sku) => (
                  <button
                    key={sku.id}
                    onClick={() => setSelectedSku(sku)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      selectedSku?.id === sku.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {sku.spec_name} {sku.price_extra > 0 && `+¥${sku.price_extra}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">购买数量</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <Minus size={18} />
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {product.stock > 0 && (
            <div className="mt-4 text-sm text-gray-400">
              库存: {product.stock}份
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleAddToCart}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingCart size={20} />
          加入购物车 ¥{(totalPrice() * quantity).toFixed(2)}
        </button>
      </footer>
    </div>
  );
}
