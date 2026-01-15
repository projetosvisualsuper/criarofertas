import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/src/integrations/supabase/client';
import { Zap, Check, Loader2, Monitor, Smartphone } from 'lucide-react';
import { useLoginBannerSettings } from '../hooks/useLoginBannerSettings';

const LoginPage: React.FC = () => {
  const { settings, loading } = useLoginBannerSettings();
  
  // Cores dinâmicas do hook
  const BANNER_COLOR = settings.bannerColor || '#007bff'; 
  const END_COLOR = settings.bannerGradientEndColor;
  
  // Determina o estilo de fundo
  const backgroundStyle = END_COLOR
    ? { background: `linear-gradient(135deg, ${BANNER_COLOR} 0%, ${END_COLOR} 100%)` }
    : { backgroundColor: BANNER_COLOR };

  const customTheme = {
    default: {
      colors: {
        // Cores primárias da aplicação (usando a cor do banner)
        brand: BANNER_COLOR, 
        brandAccent: BANNER_COLOR, // Usando a mesma cor para foco/hover
        
        // Botões
        defaultButtonBackground: BANNER_COLOR, 
        defaultButtonBackgroundHover: BANNER_COLOR,
        defaultButtonText: 'white',
        
        // Links e Foco
        anchorTextColor: BANNER_COLOR,
        inputFocusBorder: BANNER_COLOR,
      },
    },
  };

  const BannerContent: React.FC<{ isCompact: boolean }> = ({ isCompact }) => (
    <div className={`p-6 text-white flex flex-col justify-center ${isCompact ? 'py-8' : 'p-10 h-full'}`} style={backgroundStyle}>
      <h2 className={`font-black mb-2 leading-tight ${isCompact ? 'text-2xl' : 'text-4xl'}`}>
        {settings.title.split(' ').map((word, index) => (
          <span key={index} className={index === 0 ? 'text-white' : 'text-green-300'}>
            {word}{' '}
          </span>
        ))}
      </h2>
      <p className={`text-gray-200 mb-4 ${isCompact ? 'text-sm' : 'text-lg'}`}>{settings.subtitle}</p>
      
      <ul className={`space-y-2 ${isCompact ? 'text-sm' : 'text-lg'}`}>
        {settings.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check size={isCompact ? 16 : 20} className="text-green-300 mt-1 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="bg-gray-100 flex flex-col items-center justify-start p-4 min-h-screen"> {/* Removendo min-h-screen e ajustando justify-start */}
      
      {/* Aviso de Uso em Desktop (Visível apenas em telas pequenas) */}
      <div className="lg:hidden w-full max-w-5xl mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg text-center">
        <p className="text-sm font-semibold text-yellow-800 flex items-center justify-center gap-2">
          <Monitor size={16} className="shrink-0" />
          Para uma melhor experiência de criação, recomendamos acessar pelo computador.
        </p>
      </div>
      
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Coluna de Destaque (Versão Lateral - Apenas em Desktop/lg) */}
        <div className="w-full lg:w-1/2 relative hidden lg:block">
          {loading ? (
            <div className="h-full flex items-center justify-center" style={{ backgroundColor: BANNER_COLOR }}>
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : (
            <BannerContent isCompact={false} />
          )}
        </div>
        
        {/* Coluna de Destaque (Versão Compacta - Apenas em Mobile/sm e Tablet/md) */}
        <div className="w-full lg:w-1/2 relative block lg:hidden">
          {loading ? (
            <div className="h-48 flex items-center justify-center" style={{ backgroundColor: BANNER_COLOR }}>
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : (
            <BannerContent isCompact={true} />
          )}
        </div>
        
        {/* Coluna de Login */}
        <div className="w-full lg:w-1/2 p-6 sm:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mt-2">Criar Ofertas</h1>
            <p className="text-gray-600">Entre com suas credenciais para acessar o sistema</p>
          </div>
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: customTheme,
            }}
            providers={[]}
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  button_label: 'Entrar',
                  link_text: 'Já tem uma conta? Entre aqui',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Digite sua senha',
                },
                sign_up: {
                  email_label: 'E-mail',
                  password_label: 'Crie uma senha',
                  button_label: 'Cadastrar',
                  link_text: 'Não tem uma conta? Cadastre-se',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Crie uma senha segura',
                },
                forgotten_password: {
                  email_label: 'E-mail',
                  button_label: 'Enviar instruções',
                  link_text: 'Esqueceu sua senha?',
                  email_input_placeholder: 'seu@email.com',
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