import React from 'react';
import { DailyArtCount } from '../hooks/useUserArtHistory';
import { BarChart3 } from 'lucide-react';

interface DailyArtChartProps {
  data: DailyArtCount[];
  loading: boolean;
}

const DailyArtChart: React.FC<DailyArtChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed">
        <div className="text-center text-gray-400">
          <BarChart3 size={48} className="mx-auto animate-pulse" />
          <p className="mt-2 text-sm">Carregando dados do histórico...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed">
        <div className="text-center text-gray-400">
          <BarChart3 size={48} className="mx-auto" />
          <p className="mt-2 text-sm">Nenhuma arte salva nos últimos 7 dias.</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1); // Garante que o máximo seja pelo menos 1
  
  // Formata a data para exibir apenas o dia e o mês
  const formatLabel = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="h-48 p-4 bg-gray-50 rounded-lg border-2 border-dashed flex flex-col justify-end">
      <div className="flex items-end h-full space-x-2">
        {data.map((item, index) => {
          const heightPercentage = (item.count / maxCount) * 90; // 90% para deixar espaço para o rótulo
          const isToday = index === data.length - 1;

          return (
            <div key={item.date} className="flex flex-col items-center justify-end flex-1 h-full">
              <div 
                className={`w-full rounded-t-md transition-all duration-500 ease-out ${isToday ? 'bg-indigo-600' : 'bg-indigo-400'}`}
                style={{ height: `${heightPercentage}%` }}
                title={`${item.count} artes em ${formatLabel(item.date)}`}
              >
                {item.count > 0 && (
                    <span className="text-[10px] text-white font-bold block text-center pt-0.5">{item.count}</span>
                )}
              </div>
              <span className="text-[10px] text-gray-600 mt-1">{formatLabel(item.date)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyArtChart;