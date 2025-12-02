import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import { showError } from '../utils/toast';

export interface AdminStats {
  total_users: number;
  active_users: number;
  paid_subscriptions: number;
  recent_signups_7d: number;
}

const initialStats: AdminStats = {
  total_users: 0,
  active_users: 0,
  paid_subscriptions: 0,
  recent_signups_7d: 0,
};

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    
    // Busca dados da view admin_dashboard_stats
    const { data, error } = await supabase
      .from('admin_dashboard_stats')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching admin stats:', error);
      showError('Falha ao carregar estatísticas do painel de administração.');
      setStats(initialStats);
    } else if (data) {
      // O Supabase retorna strings para números grandes, então convertemos para garantir
      setStats({
        total_users: parseInt(data.total_users as any, 10) || 0,
        active_users: parseInt(data.active_users as any, 10) || 0,
        paid_subscriptions: parseInt(data.paid_subscriptions as any, 10) || 0,
        recent_signups_7d: parseInt(data.recent_signups_7d as any, 10) || 0,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, fetchStats };
}