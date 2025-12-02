import React from 'react';
import { Users } from 'lucide-react';
import UserManagementPage from '../UserManagementPage'; // Reutilizando o componente existente

const AdminUserManagementPage: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Users size={24} /> Gerenciamento de Clientes
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Visualize e gerencie todos os usuários do sistema. No futuro, você poderá editar planos e permissões aqui.
      </p>
      {/* Reutilizamos a página de gerenciamento de usuários, que já lista todos os perfis */}
      <div className="bg-gray-100 rounded-lg">
        <UserManagementPage />
      </div>
    </div>
  );
};

export default AdminUserManagementPage;