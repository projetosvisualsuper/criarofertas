import React from 'react';
import { Zap, CheckCircle } from 'lucide-react';
import { PLAN_NAMES, DEFAULT_PERMISSIONS_BY_ROLE } from '../../config/constants';

const AdminPlanManagementPage: React.FC = () => {
  const plans = ['free', 'premium', 'pro'];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Zap size={24} /> Gerenciamento de Planos
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Visualize os planos e as permissões associadas. No futuro, você poderá editar os recursos de cada plano aqui.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(planId => (
          <div key={planId} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500">
            <h3 className="text-xl font-bold text-indigo-600 mb-4">{PLAN_NAMES[planId]}</h3>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Permissões Incluídas:</h4>
              <ul className="space-y-1">
                {(DEFAULT_PERMISSIONS_BY_ROLE[planId] || []).map(permission => (
                  <li key={permission} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle size={14} className="text-green-500" />
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPlanManagementPage;