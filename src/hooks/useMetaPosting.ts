import { useState, useCallback } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import { SocialMediaAccount } from '../../types';
import { showError, showSuccess } from '../utils/toast';

export function useMetaPosting() {
  const [isPosting, setIsPosting] = useState(false);

  const postImageToMeta = useCallback(async (
    account: SocialMediaAccount, 
    imageUrl: string, 
    caption: string
  ) => {
    if (account.platform !== 'meta') {
      showError("Conta de mídia social inválida para postagem Meta.");
      return false;
    }
    
    setIsPosting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('meta-post-image', {
        method: 'POST',
        body: {
          pageAccessToken: account.accessToken,
          pageId: account.accountId,
          imageUrl: imageUrl,
          caption: caption,
        },
      });

      if (error) {
        // Tenta extrair o erro detalhado da Edge Function
        const edgeFunctionError = (error as any).context?.body?.error || error.message;
        throw new Error(edgeFunctionError);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      showSuccess(data.message || "Postagem enviada com sucesso!");
      return true;

    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error("Meta Posting Error:", errorMessage);
      
      let userMessage = "Falha ao postar no Instagram. ";
      
      if (errorMessage.includes('Meta API Error')) {
          userMessage += "Verifique se a página do Facebook está vinculada a uma conta profissional do Instagram.";
      } else if (errorMessage.includes('Nenhuma conta profissional do Instagram')) {
          userMessage = errorMessage;
      } else {
          userMessage += `Detalhe: ${errorMessage}`;
      }
      
      showError(userMessage);
      return false;
    } finally {
      setIsPosting(false);
    }
  }, []);

  return {
    isPosting,
    postImageToMeta,
  };
}