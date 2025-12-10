import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import { showError } from '../utils/toast';

export interface AICost {
  service_key: string;
  cost: number;
  description: string;
}

// Definindo os valores padrão como um mapa simples para fácil acesso
const DEFAULT_COSTS: Record<string, number> = {
  generate_copy: 1,
  parse_products: 1,
  generate_image: 10,
  generate_ad_script: 1,
  generate_audio: 5,
};

export function useAICosts(isAdmin: boolean = false) {
  const [costs, setCosts] = useState<AICost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mapeamento rápido para uso em componentes, usando useMemo para re-calcular
  const costMap = useMemo(() => {
    const map = costs.reduce((acc, item) => {
      // Garante que o custo seja um número inteiro
      acc[item.service_key] = parseInt(item.cost as any, 10) || 0;
      return acc;
    }, {} as Record<string, number>);
    
    // Mescla com os defaults para garantir que todas as chaves existam,
    // mas os valores do DB (map) sobrescrevem os defaults.
    return { ...DEFAULT_COSTS, ...map };
  }, [costs]);

  const fetchCosts = useCallback(async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('ai_costs')
      .select('*')
      .order('service_key', { ascending: true });

    if (error) {
      console.error('Error fetching AI costs:', error);
      if (isAdmin) {
        showError('Falha ao carregar custos de IA.');
      }
      setCosts([]);
    } else {
      // Mapeia os dados, garantindo que 'cost' seja um número
      setCosts(data.map(item => ({
          ...item,
          cost: parseInt(item.cost as any, 10) || 0,
      })) as AICost[]);
    }
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);
  
  const updateCost = async (serviceKey: string, newCost: number, description: string) => {
    if (!isAdmin) {
      showError("Apenas administradores podem alterar os custos de IA.");
      return;
    }
    
    const { error } = await supabase
      .from('ai_costs')
      .upsert({ service_key: serviceKey, cost: newCost, description: description, updated_at: new Date().toISOString() }, { onConflict: 'service_key' });

    if (error) {
      console.error('Error updating AI cost:', error);
      showError(`Falha ao atualizar o custo de ${serviceKey}.`);
      throw new Error(`Falha ao atualizar o custo de ${serviceKey}.`);
    } else {
      showSuccess(`Custo de ${serviceKey} atualizado para ${newCost} créditos.`);
      await fetchCosts();
    }
  };

  return {
    costs,
    costMap, // Retorna o useMemo
    loading,
    updateCost,
    fetchCosts,
  };
}