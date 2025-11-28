import React from 'react';
import { PosterTheme } from '../../types';
import { HEADER_TEMPLATE_PRESETS } from '../config/headerTemplatePresets';

interface HeaderTemplatesTabProps {
  setTheme: React.Dispatch<React.SetStateAction<PosterTheme>>;
}

const HeaderTemplatesTab: React.FC<HeaderTemplatesTabProps> = ({ setTheme }) => {
  
  const applyTemplate = (templateTheme: Partial<PosterTheme>) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      ...templateTheme,
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Galeria de Templates de Cabeçalho</h3>
        <p className="text-xs text-gray-500">
          Escolha um design pronto para o cabeçalho do seu cartaz. Cores, fontes e estilos serão aplicados instantaneamente.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {HEADER_TEMPLATE_PRESETS.map(template => (
          <button 
            key={template.id}
            onClick={() => applyTemplate(template.theme)}
            className="border rounded-lg overflow-hidden group bg-white hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500 transition-all"
          >
            <img src={template.thumbnail} alt={template.name} className="w-full h-24 object-cover" />
            <div className="p-2 text-center">
              <p className="text-xs font-semibold text-gray-800 group-hover:text-indigo-700">{template.name}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeaderTemplatesTab;