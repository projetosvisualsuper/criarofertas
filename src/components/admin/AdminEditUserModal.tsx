import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Profile } from '../../../types';
import { supabase } from '@/src/integrations/supabase/client';
import { PLAN_NAMES, Permission } from '../../config/constants';
import { showSuccess, showError } from '../../utils/toast';
import { Loader2, Save } from 'lucide-react';
import { usePlanConfigurations } from '../../hooks/usePlanConfigurations'; // Importando hook de planos

interface AdminEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onUserUpdated: () => void;
}

const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({ isOpen, onClose, profile, onUserUpdated }) => {
  const { plans, loading: loadingPlans } = usePlanConfigurations(true); // Busca todos os planos
  const [newRole, setNewRole] = useState(profile?.role || 'free');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setNewRole(profile.role);
    }
  }, [profile]);

  if (!profile) return null;
  
  const selectedPlanConfig = useMemo(() => {
      return plans.find(p => p.role === newRole);
  }, [plans, newRole]);

  const handleSave = async () => {
    setIsLoading(true);

    if (!selectedPlanConfig) {
      showError(`Plano "${newRole}" inválido ou não carregado.`);
      setIsLoading(false);
      return;
    }

    // 1. Atualiza o perfil com o novo role e as permissões dinâmicas.
    // Usamos .select('id') para verificar se alguma linha foi realmente afetada.
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: newRole,
        permissions: selectedPlanConfig.permissions, // Usando permissões dinâmicas
        updated_at: new Date().toISOString(), // Força a atualização do timestamp
      })
      .eq('id', profile.id)
      .select('id'); // Solicita o retorno do ID para verificar se a linha foi afetada

    setIsLoading(false);

    if (error) {
      console.error('Error updating user plan:', error);
      showError(`Falha ao atualizar o plano de ${profile.username || profile.id}. Detalhe: ${error.message}`);
    } else if (!data || data.length === 0) {
      // Se não houver erro, mas 0 linhas afetadas, é uma falha de RLS.
      showError(`Falha na atualização do plano. A permissão de administrador pode ter sido negada pelo banco de dados (RLS).`);
    } else {
      showSuccess(`Plano de ${profile.username || profile.id} atualizado para ${PLAN_NAMES[newRole]}.`);
      onUserUpdated(); // Força o recarregamento da lista na página pai
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle>Editar Perfil de Usuário</DialogTitle>
          <DialogDescription>
            Alterando o plano de <span className="font-bold">{profile.username || profile.id}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label htmlFor="plan-select" className="text-sm font-medium text-gray-700 block mb-1">
              Plano (Role)
            </label>
            {loadingPlans ? (
                <div className="flex items-center justify-center h-10 bg-gray-50 rounded-lg">
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                </div>
            ) : (
                <select
                  id="plan-select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  {plans.map(plan => (
                    <option key={plan.role} value={plan.role}>
                      {plan.name}
                    </option>
                  ))}
                </select>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Alterar o plano irá substituir as permissões do usuário pelas permissões padrão do novo plano e recarregar os créditos de IA.
          </p>
        </div>
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={isLoading || newRole === profile.role || loadingPlans}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Salvar Alterações
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEditUserModal;