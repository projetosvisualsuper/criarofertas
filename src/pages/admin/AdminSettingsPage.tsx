import React, { useState, useEffect } from 'react';
import { Settings, Key, ToggleLeft, ToggleRight, Loader2, Bell, Save, XCircle, Trash2, DollarSign, Layout, Check, Plus, ListOrdered, Palette } from 'lucide-react';
import { useGlobalSettings } from '../../hooks/useGlobalSettings';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '@/src/integrations/supabase/client';
import { showSuccess, showError } from '../../utils/toast';
import AdminAICostsPage from './AdminAICostsPage';
import { useLoginBannerSettings, LoginBannerSettings } from '../../hooks/useLoginBannerSettings'; // Importando hook de login banner

// Componente de Configuração do Banner de Login (Integrado)
const LoginBannerSettingsComponent: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
    const { settings, loading: loadingSettings } = useLoginBannerSettings();
    
    const [localSettings, setLocalSettings] = useState<LoginBannerSettings>(settings);
    const [isSaving, setIsSaving] = useState(false);
    const [isGradientActive, setIsGradientActive] = useState(!!settings.bannerGradientEndColor);

    useEffect(() => {
        setLocalSettings(settings);
        setIsGradientActive(!!settings.bannerGradientEndColor);
    }, [settings]);

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...localSettings.features];
        newFeatures[index] = value;
        setLocalSettings(prev => ({ ...prev, features: newFeatures }));
    };

    const handleAddFeature = () => {
        setLocalSettings(prev => ({ ...prev, features: [...prev.features, 'Novo Recurso'] }));
    };

    const handleRemoveFeature = (index: number) => {
        setLocalSettings(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
    };
    
    const handleToggleGradient = () => {
        setIsGradientActive(prev => {
            const newState = !prev;
            if (!newState) {
                setLocalSettings(prev => ({ ...prev, bannerGradientEndColor: null }));
            } else if (!localSettings.bannerGradientEndColor) {
                setLocalSettings(prev => ({ ...prev, bannerGradientEndColor: '#4f46e5' }));
            }
            return newState;
        });
    };

    const handleSave = async () => {
        if (!isAdmin) {
            showError("Apenas administradores podem salvar estas configurações.");
            return;
        }
        if (!localSettings.title.trim()) {
            showError("O título é obrigatório.");
            return;
        }
        
        setIsSaving(true);
        
        const { data: existingData, error: fetchError } = await supabase
            .from('login_banner_settings')
            .select('id')
            .limit(1)
            .single();
            
        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching existing ID:', fetchError);
            showError('Falha ao buscar ID de configuração.');
            setIsSaving(false);
            return;
        }
        
        const idToUpdate = existingData?.id;
        
        const finalBannerGradientEndColor = isGradientActive 
            ? localSettings.bannerGradientEndColor 
            : null;
            
        const dataToSave = {
            title: localSettings.title,
            subtitle: localSettings.subtitle,
            features: localSettings.features.filter(f => f.trim().length > 0),
            banner_color: localSettings.bannerColor,
            banner_gradient_end_color: finalBannerGradientEndColor,
            updated_at: new Date().toISOString(),
        };

        let saveError = null;

        if (idToUpdate) {
            const { error } = await supabase
                .from('login_banner_settings')
                .update(dataToSave)
                .eq('id', idToUpdate);
            saveError = error;
        } else {
            const insertData = {
                ...dataToSave,
                id: crypto.randomUUID(),
            };
            
            const { error } = await supabase
                .from('login_banner_settings')
                .insert(insertData);
            saveError = error;
        }

        setIsSaving(false);

        if (saveError) {
            console.error('Error saving login banner settings:', saveError);
            showError('Falha ao salvar configurações do banner.');
        } else {
            showSuccess('Configurações do banner de login salvas com sucesso!');
        }
    };

    if (loadingSettings) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <p className="ml-4 text-gray-600">Carregando configurações do banner...</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* Título e Subtítulo */}
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Título Principal</label>
                    <input
                        type="text"
                        value={localSettings.title}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        disabled={isSaving}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Subtítulo / Descrição</label>
                    <textarea
                        value={localSettings.subtitle}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        rows={3}
                        disabled={isSaving}
                    />
                </div>
            </div>
            
            {/* Cor do Banner */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Palette size={20} className="text-indigo-600" /> Cor do Banner
                </h3>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-medium text-gray-700">Usar Gradiente (Degradê)</p>
                    <button 
                        onClick={handleToggleGradient}
                        className={`p-1 rounded-full transition-colors ${isGradientActive ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                        title={isGradientActive ? "Desativar Gradiente" : "Ativar Gradiente"}
                    >
                        {isGradientActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block mb-1">Cor Inicial</label>
                        <input
                            type="color"
                            value={localSettings.bannerColor}
                            onChange={(e) => setLocalSettings(prev => ({ ...prev, bannerColor: e.target.value }))}
                            className="w-full h-12 border rounded-lg cursor-pointer"
                            disabled={isSaving}
                        />
                        <input
                            type="text"
                            value={localSettings.bannerColor}
                            onChange={(e) => setLocalSettings(prev => ({ ...prev, bannerColor: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="#RRGGBB"
                            disabled={isSaving}
                        />
                    </div>
                    
                    {isGradientActive && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block mb-1">Cor Final do Gradiente</label>
                            <input
                                type="color"
                                value={localSettings.bannerGradientEndColor || '#4f46e5'}
                                onChange={(e) => setLocalSettings(prev => ({ ...prev, bannerGradientEndColor: e.target.value }))}
                                className="w-full h-12 border rounded-lg cursor-pointer"
                                disabled={isSaving}
                            />
                            <input
                                type="text"
                                value={localSettings.bannerGradientEndColor || '#4f46e5'}
                                onChange={(e) => setLocalSettings(prev => ({ ...prev, bannerGradientEndColor: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="#RRGGBB"
                                disabled={isSaving}
                            />
                        </div>
                    )}
                </div>
            </div>
            
            {/* Lista de Recursos */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <ListOrdered size={20} className="text-indigo-600" /> Recursos em Destaque
                </h3>
                
                <div className="space-y-2">
                    {localSettings.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Recurso em destaque"
                                disabled={isSaving}
                            />
                            <button
                                onClick={() => handleRemoveFeature(index)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                title="Remover Recurso"
                                disabled={isSaving}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
                
                <button
                    onClick={handleAddFeature}
                    className="flex items-center gap-1 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-lg transition-colors"
                    disabled={isSaving}
                >
                    <Plus size={16} /> Adicionar Recurso
                </button>
            </div>
            
            <div className="flex justify-end pt-4 border-t">
                <button
                    onClick={handleSave}
                    disabled={isSaving || !localSettings.title.trim()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Salvar Configurações
                </button>
            </div>
        </div>
    );
};

const AdminSettingsPage: React.FC = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const { settings, loading: loadingGlobalSettings, updateMaintenanceMode } = useGlobalSettings(isAdmin);

  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [activeAnnouncement, setActiveAnnouncement] = useState<{ id: string; message: string | string[] } | null>(null);
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  const [loadingAnnouncement, setLoadingAnnouncement] = useState(true);
  
  const isMaintenanceEnabled = settings.maintenance_mode.enabled;
  const [activeTab, setActiveTab] = useState<'general' | 'ai-costs' | 'login-banner'>('general');

  const handleToggleMaintenance = () => {
    updateMaintenanceMode(!isMaintenanceEnabled);
  };
  
  // --- Lógica de Anúncios Globais ---
  
  const fetchActiveAnnouncement = async () => {
    setLoadingAnnouncement(true);
    const { data, error } = await supabase
      .from('global_announcements')
      .select('id, message')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching active announcement:', error);
    } else if (data) {
      setActiveAnnouncement(data);
      
      const messageToEdit = Array.isArray(data.message) 
        ? data.message.join('\n') 
        : (typeof data.message === 'string' ? data.message : '');
        
      setAnnouncementMessage(messageToEdit);
    } else {
      setActiveAnnouncement(null);
      setAnnouncementMessage('');
    }
    setLoadingAnnouncement(false);
  };
  
  useEffect(() => {
    if (isAdmin) {
      fetchActiveAnnouncement();
    }
  }, [isAdmin]);

  const handleSaveAnnouncement = async () => {
    if (!announcementMessage.trim()) {
      showError("A mensagem do anúncio não pode ser vazia.");
      return;
    }
    
    setIsSavingAnnouncement(true);
    
    try {
      const lines = announcementMessage.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
        
      if (lines.length === 0) {
        showError("A mensagem do anúncio não pode ser vazia.");
        setIsSavingAnnouncement(false);
        return;
      }
      
      const { error: deactivateError } = await supabase
          .from('global_announcements')
          .update({ is_active: false })
          .eq('is_active', true)
          .select();
          
      if (deactivateError) console.warn("Warning: Failed to deactivate old announcements:", deactivateError);
      
      const { error } = await supabase
        .from('global_announcements')
        .insert({ message: lines, is_active: true });
        
      if (error) throw error;
      
      showSuccess("Novo anúncio global publicado com sucesso!");
      fetchActiveAnnouncement();
      
    } catch (error) {
      console.error("Error saving announcement:", error);
      showError("Falha ao publicar o anúncio.");
    } finally {
      setIsSavingAnnouncement(false);
    }
  };
  
  const handleDeactivateAnnouncement = async () => {
    if (!activeAnnouncement) return;
    
    setIsSavingAnnouncement(true);
    
    try {
      const { error } = await supabase
        .from('global_announcements')
        .update({ is_active: false })
        .eq('id', activeAnnouncement.id)
        .select();
        
      if (error) throw error;
      
      showSuccess("Anúncio global desativado.");
      fetchActiveAnnouncement();
      
    } catch (error) {
      console.error("Error deactivating announcement:", error);
      showError("Falha ao desativar o anúncio.");
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-100">
        <p className="text-gray-500">Acesso negado. Apenas administradores podem ver esta página.</p>
      </div>
    );
  }

  // Prepara a mensagem ativa para exibição no painel
  const activeMessageDisplay = activeAnnouncement?.message 
    ? (Array.isArray(activeAnnouncement.message) ? activeAnnouncement.message.join(' | ') : activeAnnouncement.message)
    : 'Nenhum anúncio ativo.';

  return (
    <div className="flex-1 flex flex-col p-8 bg-gray-100 overflow-y-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Settings size={32} className="text-indigo-600" />
        Configurações Gerais do Sistema
      </h2>
      
      {/* Tabs de Navegação */}
      <div className="flex border-b mb-6">
        <button 
          onClick={() => setActiveTab('general')}
          className={`py-3 px-6 text-sm font-medium flex items-center gap-2 transition-colors ${
            activeTab === 'general' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings size={16} /> Geral
        </button>
        <button 
          onClick={() => setActiveTab('ai-costs')}
          className={`py-3 px-6 text-sm font-medium flex items-center gap-2 transition-colors ${
            activeTab === 'ai-costs' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <DollarSign size={16} /> Custos de IA
        </button>
        <button 
          onClick={() => setActiveTab('login-banner')}
          className={`py-3 px-6 text-sm font-medium flex items-center gap-2 transition-colors ${
            activeTab === 'login-banner' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layout size={16} /> Banner de Login
        </button>
      </div>
      
      <div className="max-w-4xl w-full">
        {activeTab === 'general' && (
            <div className="bg-white p-6 rounded-xl shadow-md space-y-8">
                
                {/* Modo Manutenção */}
                <div className="border-b pb-6">
                <h3 className="font-semibold text-lg mb-2">Modo Manutenção</h3>
                {loadingGlobalSettings ? (
                    <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    </div>
                ) : (
                    <div className={`flex items-center justify-between p-4 rounded-md border transition-colors ${isMaintenanceEnabled ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
                    <p className={`text-sm font-medium ${isMaintenanceEnabled ? 'text-red-800' : 'text-green-800'}`}>
                        {isMaintenanceEnabled ? 'Modo Manutenção ATIVADO. Apenas admins podem acessar.' : 'Modo Manutenção DESATIVADO. Acesso normal.'}
                    </p>
                    <button 
                        onClick={handleToggleMaintenance}
                        className={`p-1 rounded-full transition-colors ${isMaintenanceEnabled ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                        title={isMaintenanceEnabled ? "Desativar Manutenção" : "Ativar Manutenção"}
                    >
                        {isMaintenanceEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                    </div>
                )}
                <p className="text-xs text-gray-500 mt-2">Ativar esta opção restringe o acesso ao aplicativo apenas para usuários com o papel 'admin'.</p>
                </div>

                {/* Anúncios Globais */}
                <div className="border-b pb-6">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Bell size={20} className="text-yellow-600" /> Anúncios Globais (Banner Superior)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Publique uma ou mais mensagens (uma por linha) que serão exibidas em rotação no banner superior.
                </p>
                
                {loadingAnnouncement ? (
                    <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    </div>
                ) : activeAnnouncement ? (
                    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg space-y-3">
                    <p className="text-sm font-bold text-yellow-800 flex items-center gap-2">
                        <Bell size={16} /> Anúncio Ativo:
                    </p>
                    <p className="text-sm text-gray-700 italic border-l-4 border-yellow-500 pl-3 whitespace-pre-wrap">
                        {activeMessageDisplay}
                    </p>
                    <button
                        onClick={handleDeactivateAnnouncement}
                        disabled={isSavingAnnouncement}
                        className="flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isSavingAnnouncement ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Desativar Anúncio
                    </button>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 p-2 border rounded-lg">Nenhum anúncio ativo no momento.</p>
                )}
                
                <div className="mt-4 space-y-3">
                    <textarea
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    rows={3}
                    placeholder="Digite a nova mensagem de anúncio global aqui. Use ENTER para criar uma nova linha que será exibida em rotação."
                    disabled={isSavingAnnouncement}
                    />
                    <button
                    onClick={handleSaveAnnouncement}
                    disabled={isSavingAnnouncement || !announcementMessage.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                    >
                    {isSavingAnnouncement ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Publicar Novo Anúncio
                    </button>
                </div>
                </div>
                
                {/* Integrações de Pagamento (Atualizado) */}
                <div className="border-b pb-6">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <Key size={20} className="text-blue-600" /> Integrações de Pagamento
                    </h3>
                    <p className="text-sm text-gray-600">
                        O sistema utiliza o Mercado Pago para gerenciar assinaturas de planos e compras avulsas de créditos.
                    </p>
                    <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1 pl-2 mt-3">
                        <li>Obtenha seu <strong>Access Token</strong> e defina um <strong>Token Secreto de Webhook</strong> no painel do Mercado Pago.</li>
                        <li>No Supabase, adicione os segredos: <code className="font-mono bg-blue-100 p-0.5 rounded">MERCADOPAGO_ACCESS_TOKEN</code> e <code className="font-mono bg-blue-100 p-0.5 rounded">MERCADOPAGO_WEBHOOK_SECRET</code>.</li>
                        <li>Configure o Webhook no Mercado Pago para enviar notificações de pagamento para o endpoint:
                            <code className="font-mono bg-blue-100 p-0.5 rounded block mt-2 text-xs break-all">
                                https://cdktwczejznbqfzmizpu.supabase.co/functions/v1/mercadopago-webhook-handler
                            </code>
                        </li>
                        <li className="text-red-700 font-bold mt-2">
                            ⚠️ O webhook agora processa tanto assinaturas de planos (tópico `preapproval`) quanto compras de créditos (tópico `payment`).
                        </li>
                    </ol>
                </div>
                
                {/* Outras Configurações (Mantido) */}
                <div className="pt-6">
                    <p className="text-gray-500">Outras configurações...</p>
                </div>
            </div>
        )}
        
        {activeTab === 'ai-costs' && (
            <div className="bg-white p-6 rounded-xl shadow-md">
                <AdminAICostsPage />
            </div>
        )}
        
        {activeTab === 'login-banner' && (
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Layout size={20} className="text-blue-600" /> Configurações do Banner de Login
                </h3>
                <LoginBannerSettingsComponent isAdmin={isAdmin} />
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;