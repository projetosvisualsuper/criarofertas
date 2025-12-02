import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import { showError } from '../utils/toast';

export interface FormatUsage {
  format_name: string;
  total_count: number;
}

export interface PlanUsage {
  role: string;
  total_arts: number;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  paid_subscriptions: number;
  recent_signups_7d: number;
  format_usage: FormatUsage[]; // Novo
  plan_usage: PlanUsage[]; // Novo
}

const initialStats: AdminStats = {
  total_users: 0,
  active_users: 0,
  paid_subscriptions: 0,
  recent_signups_7d: 0,
  format_usage: [],
  plan_usage: [],
};

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    
    try {
      // 1. Buscar dados principais (single row view)
      const { data: mainData, error: mainError } = await supabase
        .from('admin_dashboard_stats')
        .select('*')
        .single();

      if (mainError && mainError.code !== 'PGRST116') throw mainError;
      
      // 2. Buscar uso de formatos
      const { data: formatData, error: formatError } = await supabase
        .from('admin_format_usage_view')
        .select('*');
        
      if (formatError) throw formatError;
      
      // 3. Buscar uso por plano
      const { data: planData, error: planError } = await supabase
        .from('admin_plan_usage_view')
        .select('*');
        
      if (planError) throw planError;

      const mainStats = mainData || initialStats;

      setStats({
        total_users: parseInt(mainStats.total_users as any, 10) || 0,
        active_users: parseInt(mainStats.active_users as any, 10) || 0,
        paid_subscriptions: parseInt(mainStats.paid_subscriptions as any, 10) || 0,
        recent_signups_7d: parseInt(mainStats.recent_signups_7d as any, 10) || 0,
        format_usage: formatData as FormatUsage[],
        plan_usage: planData as PlanUsage[],
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
      showError('Falha ao carregar estatísticas do painel de administração.');
      setStats(initialStats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, fetchStats };
}