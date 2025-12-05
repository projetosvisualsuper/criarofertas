import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { Instagram, Send, Loader2, Image as ImageIcon, Check } from 'lucide-react';
import { SavedImage, SocialMediaAccount } from '../../types';
import { useMetaPosting } from '../hooks/useMetaPosting';
import { showError } from '../utils/toast';

interface InstagramPostModalProps {
  trigger: React.ReactNode;
  image: SavedImage;
  metaAccount: SocialMediaAccount;
}

const InstagramPostModal: React.FC<InstagramPostModalProps> = ({ trigger, image, metaAccount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const { isPosting, postImageToMeta } = useMetaPosting();

  useEffect(() => {
    if (isOpen) {
      // Sugere uma legenda inicial baseada no formato e nome do arquivo
      setCaption(`Nova OfertaFlash no formato ${image.formatName}! #oferta #promoção`);
    }
  }, [isOpen, image.formatName]);

  const handlePost = async () => {
    if (!caption.trim()) {
      showError("A legenda não pode ser vazia.");
      return;
    }
    
    const success = await postImageToMeta(metaAccount, image.imageUrl, caption);
    
    if (success) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-600">
            <Instagram size={24} /> Publicar no Instagram
          </DialogTitle>
          <DialogDescription>
            Postando a arte <span className="font-bold">{image.formatName}</span> na conta: <span className="font-bold">{metaAccount.accountName}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border">
            <img src={image.imageUrl} alt="Preview" className="w-16 h-16 object-contain rounded" />
            <div>
              <p className="text-sm font-semibold text-gray-800">{image.formatName}</p>
              <p className="text-xs text-gray-500">URL: {image.imageUrl.substring(0, 40)}...</p>
            </div>
          </div>
          
          <div>
            <label htmlFor="caption" className="text-sm font-medium text-gray-700 block mb-1">Legenda da Postagem</label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              rows={4}
              placeholder="Adicione sua legenda e hashtags aqui..."
              disabled={isPosting}
            />
          </div>
        </div>
        
        <DialogFooter className="mt-4 flex justify-end gap-3">
          <DialogClose asChild>
            <button 
              className="px-4 py-2 rounded-lg text-sm font-medium border bg-gray-100 hover:bg-gray-200 transition-colors"
              disabled={isPosting}
            >
              Cancelar
            </button>
          </DialogClose>
          <button
            onClick={handlePost}
            disabled={isPosting || !caption.trim()}
            className="px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
          >
            {isPosting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            {isPosting ? 'Publicando...' : 'Publicar Agora'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InstagramPostModal;