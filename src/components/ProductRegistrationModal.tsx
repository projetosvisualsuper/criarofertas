import React, { useState, useEffect } from 'react';
import { RegisteredProduct } from '../../types';
import { Plus, Save, Loader2, Image as ImageIcon, Database } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from './ui/dialog';
import { showSuccess, showError } from '../utils/toast';
import { useProductDatabase } from '../hooks/useProductDatabase';
import { useAuth } from '../context/AuthContext';
import { ProductImage } from '../hooks/useProductImages';

interface ProductRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage: ProductImage;
  onSave: (product: RegisteredProduct) => void; // Retorna o produto completo
}

const defaultNewProduct: Omit<RegisteredProduct, 'id'> = {
  name: '',
  defaultPrice: '0.00',
  defaultUnit: 'un',
  description: '',
  image: undefined,
  wholesalePrice: undefined,
  wholesaleUnit: 'un',
};

const ProductRegistrationModal: React.FC<ProductRegistrationModalProps> = ({ isOpen, onClose, initialImage, onSave }) => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { addProduct } = useProductDatabase(userId);
  
  const [product, setProduct] = useState<Omit<RegisteredProduct, 'id'>>({
    ...defaultNewProduct,
    image: initialImage.url,
    name: initialImage.name.split('.')[0].replace(/-/g, ' ').toUpperCase(), // Sugere nome
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProduct({
        ...defaultNewProduct,
        image: initialImage.url,
        name: initialImage.name.split('.')[0].replace(/-/g, ' ').toUpperCase(),
      });
    }
  }, [isOpen, initialImage]);

  const handleSave = async () => {
    if (!product.name.trim() || !product.defaultPrice.trim()) {
      showError("Nome e Preço são obrigatórios.");
      return;
    }
    
    setIsLoading(true);
    
    // 1. Cadastra o produto no banco de dados do usuário
    const result = await addProduct(product);
    
    setIsLoading(false);

    if (result) {
      showSuccess(`Produto "${result.name}" cadastrado e adicionado ao cartaz!`);
      // 2. Adiciona ao cartaz via callback
      onSave(result);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database size={24} /> Cadastrar Produto Compartilhado
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes de preço para adicionar este produto do banco compartilhado ao seu catálogo e ao cartaz.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="flex gap-4 items-start p-3 bg-gray-50 rounded-lg border">
            {/* Image Preview */}
            <div className="w-20 h-20 bg-white border rounded flex items-center justify-center shrink-0 overflow-hidden">
              <img src={initialImage.url} className="w-full h-full object-contain" alt={initialImage.name} />
            </div>
            
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-gray-700 block mb-1">Nome do Produto (Obrigatório)</label>
              <input 
                className="w-full border rounded px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={product.name} 
                onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))} 
                placeholder="Nome do Produto"
                disabled={isLoading}
              />
              
              <label className="text-xs font-semibold text-gray-700 block pt-1">Descrição (Opcional)</label>
              <textarea 
                className="w-full border rounded px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none" 
                value={product.description || ''} 
                onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))} 
                placeholder="Descrição detalhada" 
                rows={2}
                disabled={isLoading}
              />
            </div>
          </div>
          
          {/* Seção de Preços de Varejo */}
          <div className="flex gap-2 pt-2 border-t">
            <div className="flex-1">
              <label className="text-[10px] text-gray-500 uppercase font-bold">Preço Varejo (Padrão)</label>
              <input 
                className="w-full border rounded px-2 py-1 text-sm outline-none" 
                value={product.defaultPrice} 
                onChange={(e) => setProduct(prev => ({ ...prev, defaultPrice: e.target.value }))} 
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-gray-500 uppercase font-bold">Preço Antigo (Varejo)</label>
              <input 
                className="w-full border rounded px-2 py-1 text-sm outline-none" 
                value={product.defaultOldPrice || ''} 
                onChange={(e) => setProduct(prev => ({ ...prev, defaultOldPrice: e.target.value }))} 
                placeholder="0.00 (opcional)"
                disabled={isLoading}
              />
            </div>
            <div className="w-16">
              <label className="text-[10px] text-gray-500 uppercase font-bold">Unid. Varejo</label>
              <select 
                className="w-full border rounded px-1 py-1 text-sm outline-none bg-white" 
                value={product.defaultUnit} 
                onChange={(e) => setProduct(prev => ({ ...prev, defaultUnit: e.target.value }))}
                disabled={isLoading}
              >
                <option value="un">un</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="lt">lt</option>
                <option value="ml">ml</option>
                <option value="cx">cx</option>
              </select>
            </div>
          </div>
          
          {/* Seção de Preços de Atacado */}
          <div className="flex gap-2 pt-2 border-t border-dashed">
            <div className="flex-1">
              <label className="text-[10px] text-gray-500 uppercase font-bold">Preço Atacado (Opcional)</label>
              <input 
                className="w-full border rounded px-2 py-1 text-sm outline-none" 
                value={product.wholesalePrice || ''} 
                onChange={(e) => setProduct(prev => ({ ...prev, wholesalePrice: e.target.value }))} 
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-gray-500 uppercase font-bold">Unid. Atacado (Ex: 3un)</label>
              <input 
                className="w-full border rounded px-2 py-1 text-sm outline-none" 
                value={product.wholesaleUnit || ''} 
                onChange={(e) => setProduct(prev => ({ ...prev, wholesaleUnit: e.target.value }))} 
                placeholder="3un, cx, fardo"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end pt-4 border-t">
          <button 
            onClick={handleSave}
            disabled={isLoading || !product.name.trim() || !product.defaultPrice.trim()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Cadastrar e Adicionar ao Cartaz
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductRegistrationModal;