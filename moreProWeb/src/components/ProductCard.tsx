import { Plus } from 'lucide-react';
import { Product } from '../api';
import { formatPrice } from '../utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  onClick: () => void;
}

export function ProductCard({ product, onAddToCart, onClick }: ProductCardProps) {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart();
          }}
          className="absolute bottom-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 truncate mb-1">{product.name}</h3>
        <p className="text-xs text-gray-400 mb-2 line-clamp-2 h-10">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-orange-500 font-bold">¥{formatPrice(product.price)}</span>
          <span className="text-xs text-gray-400">库存:{product.stock}</span>
        </div>
      </div>
    </div>
  );
}