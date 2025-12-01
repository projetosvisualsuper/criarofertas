import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from './ui/dialog';
import { Zap, Check, Loader2, ArrowRight } from 'lucide-react';
import { PLAN_NAMES, DEFAULT_PERMISSIONS_BY_ROLE, Permission } from '../config/constants';
import { Profile } from '../../types';
import { supabase } from '@/src/integrations/supabase/client';
import { showSuccess, showError } from '../utils/toast';

interface PlanUpgradeModalProps {
  profile: Profile;
  trigger: React.ReactNode;
  onPlanUpdated: (newRole: string) => void;
}

const PLANS = [
  { id: 'free', name: PLAN_NAMES.free, price: 'R$ 0 / mês', features: ['Acesso ao Builder', 'Artes para Redes Sociais', 'Banco de Produtos (Básico)'], role: 'free' },
  { id: 'premium', name: PLAN_NAMES.premium, price: 'R$ 99 / mês', features: ['Tudo do Grátis', 'TV Digital (Slides)', 'Anúncios Áudio/Vídeo', 'Dados da Empresa', 'Relatórios (Visualização)'], role: 'premium' },
  { id: 'pro', name: PLAN_NAMES.pro, price: 'R$ 199 / mês', features: ['Tudo do Premium', 'Gerenciamento de Usuários', 'Configurações de Integração', 'Suporte Prioritário'], role: 'pro' },
];

const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({ profile, trigger, onPlanUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentPlan = profile.role;

  const handleUpgrade = async (newRole: string) => {
    if (newRole === currentPlan) return;

    setIsLoading(true);
    
    // 1. Obter as novas permissões
    const newPermissions = DEFAULT_PERMISSIONS_BY_ROLE[newRole] || DEFAULT_PERMISSIONS_BY_ROLE.free;
    
    // 2. Atualizar o perfil no Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ 
        role: newRole, 
        permissions: newPermissions as Permission[],
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    setIsLoading(false);

    if (error) {
      console.error('Error updating plan:', error);
      showError('Falha ao atualizar o plano. Tente novamente.');
    } else {
      showSuccess(`Parabéns! Seu plano foi atualizado para ${PLAN_NAMES[newRole]}.`);
      onPlanUpdated(newRole); // Notifica o App para recarregar o perfil
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[900px] bg-white rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center text-indigo-600 flex items-center justify-center gap-2">
            <Zap size={32} />
            Escolha o Plano Ideal
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Seu plano atual é: <span className="font-bold text-indigo-600">{PLAN_NAMES[currentPlan]}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {PLANS.map((plan) => {
            const isCurrent = plan.role === currentPlan;
            const isUpgrade = !isCurrent && (plan.role === 'premium' || plan.role === 'pro');
            const isDowngrade = !isCurrent && plan.role === 'free' && currentPlan !== 'free';

            return (
              <div 
                key={plan.id} 
                className={`p-6 rounded-xl shadow-lg border-4 transition-all ${
                  isCurrent 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : isUpgrade 
                      ? 'border-gray-200 hover:border-indigo-400' 
                      : 'border-gray-200 bg-gray-50'
                } flex flex-col`}
              >
                <h4 className="text-2xl font-bold mb-2" style={{ color: isCurrent ? '#4f46e5' : '#1f2937' }}>{plan.name}</h4>
                <p className="text-4xl font-black mb-4">{plan.price}</p>
                
                <div className="flex-1 space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <p key={index} className="flex items-start text-sm text-gray-700">
                      <Check size={16} className="text-green-500 mr-2 mt-1 shrink-0" />
                      {feature}
                    </p>
                  ))}
                </div>
                
                <button
                  onClick={() => handleUpgrade(plan.role)}
                  disabled={isCurrent || isLoading}
                  className={`w-full py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white cursor-default opacity-80'
                      : isUpgrade
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-800 shadow-md'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : isCurrent ? (
                    'Plano Atual'
                  ) : isUpgrade ? (
                    <>
                      Fazer Upgrade <ArrowRight size={16} />
                    </>
                  ) : (
                    'Selecionar Plano'
                  )}
                </button>
                {isDowngrade && <p className="text-xs text-center text-red-500 mt-2">Atenção: Isso simula um downgrade.</p>}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-500">
            * Este é um ambiente de demonstração. O upgrade simula a alteração do seu plano no banco de dados.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanUpgradeModal;