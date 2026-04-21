import { Star, ShoppingCart } from 'lucide-react';
import { Product } from './CartContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  return (
    <div className="group bg-white rounded-lg border shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
      <div
        className="aspect-square overflow-hidden cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3
            className="font-medium mb-1 cursor-pointer hover:underline"
            onClick={() => onViewDetails(product)}
          >
            {product.name}
          </h3>
          <p className="text-sm text-gray-600">{product.category}</p>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm">{product.rating}</span>
          <span className="text-sm text-gray-500">({product.reviews.length} reviews)</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold">${product.price.toFixed(2)}</span>
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </button>
        </div>

        {product.stock < 10 && (
          <p className="text-sm text-orange-600 mt-2">Only {product.stock} left in stock!</p>
        )}
      </div>
    </div>
  );
}
