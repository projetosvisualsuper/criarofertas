import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import { showError } from '../utils/toast';
import { Permission } from '../../types';

export interface PlanConfiguration {
  role: string;
  name: string;
  price: string;
  permissions: Permission[];
}

export function usePlanConfigurations(isAdmin: boolean) {
  const [plans, setPlans] = useState<PlanConfiguration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('role', { ascending: true }); // Ordena para consistência

    if (error) {
      console.error('Error fetching plan configurations:', error);
      showError('Falha ao carregar configurações de planos.');
      setPlans([]);
    } else {
      setPlans(data as PlanConfiguration[]);
    }
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);
  
  const updatePlan = async (role: string, updates: Partial<PlanConfiguration>) => {
    if (!isAdmin) return;
    
    const { error } = await supabase
      .from('plan_configurations')
      .update(updates)
      .eq('role', role);

    if (error) {
      console.error('Error updating plan configuration:', error);
      showError(`Falha ao atualizar o plano ${role}.`);
    } else {
      showSuccess(`Plano ${updates.name || role} atualizado com sucesso!`);
      fetchPlans(); // Recarrega a lista
    }
  };

  return {
    plans,
    loading,
    updatePlan,
    fetchPlans,
  };
}