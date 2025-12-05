import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Segredos do Meta (Facebook/Instagram)
const META_APP_ID = Deno.env.get('META_APP_ID');
const META_APP_SECRET = Deno.env.get('META_APP_SECRET');
const REDIRECT_URI = `https://cdktwczejznbqfzmizpu.supabase.co/functions/v1/meta-oauth-callback`;

// ATUALIZANDO A VERSÃO DA API PARA V24.0
const API_VERSION = 'v24.0';

// URL de fallback de produção
const PRODUCTION_APP_URL = 'https://criarofertas.vercel.app/#profile';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  let userId: string | null = null;
  let appOrigin: string | null = null;
  let finalRedirect = PRODUCTION_APP_URL; // Define o fallback de produção

  try {
    if (state) {
        // O state agora é 'userId|appOrigin'
        const decodedState = decodeURIComponent(state);
        const parts = decodedState.split('|');
        if (parts.length === 2) {
            userId = parts[0];
            appOrigin = parts[1];
            // Garante que o redirecionamento use o hash #profile
            finalRedirect = `${appOrigin}/#profile`;
        }
    }
  } catch (e) {
    console.error("Failed to decode state:", e);
  }
  
  if (!code || !userId) {
    const missing = `Missing: ${!code ? 'code' : ''} ${!userId ? 'userId' : ''}`;
    console.warn(`Meta OAuth Callback Warning: ${missing}. State received: ${state}`);
    // Redireciona para a página de perfil sem o erro na URL, forçando o frontend a recarregar o estado.
    return Response.redirect(finalRedirect, 302);
  }
  
  if (!META_APP_ID || !META_APP_SECRET) {
    console.error("Meta secrets not configured.");
    return Response.redirect(`${finalRedirect}?error=${encodeURIComponent("Meta App ID or Secret not configured in Supabase Secrets.")}`, 302);
  }

  try {
    // 1. Trocar o código de autorização por um token de acesso de curta duração
    const tokenUrl = `https://graph.facebook.com/${API_VERSION}/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${META_APP_SECRET}&code=${code}`;
    
    const tokenResponse = await fetch(tokenUrl);
    if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.json();
        console.error("Meta Token Exchange Failed:", errorBody);
        throw new Error(`Meta token exchange failed: ${errorBody.error?.message || tokenResponse.status}`);
    }
    const tokenData = await tokenResponse.json();
    const shortLivedToken = tokenData.access_token;
    
    // 2. Trocar o token de curta duração por um token de longa duração
    const longLivedTokenUrl = `https://graph.facebook.com/${API_VERSION}/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${shortLivedToken}`;
    
    const longLivedResponse = await fetch(longLivedTokenUrl);
    if (!longLivedResponse.ok) {
        const errorBody = await longLivedResponse.json();
        console.error("Meta Long-Lived Token Exchange Failed:", errorBody);
        throw new Error(`Meta long-lived token exchange failed: ${errorBody.error?.message || longLivedResponse.status}`);
    }
    const longLivedData = await longLivedResponse.json();
    const longLivedUserToken = longLivedData.access_token;
    const expiresInSeconds = longLivedData.expires_in || (60 * 24 * 60 * 60); // 60 dias padrão se não especificado
    
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    // 3. Obter a lista de Páginas do usuário usando o token de longa duração
    const pagesUrl = `https://graph.facebook.com/${API_VERSION}/me/accounts?access_token=${longLivedUserToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();
    
    if (!pagesData.data || pagesData.data.length === 0) {
        throw new Error("Nenhuma página do Facebook encontrada. Você precisa de uma página para postar no Instagram.");
    }
    
    // Para simplificar, vamos usar a primeira página encontrada e seu token de página
    const page = pagesData.data[0];
    const pageAccessToken = page.access_token; // Este é o token de página (que é de longa duração)
    const pageId = page.id;
    const pageName = page.name;

    // 4. Salvar o token de página de longa duração no Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { error: dbError } = await supabaseAdmin
      .from('social_media_accounts')
      .upsert({
        user_id: userId,
        platform: 'meta',
        access_token: pageAccessToken, // Usamos o token da página para postagem
        expires_at: expiresAt,
        account_id: pageId,
        account_name: pageName,
      }, { onConflict: 'user_id, platform' });

    if (dbError) {
        console.error("Supabase DB Error:", dbError);
        throw new Error(`Falha ao salvar token no banco de dados: ${dbError.message}`);
    }
    
    console.log(`SUCCESS: Meta account connected for user ${userId} with page ${pageName}.`);

    // 5. Redirecionar de volta para a página de configurações com sucesso
    // Adicionamos um parâmetro de consulta para o frontend saber que a conexão foi bem-sucedida
    return Response.redirect(`${finalRedirect}?meta_connect=success`, 302);

  } catch (error) {
    console.error("Meta OAuth Error:", error);
    // Redirecionar para a página de configurações com uma mensagem de erro
    const errorMessage = (error as Error).message || "Erro desconhecido durante a autenticação.";
    return Response.redirect(`${finalRedirect}?error=${encodeURIComponent(errorMessage)}`, 302);
  }
});