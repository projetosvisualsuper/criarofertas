import React from 'react';
import { BarChart3, Image, Tag, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserArtHistory } from '../hooks/useUserArtHistory';
import DailyArtChart from '../components/DailyArtChart';

const ReportsPage: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { dailyCounts, loading: loadingHistory } = useUserArtHistory(userId);

  // Dados de exemplo que seriam carregados de uma API no futuro
  const stats = {
    totalArts: 128, // Estes dados precisam ser buscados
    mostUsedFormat: 'Story / TikTok', // Estes dados precisam ser buscados
    popularProducts: [
      { name: 'Leite Integral 1L', count: 45 },
      { name: 'Picanha Friboi', count: 32 },
      { name: 'Cerveja Heineken', count: 28 },
    ],
    monthlyGrowth: 15,
  };
  
  // Calculando o total de artes salvas pelo usuário nos últimos 7 dias (para o card)
  const totalArtsLast7Days = dailyCounts.reduce((sum, item) => sum + item.count, 0);
  
  // Mock de dados para os cards (mantendo a estrutura atual)
  const mockStats = {
    totalArts: totalArtsLast7Days > 0 ? totalArtsLast7Days : 0,
    mostUsedFormat: 'Story / TikTok', 
    popularProducts: [
      { name: 'Leite Integral 1L', count: 45 },
      { name: 'Picanha Friboi', count: 32 },
      { name: 'Cerveja Heineken', count: 28 },
    ],
    monthlyGrowth: 15,
  };


  return (
    <div className="flex-1 flex flex-col p-8 bg-gray-100 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <BarChart3 size={32} className="text-indigo-600" />
        Relatórios de Desempenho
      </h2>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full"><Image className="text-blue-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Artes Criadas (7d)</p>
            <p className="text-2xl font-bold">{loadingHistory ? <Loader2 size={24} className="animate-spin" /> : mockStats.totalArts}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full"><Tag className="text-green-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Formato Mais Usado</p>
            <p className="text-lg font-bold">{mockStats.mostUsedFormat}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-full"><TrendingUp className="text-yellow-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Crescimento (Mês)</p>
            <p className="text-2xl font-bold">+{mockStats.monthlyGrowth}%</p>
          </div>
        </div>
      </div>

      {/* Seção de Gráficos e Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Produtos Mais Populares */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold mb-4 text-lg">Produtos Mais Utilizados em Artes</h3>
          <ul className="space-y-3">
            {mockStats.popularProducts.map((product, index) => (
              <li key={index} className="flex justify-between items-center text-sm pb-2 border-b last:border-b-0">
                <span className="text-gray-700">{index + 1}. {product.name}</span>
                <span className="font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">{product.count} vezes</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Gráfico de Criação de Artes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold mb-4 text-lg">Criação de Artes por Dia (Últimos 7 dias)</h3>
          <DailyArtChart data={dailyCounts} loading={loadingHistory} />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;