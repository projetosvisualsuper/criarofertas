import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/src/integrations/supabase/client';
import { Zap } from 'lucide-react';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Zap size={48} className="text-yellow-500 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-800 mt-2">AI Marketing Hub</h1>
          <p className="text-gray-600">Faça login para criar suas campanhas</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
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