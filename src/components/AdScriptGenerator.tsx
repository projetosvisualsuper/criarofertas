import React, { useState, useMemo } from 'react';
import { Product, PosterTheme, AdScript } from '../../types';
import { Wand2, Loader2, Zap, Clipboard, Check, Download, Music, Mic } from 'lucide-react';
import { generateAdScript } from '../../services/geminiService';
import { showSuccess, showError } from '../utils/toast';

interface AdScriptGeneratorProps {
  products: Product[];
  theme: PosterTheme;
}

const AdScriptGenerator: React.FC<AdScriptGeneratorProps> = ({ products }) => {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(products.length > 0 ? [products[0].id] : []);
  const [adScript, setAdScript] = useState<AdScript | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const selectedProducts = useMemo(() => 
    products.filter(p => selectedProductIds.includes(p.id)), 
    [products, selectedProductIds]
  );

  const handleProductSelection = (productId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedProductIds(prev => [...prev, productId]);
    } else {
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    }
  };

  const handleGenerateScript = async () => {
    if (selectedProducts.length === 0) {
      showError("Selecione pelo menos um produto.");
      return;
    }

    setIsLoading(true);
    setAdScript(null);
    
    try {
      const generatedScript = await generateAdScript(selectedProducts);
      setAdScript(generatedScript);
      showSuccess("Roteiro gerado com sucesso!");
    } catch (error) {
      showError("Erro ao gerar roteiro. Verifique sua chave API.");
    } finally {
      setIsLoading(false);
    }
  };

  const scriptText = adScript?.script || '';

  const handleCopy = () => {
    if (scriptText) {
      navigator.clipboard.writeText(scriptText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  const handleDownload = () => {
    if (scriptText) {
      const element = document.createElement("a");
      const fileNameBase = selectedProducts.length === 1 
        ? selectedProducts[0].name.replace(/\s+/g, '-').toLowerCase()
        : 'anuncio-multi-produtos';
        
      const file = new Blob([scriptText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `roteiro-${fileNameBase}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  if (products.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-md">
        <Zap size={32} className="text-yellow-500 mx-auto mb-4" />
        <p className="text-xl font-semibold text-gray-700">Nenhum Produto Encontrado</p>
        <p className="text-gray-500 mt-2">Adicione produtos na aba "OfertaFlash Builder" para gerar roteiros de anúncios.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      
      {/* Controls Panel */}
      <div className="lg:w-1/3 w-full flex-shrink-0 bg-white p-6 rounded-xl shadow-md space-y-6 h-fit lg:h-full overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Wand2 size={20} className="text-indigo-600" />
          Gerador de Roteiro IA
        </h3>
        
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 block">Produtos para Anunciar ({selectedProducts.length} selecionados)</label>
          <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-1 bg-gray-50">
            {products.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm">
                <label className="flex items-center space-x-2 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(p.id)}
                    onChange={(e) => handleProductSelection(p.id, e.target.checked)}
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out rounded"
                  />
                  <span className="text-sm text-gray-700 truncate">{p.name} (R$ {p.price})</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleGenerateScript}
          disabled={isLoading || selectedProducts.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Zap size={20} />
          )}
          {isLoading ? 'Gerando Roteiro...' : 'Gerar Roteiro de Anúncio'}
        </button>
        
        {adScript && (
          <div className="p-3 bg-gray-50 rounded-lg border text-sm space-y-3">
            <p className="font-bold text-gray-800 border-b pb-1">Sugestões de Produção:</p>
            <div className="flex items-center gap-2 text-gray-700">
              <Music size={16} className="text-indigo-500 shrink-0" />
              <span className="font-semibold">Música:</span> {adScript.suggestions.music}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Mic size={16} className="text-indigo-500 shrink-0" />
              <span className="font-semibold">Voz:</span> {adScript.suggestions.voice}
            </div>
          </div>
        )}
      </div>

      {/* Script Display */}
      <div className="lg:w-2/3 w-full flex flex-col bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-xl font-bold text-gray-800">Roteiro Gerado</h3>
          <div className="flex gap-2">
            <button 
              onClick={handleDownload}
              disabled={!scriptText}
              className="flex items-center gap-1 text-sm px-3 py-1 rounded transition-colors disabled:opacity-50 bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              <Download size={16} />
              Baixar
            </button>
            <button 
              onClick={handleCopy}
              disabled={!scriptText}
              className="flex items-center gap-1 text-sm px-3 py-1 rounded transition-colors disabled:opacity-50"
              style={{ backgroundColor: isCopied ? '#10b981' : '#e0e7ff', color: isCopied ? 'white' : '#4f46e5' }}
            >
              {isCopied ? <Check size={16} /> : <Clipboard size={16} />}
              {isCopied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
        
        {adScript?.headline && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-lg font-black text-yellow-800">{adScript.headline}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700 font-mono bg-gray-50 p-4 rounded border">
          {scriptText || (
            <p className="text-gray-400 italic">
              {isLoading ? 'Aguarde enquanto a IA cria seu roteiro...' : 'Selecione os produtos e clique em "Gerar Roteiro de Anúncio" para começar.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdScriptGenerator;