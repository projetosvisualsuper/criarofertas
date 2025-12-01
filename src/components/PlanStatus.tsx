import React from 'react';
import { Zap, ArrowUpCircle } from 'lucide-react';
import { Profile } from '../../types';
import { PLAN_NAMES } from '../config/constants';
import PlanUpgradeModal from './PlanUpgradeModal';

interface PlanStatusProps {
  profile: Profile;
  onPlanUpdated: (newRole: string) => void;
}

const PlanStatus: React.FC<PlanStatusProps> = ({ profile, onPlanUpdated }) => {
  const currentPlan = profile.role;
  const isFree = currentPlan === 'free';
  const planName = PLAN_NAMES[currentPlan] || currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);

  return (
    <div className="p-4 border-t border-gray-700 flex flex-col space-y-2 flex-shrink-0 bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={16} className={isFree ? 'text-gray-400' : 'text-yellow-400'} />
          <span className="text-xs font-semibold text-white">Seu Plano:</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isFree ? 'bg-gray-600 text-white' : 'bg-yellow-500 text-gray-900'}`}>
          {planName}
        </span>
      </div>
      
      {isFree && (
        <PlanUpgradeModal 
          profile={profile} 
          onPlanUpdated={onPlanUpdated}
          trigger={
            <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">
              <ArrowUpCircle size={14} /> Fazer Upgrade
            </button>
          }
        />
      )}
      {!isFree && (
        <PlanUpgradeModal 
          profile={profile} 
          onPlanUpdated={onPlanUpdated}
          trigger={
            <button className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors">
              Ver detalhes dos planos
            </button>
          }
        />
      )}
    </div>
  );
};

export default PlanStatus;