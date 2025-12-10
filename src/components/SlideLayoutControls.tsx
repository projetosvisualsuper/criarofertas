import React from 'react';
import { Product, ProductLayout, PosterTheme, LogoLayout } from '../../types';
import { SlidersHorizontal } from 'lucide-react';

interface SlideLayoutControlsProps {
  product: Product;
  onLayoutChange: (productId: string, newLayout: ProductLayout) => void;
  theme: PosterTheme;
  setTheme: React.Dispatch<React.SetStateAction<PosterTheme>>;
}

const defaultLayout: ProductLayout = {
  image: { x: 0, y: 0, scale: 1 },
  name: { x: 0, y: 0, scale: 1 },
  price: { x: 0, y: 0, scale: 1 },
  description: { x: 0, y: 0, scale: 1 },
};

const SlideLayoutControls: React.FC<SlideLayoutControlsProps> = ({ product, onLayoutChange, theme, setTheme }) => {
  const layout = product.layouts?.['tv'] || defaultLayout;
  const logoLayout = theme.logo?.layouts['tv'];

  const handleChange = (element: keyof ProductLayout, property: 'x' | 'y' | 'scale', value: number) => {
    const newLayout: ProductLayout = {
      ...layout,
      [element]: {
        ...layout[element],
        [property]: value,
      },
    };
    onLayoutChange(product.id, newLayout);
  };

  const handleLogoChange = (property: keyof LogoLayout, value: number) => {
    if (!theme.logo) return;
    setTheme(prevTheme => {
        if (!prevTheme.logo) return prevTheme;
        const newLayouts = { ...prevTheme.logo.layouts };
        newLayouts['tv'] = {
            ...newLayouts['tv'],
            [property]: value,
        };
        return {
            ...prevTheme,
            logo: {
                ...prevTheme.logo,
                layouts: newLayouts,
            }
        };
    });
  };
  
  const handleThemeUnitChange = (property: 'unitBottomEm' | 'unitRightEm', value: number) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      [property]: value,
    }));
  };

  const renderControlGroup = (element: keyof ProductLayout, title: string) => (
    <details className="border-t pt-3 mt-3" open>
      <summary className="text-xs font-bold uppercase text-gray-700 cursor-pointer hover:text-indigo-600 transition-colors">
        {title}
      </summary>
      <div className="space-y-3 pt-2">
        {/* Tamanho */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <label className="font-medium text-gray-600">Tamanho</label>
            <span className="font-mono text-gray-500">{layout[element].scale.toFixed(1)}x</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="4" 
            step="0.1" 
            value={layout[element].scale} 
            onChange={(e) => handleChange(element, 'scale', Number(e.target.value))} 
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* Posição X e Y na mesma linha */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <label className="font-medium text-gray-600">Posição X</label>
              <span className="font-mono text-gray-500">{layout[element].x}px</span>
            </div>
            <input 
              type="range" 
              min="-300" 
              max="300" 
              value={layout[element].x} 
              onChange={(e) => handleChange(element, 'x', Number(e.target.value))} 
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <label className="font-medium text-gray-600">Posição Y</label>
              <span className="font-mono text-gray-500">{layout[element].y}px</span>
            </div>
            <input 
              type="range" 
              min="-300" 
              max="300" 
              value={layout[element].y} 
              onChange={(e) => handleChange(element, 'y', Number(e.target.value))} 
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </details>
  );

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <SlidersHorizontal size={16} />
            Ajustar Layout do Slide
        </h3>
        
        {renderControlGroup('image', 'Imagem do Produto')}
        {renderControlGroup('name', 'Nome do Produto')}
        {product.description && renderControlGroup('description', 'Descrição')}
        {renderControlGroup('price', 'Bloco de Preço')}
        
        {/* Controles de Posição da Unidade */}
        <details className="border-t pt-3 mt-3" open>
            <summary className="text-xs font-bold uppercase text-gray-700 cursor-pointer hover:text-indigo-600 transition-colors">
                Unidade de Medida (ex: /kg)
            </summary>
            <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <label className="font-medium text-gray-600">Posição Vertical (em)</label>
                        <span className="font-mono text-gray-500">{theme.unitBottomEm.toFixed(1)}em</span>
                    </div>
                    <input 
                        type="range" 
                        min="-2" 
                        max="2" 
                        step="0.1" 
                        value={theme.unitBottomEm} 
                        onChange={(e) => handleThemeUnitChange('unitBottomEm', Number(e.target.value))} 
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <label className="font-medium text-gray-600">Posição Horizontal (em)</label>
                        <span className="font-mono text-gray-500">{theme.unitRightEm.toFixed(1)}em</span>
                    </div>
                    <input 
                        type="range" 
                        min="-3" 
                        max="3" 
                        step="0.1" 
                        value={theme.unitRightEm} 
                        onChange={(e) => handleThemeUnitChange('unitRightEm', Number(e.target.value))} 
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
        </details>

        {theme.logo && logoLayout && (
            <details className="border-t pt-3 mt-3" open>
                <summary className="text-xs font-bold uppercase text-gray-700 cursor-pointer hover:text-indigo-600 transition-colors">
                    Logo
                </summary>
                <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <label className="font-medium text-gray-600">Tamanho</label>
                            <span className="font-mono text-gray-500">{logoLayout.scale.toFixed(1)}x</span>
                        </div>
                        <input type="range" min="0.5" max="2" step="0.1" value={logoLayout.scale} onChange={(e) => handleLogoChange('scale', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <label className="font-medium text-gray-600">Posição X</label>
                                <span className="font-mono text-gray-500">{logoLayout.x}px</span>
                            </div>
                            <input type="range" min="-400" max="400" value={logoLayout.x} onChange={(e) => handleLogoChange('x', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <label className="font-medium text-gray-600">Posição Y</label>
                                <span className="font-mono text-gray-500">{logoLayout.y}px</span>
                            </div>
                            <input type="range" min="-400" max="400" value={logoLayout.y} onChange={(e) => handleLogoChange('y', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                        </div>
                    </div>
                </div>
            </details>
        )}
      </div>
    </div>
  );
};

export default SlideLayoutControls;