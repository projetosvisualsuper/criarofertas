import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import { Shield, LogIn } from 'lucide-react';
import { showSuccess } from '../utils/toast';

const ReturnToAdminBanner: React.FC = () => {
  const [adminSession, setAdminSession] = useState<any>(null);

  useEffect(() => {
    const storedSession = localStorage.getItem('admin_impersonation_token');
    if (storedSession) {
      try {
        setAdminSession(JSON.parse(storedSession));
      } catch (e) {
        console.error("Failed to parse admin session from localStorage", e);
        localStorage.removeItem('admin_impersonation_token');
      }
    }
  }, []);

  const handleReturnToAdmin = async () => {
    if (!adminSession) return;

    // Restaura a sessão do administrador
    const { error } = await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });

    if (error) {
      console.error("Failed to restore admin session:", error);
      // Se falhar, limpe e force o logout
      localStorage.removeItem('admin_impersonation_token');
      await supabase.auth.signOut();
    } else {
      // Limpa o token de personificação e recarrega a página
      localStorage.removeItem('admin_impersonation_token');
      showSuccess("Sessão de administrador restaurada.");
      window.location.reload();
    }
  };

  if (!adminSession) {
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