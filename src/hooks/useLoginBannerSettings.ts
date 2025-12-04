import { useState, useEffect } from 'react';
import { supabase } from '@/src/integrations/supabase/client';

export interface LoginBannerSettings {
  title: string;
  subtitle: string;
  features: string[];
  bannerColor: string; // NOVO CAMPO
}

const defaultSettings: LoginBannerSettings = {
  title: 'Sistema de Criação de Ofertas',
  subtitle: 'Crie cartazes, posts para redes sociais e anúncios de áudio/vídeo em minutos, usando ferramentas de marketing avançadas.',
  features: ['Criação Rápida e Intuitiva', 'Banco de Produtos Integrado', 'Templates Profissionais', 'Exportação para TV Digital'],
  bannerColor: '#007bff', // Cor padrão
};

export function useLoginBannerSettings() {
  const [settings, setSettings] = useState<LoginBannerSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      
      // Busca o primeiro (e único) registro
      const { data, error } = await supabase
        .from('login_banner_settings')
        .select('title, subtitle, features, bannerColor') // Incluindo bannerColor
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
        console.error('Error fetching login banner settings:', error);
        // Em caso de erro, usamos os valores padrão
      }

      if (data) {
        setSettings({
          title: data.title || defaultSettings.title,
          subtitle: data.subtitle || defaultSettings.subtitle,
          // Garante que features seja um array de strings
          features: Array.isArray(data.features) ? data.features.filter(f => typeof f === 'string') : defaultSettings.features,
          bannerColor: data.bannerColor || defaultSettings.bannerColor, // Usando a cor salva ou padrão
        });
      }
      setLoading(false);
    };

    fetchSettings();
  }, []); // Array de dependências vazio para rodar apenas na montagem

  return { settings, loading };
}