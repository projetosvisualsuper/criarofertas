import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import { showError } from '../utils/toast';

export interface DailyArtCount {
  date: string; // YYYY-MM-DD
  count: number;
}

// Função auxiliar para obter a data N dias atrás no formato YYYY-MM-DD
const getDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

export function useUserArtHistory(userId: string | undefined) {
  const [dailyCounts, setDailyCounts] = useState<DailyArtCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    const thirtyDaysAgo = getDaysAgo(30);

    // Usamos uma função RPC (Remote Procedure Call) para agregar dados no banco de dados
    // Como não temos uma função RPC para isso, faremos a busca e agregação no frontend por enquanto.
    // No futuro, seria ideal usar uma view ou função no Supabase.
    
    // Busca todas as artes salvas pelo usuário nos últimos 30 dias
    const { data, error } = await supabase
      .from('saved_images')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo);

    if (error) {
      console.error('Error fetching user art history:', error);
      showError('Falha ao carregar histórico de artes.');
      setDailyCounts([]);
      setLoading(false);
      return;
    }
    
    // Agregação no frontend: Contar por dia
    const countsMap = new Map<string, number>();
    data.forEach(item => {
      const dateKey = item.created_at.split('T')[0]; // YYYY-MM-DD
      countsMap.set(dateKey, (countsMap.get(dateKey) || 0) + 1);
    });
    
    // Preencher os últimos 7 dias (para um gráfico mais útil)
    const history: DailyArtCount[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = getDaysAgo(i);
      history.push({
        date: date,
        count: countsMap.get(date) || 0,
      });
    }

    setDailyCounts(history);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    dailyCounts,
    loading,
    fetchHistory,
  };
}