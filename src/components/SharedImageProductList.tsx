import React, { useState, useMemo } from 'react';
import { Image as ImageIcon, Loader2, Plus, Search } from 'lucide-react';
import { useProductImages, ProductImage } from '../hooks/useProductImages';
import { useAuth } from '../context/AuthContext';
import { RegisteredProduct, Product } from '../../types';
import { showSuccess, showError } from '../utils/toast';
import ProductRegistrationModal from './ProductRegistrationModal'; // Será criado no próximo passo

interface SharedImageProductListProps {
  onProductAddedToPoster: (product: RegisteredProduct) => void;
}

const SHARED_DIR_ID = 'shared'; // ID fixo para buscar imagens compartilhadas

const SharedImageProductList: React.FC<SharedImageProductListProps> = ({ onProductAddedToPoster }) => {
  const { session } = useAuth();
  // Usamos o ID 'shared' para buscar apenas o diretório compartilhado
  const { productImages, loadingImages } = useProductImages(SHARED_DIR_ID); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);

  const filteredImages = useMemo(() => {
    if (!searchTerm) return productImages;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return productImages.filter(img => 
      img.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [productImages, searchTerm]);
  
  const handleImageClick = (image: ProductImage) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };
  
  const handleProductSave = (product: RegisteredProduct) => {
    // 1. Adiciona ao cartaz (função passada via prop)
    onProductAddedToPoster(product);
    
    // 2. Fecha o modal
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar imagem por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded-lg px-10 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>
      
      {loadingImages ? (
        <div className="flex justify-center items-center p-4">
          <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
        </div>
      ) : filteredImages.length === 0 ? (
        <p className="text-xs text-gray-500 text-center p-4">
          {searchTerm 
            ? 'Nenhum resultado encontrado para sua busca.' 
            : 'Nenhuma imagem compartilhada encontrada. Peça ao administrador para cadastrar imagens públicas.'}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2">
          {filteredImages.map(image => (
            <button 
              key={image.path} 
              onClick={() => handleImageClick(image)}
              className="relative group rounded-lg overflow-hidden transition-all border border-gray-200 hover:border-green-500 hover:shadow-md"
              title={`Usar imagem: ${image.name}`}
            >
              <img 
                src={image.url} 
                alt={image.name} 
                className="w-full h-20 object-contain bg-white"
              />
              <div className="p-1 text-[10px] text-center bg-gray-50 truncate font-medium">{image.name.split('.')[0]}</div>
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={24} className="text-white" />
              </div>
            </button>
          ))}
        </div>
      )}
      
      {selectedImage && (
        <ProductRegistrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialImage={selectedImage}
          onSave={handleProductSave}
        />
      )}
    </div>
  );
};

export default SharedImageProductList;