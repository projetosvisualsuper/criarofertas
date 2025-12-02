import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/src/integrations/supabase/client';
import { Zap } from 'lucide-react';

const customTheme = {
  default: {
    colors: {
      // Cores primárias da aplicação (Indigo)
      brand: '#4f46e5', // Indigo-600
      brandAccent: '#4338ca', // Indigo-700
      
      // Botões
      defaultButtonBackground: '#4f46e5',
      defaultButtonBackgroundHover: '#4338ca',
      defaultButtonText: 'white',
      
      // Links e Foco
      anchorTextColor: '#4f46e5',
      inputFocusBorder: '#4f46e5',
    },
  },
};

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Zap size={48} className="text-indigo-600 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-800 mt-2">OfertaFlash Builder</h1>
          <p className="text-gray-600">Faça login para criar suas campanhas</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: customTheme, // Aplicando o tema customizado
            }}
            providers={[]}
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Seu email',
                  password_label: 'Sua senha',
                  button_label: 'Entrar',
                  link_text: 'Já tem uma conta? Entre aqui',
                  email_input_placeholder: 'seu.email@exemplo.com',
                  password_input_placeholder: 'Sua senha',
                },
                sign_up: {
                  email_label: 'Seu email',
                  password_label: 'Crie uma senha',
                  button_label: 'Cadastrar',
                  link_text: 'Não tem uma conta? Cadastre-se',
                  email_input_placeholder: 'seu.email@exemplo.com',
                  password_input_placeholder: 'Crie uma senha segura',
                },
                forgotten_password: {
                  email_label: 'Seu email',
                  button_label: 'Enviar instruções',
                  link_text: 'Esqueceu sua senha?',
                  email_input_placeholder: 'seu.email@exemplo.com',
                }
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;