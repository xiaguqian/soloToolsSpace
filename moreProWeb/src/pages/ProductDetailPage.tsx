import { useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Product } from '../api';
import { formatPrice } from '../utils';
import { useStore } from '../store';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCartSuccess: () => void;
}

export function ProductDetailPage({ product, onBack, onAddToCartSuccess }: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useStore();

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
      quantity,
      tenantId: product.tenant_id,
    });
    onAddToCartSuccess();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
      </div>

      <div className="aspect-square bg-white">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="bg-white mt-2">
        <div className="px-4 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <p className="text-gray-400 text-sm">{product.description}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-orange-500">¥{formatPrice(product.price)}</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">数量</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-gray-400 text-sm">库存: {product.stock}件</span>
            <span className="text-gray-400 text-sm">月售: 128</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleAddToCart}
          className="flex-1 py-3.5 bg-orange-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 active:bg-orange-600 transition-colors"
        >
          <ShoppingCart size={20} />
          加入购物车
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-1 py-3.5 bg-red-500 text-white rounded-xl font-medium active:bg-red-600 transition-colors"
        >
          立即购买
        </button>
      </div>
    </div>
  );
}