import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import { showError, showSuccess } from '../utils/toast';
import { HeaderTemplate, PosterTheme } from '../../types';

// Define a estrutura do DB
interface GlobalHeaderTemplateDB {
  id: string;
  name: string;
  thumbnail: string | null;
  theme: Partial<PosterTheme>;
}

const mapFromDB = (item: GlobalHeaderTemplateDB): HeaderTemplate => ({
  id: item.id,
  name: item.name,
  thumbnail: item.thumbnail || '',
  theme: item.theme,
});

const CACHE_KEY = 'global_header_templates_cache';
const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hora de cache

export function useGlobalHeaderTemplates(isAdmin: boolean = false) {
  const [globalTemplates, setGlobalTemplates] = useState<HeaderTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    
    // 1. Tentar carregar do cache
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
          setGlobalTemplates(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Failed to parse global templates cache.");
        localStorage.removeItem(CACHE_KEY); // Limpa cache inválido
      }
    }

    // 2. Buscar do Supabase
    const { data, error } = await supabase
      .from('global_header_templates')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching global header templates:', error);
      showError('Falha ao carregar templates de cabeçalho globais.');
      setGlobalTemplates([]);
    } else {
      const templates = data.map(mapFromDB);
      setGlobalTemplates(templates);
      
      // 3. Salvar no cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: templates,
        timestamp: Date.now(),
      }));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Funções de mutação (add/delete) devem invalidar o cache
  const addGlobalTemplate = async (template: Omit<HeaderTemplate, 'id'>) => {
    if (!isAdmin) return null;
    
    const templateForDb = {
        name: template.name,
        thumbnail: template.thumbnail,
        theme: template.theme,
    };

    const { data, error } = await supabase
      .from('global_header_templates')
      .insert(templateForDb)
      .select()
      .single();

    if (error) {
      console.error('Error adding global header template:', error);
      showError(`Falha ao salvar o template global "${template.name}".`);
      return null;
    }
    
    // Invalida o cache e recarrega
    localStorage.removeItem(CACHE_KEY);
    const newTemplate = mapFromDB(data);
    setGlobalTemplates(prev => [newTemplate, ...prev]);
    return newTemplate;
  };

  const deleteGlobalTemplate = async (id: string) => {
    if (!isAdmin) return;
    
    const { error } = await supabase
      .from('global_header_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting global header template:', error);
      showError('Falha ao excluir o template global.');
    } else {
      // Invalida o cache e atualiza o estado
      localStorage.removeItem(CACHE_KEY);
      setGlobalTemplates(prev => prev.filter(t => t.id !== id));
      showSuccess('Template global excluído com sucesso.');
    }
  };

  return {
    globalTemplates,
    addGlobalTemplate,
    deleteGlobalTemplate,
    loading,
    fetchTemplates,
  };
}