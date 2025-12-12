import React, { useState, useEffect } from 'react';
import { Layout, DollarSign, Save, Loader2, Plus, Trash2, Check, X, Palette, ListOrdered } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGlobalBanners, GlobalBanner } from '../../hooks/useGlobalBanners';
import { showError, showSuccess } from '../../utils/toast';
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminGlobalBannersPage: React.FC = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const { banners, loading, updateBanner, addBanner, deleteBanner } = useGlobalBanners(isAdmin);
  
  const [localBanners, setLocalBanners] = useState<GlobalBanner[]>([]);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<GlobalBanner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Sincroniza os banners carregados com o estado local
    setLocalBanners(banners);
  }, [banners]);

  const handleFieldChange = (id: string, field: keyof GlobalBanner, value: string | number | boolean) => {
    setLocalBanners(prev => prev.map(pkg => 
      pkg.id === id 
        ? { ...pkg, [field]: value } 
        : pkg
    ));
  };
  
  const handleAddBanner = () => {
    const newId = crypto.randomUUID();
    setLocalBanners(prev => [
        ...prev,
        {
            id: newId,
            name: 'Novo Banner',
            content: 'Anuncie suas ofertas aqui!',
            background_color: '#000000',
            text_color: '#ffffff',
            is_active: true,
            order_index: prev.length,
        }
    ]);
  };

  const handleSaveBanner = async (pkg: GlobalBanner) => {
    if (!isAdmin) {
      showError("Apenas administradores podem salvar estas configurações.");
      return;
    }
    
    setIsSavingId(pkg.id);
    
    try {
        const updates = {
            name: pkg.name,
            content: pkg.content,
            background_color: pkg.background_color,
            text_color: pkg.text_color,
            is_active: pkg.is_active,
            order_index: pkg.order_index,
        };
        
        const originalBanner = banners.find(p => p.id === pkg.id);
        
        if (originalBanner) {
            await updateBanner(pkg.id, updates);
        } else {
            await addBanner(updates);
        }
        
    } catch (e) {
        // Erro já tratado no hook
    } finally {
        setIsSavingId(null);
    }
  };
  
  const handleDeleteClick = (pkg: GlobalBanner) => {
    setBannerToDelete(pkg);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return;
    
    setIsDeleting(true);
    try {
        await deleteBanner(bannerToDelete.id);
        setLocalBanners(prev => prev.filter(p => p.id !== bannerToDelete.id));
    } catch (e) {
        // Erro já tratado no hook
    } finally {
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        setBannerToDelete(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-red-500">Acesso negado.</div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-8 bg-gray-100 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Layout size={32} className="text-indigo-600" />
        Gerenciamento de Banners
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Gerencie os banners de anúncio que aparecem no módulo de TV Digital e na página de Login.
      </p>
      
      {/* Tabs para separar Login Banner e Global Banners */}
      <div className="flex border-b mb-6">
        <button 
          onClick={() => showSuccess("Funcionalidade de Banner de Login movida para a página de Configurações.")}
          className={`py-3 px-6 text-sm font-medium flex items-center gap-2 text-gray-500 hover:text-gray-700`}
        >
          Banner de Login (Movido)
        </button>
        <button 
          className={`py-3 px-6 text-sm font-medium flex items-center gap-2 text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50`}
        >
          <DollarSign size={16} /> Banners de Anúncio (TV Digital)
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md space-y-6 max-w-4xl">
        <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <ListOrdered size={20} className="text-indigo-600" /> Banners de Anúncio ({localBanners.length})
            </h3>
            <button
                onClick={handleAddBanner}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
                <Plus size={16} /> Adicionar Banner
            </button>
        </div>
        
        {loading ? (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="ml-4 text-gray-600">Carregando banners...</p>
            </div>
        ) : (
            <div className="space-y-4">
                {localBanners.map(pkg => {
                    const isSaving = isSavingId === pkg.id;
                    const isNew = !banners.find(p => p.id === pkg.id);
                    
                    return (
                        <div key={pkg.id} className={`p-4 border rounded-lg space-y-3 ${pkg.is_active ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-100 border-gray-300'}`}>
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-gray-800">{isNew ? 'NOVO BANNER' : pkg.name}</h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDeleteClick(pkg)}
                                        disabled={isSaving}
                                        className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
                                        title="Excluir Banner"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleSaveBanner(pkg)}
                                        disabled={isSaving}
                                        className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
                                        {isSaving ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-1">Nome</label>
                                    <input
                                        type="text"
                                        value={pkg.name}
                                        onChange={(e) => handleFieldChange(pkg.id, 'name', e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        disabled={isSaving}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-1">Ordem de Exibição</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={pkg.order_index}
                                        onChange={(e) => handleFieldChange(pkg.id, 'order_index', parseInt(e.target.value, 10) || 0)}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-medium text-gray-700 block mb-1">Conteúdo do Banner (Texto)</label>
                                <textarea
                                    value={pkg.content}
                                    onChange={(e) => handleFieldChange(pkg.id, 'content', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                    rows={2}
                                    disabled={isSaving}
                                />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-1 flex items-center gap-1">
                                        <Palette size={12} /> Cor de Fundo
                                    </label>
                                    <input
                                        type="color"
                                        value={pkg.background_color}
                                        onChange={(e) => handleFieldChange(pkg.id, 'background_color', e.target.value)}
                                        className="w-full h-8 border rounded-lg cursor-pointer"
                                        disabled={isSaving}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-1 flex items-center gap-1">
                                        <Palette size={12} /> Cor do Texto
                                    </label>
                                    <input
                                        type="color"
                                        value={pkg.text_color}
                                        onChange={(e) => handleFieldChange(pkg.id, 'text_color', e.target.value)}
                                        className="w-full h-8 border rounded-lg cursor-pointer"
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="flex flex-col justify-end">
                                    <label className="text-xs font-medium text-gray-700 block mb-1">Ativo</label>
                                    <button
                                        onClick={() => handleFieldChange(pkg.id, 'is_active', !pkg.is_active)}
                                        className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${pkg.is_active ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
                                        disabled={isSaving}
                                    >
                                        {pkg.is_active ? <Check size={16} /> : <X size={16} />}
                                        {pkg.is_active ? 'Ativo' : 'Inativo'}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Preview */}
                            <div className="mt-3 p-2 rounded-lg text-center border-2 border-dashed">
                                <p className="text-xs font-bold mb-1">Preview:</p>
                                <div 
                                    className="p-2 rounded-md"
                                    style={{ backgroundColor: pkg.background_color, color: pkg.text_color }}
                                >
                                    <p className="font-bold text-sm">{pkg.content}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão de Banner"
        description={`Tem certeza que deseja excluir o banner "${bannerToDelete?.name}"? Esta ação é irreversível.`}
        confirmText="Excluir Permanentemente"
        isConfirming={isDeleting}
        variant="danger"
      />
    </div>
  );
};

export default AdminGlobalBannersPage;