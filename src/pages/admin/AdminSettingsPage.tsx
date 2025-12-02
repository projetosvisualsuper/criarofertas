import React from 'react';
import { Settings, ToggleLeft, Bell } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Settings size={24} /> Configurações Gerais do Sistema
      </h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Modo Manutenção</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md border">
            <p className="text-sm text-gray-600">Ativar o modo manutenção para todos os usuários.</p>
            <button className="text-gray-400 cursor-not-allowed" disabled>
              <ToggleLeft size={32} />
            </button>
          </div>
           <p className="text-xs text-gray-500 mt-2">Funcionalidade em desenvolvimento.</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">Anúncios Globais</h3>
           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md border">
            <p className="text-sm text-gray-600">Enviar uma notificação para todos os usuários.</p>
            <button className="text-gray-400 cursor-not-allowed" disabled>
              <Bell size={24} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Funcionalidade em desenvolvimento.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;