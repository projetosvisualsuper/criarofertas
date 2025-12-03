import React from 'react';
import { ShoppingCart, Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import { useWooCommerceProducts } from '../hooks/useWooCommerceProducts';
import { WooProduct } from '../../types';

const ProductCard: React.FC<{ product: WooProduct }> = ({ product }) => {
    const price = product.sale_price || product.regular_price;
    const isSale = !!product.sale_price && product.sale_price !== product.regular_price;
    
    return (
        <a 
            href={product.permalink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-indigo-400"
        >
            <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center shrink-0 mr-3">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                ) : (
                    <ShoppingCart size={16} className="text-gray-400" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{product.name}</p>
                <div className="flex items-center mt-0.5">
                    {isSale && (
                        <span className="text-xs text-red-500 line-through mr-2">R$ {product.regular_price}</span>
                    )}
                    <span className="text-sm font-bold text-green-600">R$ {price}</span>
                </div>
            </div>
            <ExternalLink size={14} className="text-gray-400 ml-2 shrink-0" />
        </a>
    );
};

const WooCommerceBanner: React.FC = () => {
  const { products, loading, error } = useWooCommerceProducts();

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl shadow-inner text-center">
        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-600">Buscando ofertas do WooCommerce...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-xl shadow-inner border border-red-200">
        <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-semibold text-red-800">Erro de Integração</p>
        </div>
        <p className="text-xs text-red-700">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl shadow-inner text-center">
        <ShoppingCart className="w-5 h-5 text-gray-400 mx-auto mb-1" />
        <p className="text-xs text-gray-500">Nenhuma oferta do WooCommerce encontrada.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-indigo-50 rounded-xl shadow-lg space-y-3">
      <h3 className="text-sm font-bold text-indigo-800 flex items-center gap-2">
        <ShoppingCart size={16} /> Ofertas da Sua Loja (WooCommerce)
      </h3>
      <div className="space-y-2">
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <p className="text-[10px] text-indigo-600 text-center pt-1">
        Anuncie seus produtos mais recentes aqui!
      </p>
    </div>
  );
};

export default WooCommerceBanner;