import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import { Shield, LogIn } from 'lucide-react';
import { showSuccess } from '../utils/toast';

const ReturnToAdminBanner: React.FC = () => {
  // Armazena apenas os tokens necessários
  const [adminTokens, setAdminTokens] = useState<{ access_token: string; refresh_token: string } | null>(null);

  useEffect(() => {
    // MUDANÇA AQUI: Lendo do sessionStorage
    const storedTokens = sessionStorage.getItem('admin_impersonation_token');
    if (storedTokens) {
      try {
        // Espera um objeto com access_token e refresh_token
        setAdminTokens(JSON.parse(storedTokens));
      } catch (e) {
        console.error("Failed to parse admin tokens from sessionStorage", e);
        sessionStorage.removeItem('admin_impersonation_token');
      }
    }
  }, []);

  const handleReturnToAdmin = async () => {
    if (!adminTokens) return;

    // Restaura a sessão do administrador usando setSession com os tokens
    const { error } = await supabase.auth.setSession({
      access_token: adminTokens.access_token,
      refresh_token: adminTokens.refresh_token,
    });

    if (error) {
      console.error("Failed to restore admin session:", error);
      // Se falhar, limpe e force o logout
      sessionStorage.removeItem('admin_impersonation_token');
      await supabase.auth.signOut();
    } else {
      // Limpa o token de personificação e recarrega a página
      sessionStorage.removeItem('admin_impersonation_token');
      showSuccess("Sessão de administrador restaurada.");
      window.location.reload();
    }
  };

  if (!adminTokens) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black p-2 flex items-center justify-center z-[9999] shadow-lg">
      <Shield size={18} className="mr-2" />
      <p className="text-sm font-semibold">
        Você está visualizando como um cliente.
      </p>
      <button
        onClick={handleReturnToAdmin}
        className="ml-4 flex items-center gap-1 bg-gray-800 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-black transition-colors"
      >
        <LogIn size={14} />
        Voltar para Admin
      </button>
    </div>
  );
};

export default ReturnToAdminBanner;