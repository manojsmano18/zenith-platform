import React from 'react';
import { Star, Plus, Check } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, isInCart }) {
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.price);

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5">
      {/* Product Image from local project folder */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700/50">
            {product.category}
          </span>
          {product.featured && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Featured
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-700/50">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold text-slate-200">{product.rating}</span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block">Price (INR)</span>
            <span className="text-xl font-bold text-white tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              isInCart
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
