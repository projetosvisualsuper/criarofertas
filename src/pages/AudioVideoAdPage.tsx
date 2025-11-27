import React from 'react';
import { Clapperboard } from 'lucide-react';
import AdScriptGenerator from '../components/AdScriptGenerator';
import { PosterTheme, Product } from '../../types';

interface AudioVideoAdPageProps {
  theme: PosterTheme;
  products: Product[];
}

const AudioVideoAdPage: React.FC<AudioVideoAdPageProps> = ({ theme, products }) => {
  return (
    <div className="flex-1 flex flex-col p-8 bg-gray-100 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Clapperboard size={32} className="text-indigo-600" />
        Anúncios Áudio/Vídeo
      </h2>
      
      <div className="flex-1 min-h-0">
        <AdScriptGenerator products={products} theme={theme} />
      </div>
    </div>
  );
};

export default AudioVideoAdPage;