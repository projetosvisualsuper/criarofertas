import React from 'react';
import { Home, Users, DollarSign, Clock, Loader2 } from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdminStats';

const AdminDashboardPage: React.FC = () => {
  const { stats, loading } = useAdminStats();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="ml-4 text-gray-600">Carregando dados do sistema...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard do Administrador</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full"><Users className="text-blue-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Total de Clientes</p>
            <p className="text-2xl font-bold">{stats.total_users}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full"><DollarSign className="text-green-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Assinaturas Pagas</p>
            <p className="text-2xl font-bold">{stats.paid_subscriptions}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-full"><Clock className="text-yellow-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Usuários Ativos</p>
            <p className="text-2xl font-bold">{stats.active_users}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-full"><Home className="text-indigo-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Novos Cadastros (7d)</p>
            <p className="text-2xl font-bold">{stats.recent_signups_7d}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold mb-4">Atividades Recentes</h3>
        <p className="text-gray-500 text-sm">Em breve: um feed de atividades do sistema.</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;