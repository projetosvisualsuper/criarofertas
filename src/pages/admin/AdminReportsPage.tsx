import React from 'react';
import { BarChart3, Users, DollarSign, Image, TrendingUp, Zap, Loader2, CheckCircle } from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdminStats';
import { PLAN_NAMES } from '../../config/constants';

const AdminReportsPage: React.FC = () => {
  const { stats, loading } = useAdminStats();
  
  // Dados de engajamento mockados para o Admin (mantendo o crescimento mensal mockado)
  const engagementStats = {
    monthlyGrowth: 15,
  };
  
  const totalArtsSaved = stats.format_usage.reduce((sum, item) => sum + item.total_count, 0);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BarChart3 size={24} /> Relatórios Gerais do SaaS
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Métricas de alto nível sobre a saúde e o uso da plataforma por todos os clientes.
      </p>
      
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="ml-4 text-gray-600">Buscando dados de relatórios...</p>
        </div>
      ) : (
        <>
          {/* Métricas de Negócio */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <div className="p-3 bg-yellow-100 rounded-full"><TrendingUp className="text-yellow-600" size={24} /></div>
              <div>
                <p className="text-sm text-gray-500">Crescimento Mensal</p>
                <p className="text-2xl font-bold">+{engagementStats.monthlyGrowth}%</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full"><Image className="text-purple-600" size={24} /></div>
              <div>
                <p className="text-sm text-gray-500">Total de Artes Salvas</p>
                <p className="text-2xl font-bold">{totalArtsSaved}</p>
              </div>
            </div>
          </div>

          {/* Gráficos de Engajamento (Substituídos por Listas de Dados) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Uso de Formatos */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-4 text-lg">Uso de Formatos</h3>
              <ul className="space-y-3">
                {stats.format_usage.length > 0 ? (
                  stats.format_usage.map((item, index) => (
                    <li key={item.format_name} className="flex justify-between items-center text-sm pb-2 border-b last:border-b-0">
                      <span className="text-gray-700">{index + 1}. {item.format_name}</span>
                      <span className="font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">{item.total_count} artes</span>
                    </li>
                  ))
                ) : (
                  <div className="text-center text-gray-400 p-4 border-2 border-dashed rounded-lg">
                    <Zap size={32} className="mx-auto mb-2" />
                    <p className="mt-2 text-sm">Nenhuma arte salva ainda.</p>
                  </div>
                )}
              </ul>
            </div>
            
            {/* Criação de Artes por Plano */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-4 text-lg">Criação de Artes por Plano</h3>
              <ul className="space-y-3">
                {stats.plan_usage.length > 0 ? (
                  stats.plan_usage.map((item, index) => (
                    <li key={item.role} className="flex justify-between items-center text-sm pb-2 border-b last:border-b-0">
                      <span className="text-gray-700 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        {PLAN_NAMES[item.role] || item.role}
                      </span>
                      <span className="font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{item.total_arts} artes</span>
                    </li>
                  ))
                ) : (
                  <div className="text-center text-gray-400 p-4 border-2 border-dashed rounded-lg">
                    <BarChart3 size={32} className="mx-auto mb-2" />
                    <p className="mt-2 text-sm">Nenhum dado de uso por plano disponível.</p>
                  </div>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReportsPage;