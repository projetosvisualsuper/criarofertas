import React from 'react';
import { Product, PosterTheme } from '../types';

interface ProductCardProps {
  product: Product;
  theme: PosterTheme;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, theme }) => {
  return (
    <div 
      className="relative flex flex-col items-center justify-between p-3 rounded-xl shadow-sm border overflow-hidden h-full bg-white/95 backdrop-blur-sm transition-all"
      style={{ 
        borderColor: theme.secondaryColor,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Product Image - Flexible height (flex-1) instead of fixed h-32 */}
      <div className="w-full flex-1 min-h-0 mb-2 flex items-center justify-center bg-white rounded-lg overflow-hidden relative p-2">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
        ) : (
          <div className="text-gray-300">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </div>
        )}
        
        {/* Discount Badge */}
        {product.oldPrice && (
           <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-bl-lg shadow-sm z-10">
             -{Math.round(((parseFloat(product.oldPrice) - parseFloat(product.price)) / parseFloat(product.oldPrice)) * 100)}%
           </div>
        )}
      </div>

      <div className="text-center w-full z-10 flex-shrink-0">
        <h3 className="text-sm md:text-base font-bold leading-tight mb-2 text-gray-800 line-clamp-2 min-h-[2.5em]" style={{ color: theme.textColor }}>
          {product.name}
        </h3>
        
        <div className="flex flex-col items-center justify-center bg-gray-50/50 rounded-lg py-1">
          {product.oldPrice && (
            <span className="text-xs text-gray-500 line-through decoration-red-500 font-medium">
              R$ {parseFloat(product.oldPrice).toFixed(2).replace('.', ',')}
            </span>
          )}
          <div className="flex items-baseline justify-center gap-0.5" style={{ color: theme.primaryColor }}>
            <span className="text-xs font-bold self-start mt-1">R$</span>
            <span className="text-3xl md:text-4xl font-display font-black tracking-tighter leading-none">
              {parseFloat(product.price).toFixed(2).replace('.', ',').split(',')[0]}
            </span>
            <div className="flex flex-col items-start leading-none self-end mb-1">
              <span className="text-sm font-bold">,{parseFloat(product.price).toFixed(2).split('.')[1]}</span>
              <span className="text-[9px] text-gray-500 uppercase font-semibold tracking-wide ml-0.5">{product.unit}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;