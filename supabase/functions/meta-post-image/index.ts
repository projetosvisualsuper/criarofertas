import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_VERSION = 'v24.0';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { pageAccessToken, pageId, imageUrl, caption } = await req.json();

    if (!pageAccessToken || !pageId || !imageUrl) {
      return new Response(JSON.stringify({ error: 'Missing required parameters (token, pageId, imageUrl)' }), { status: 400, headers: corsHeaders });
    }
    
    // 1. Obter o ID da conta do Instagram vinculada à página do Facebook
    const instagramAccountUrl = `https://graph.facebook.com/${API_VERSION}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`;
    const igResponse = await fetch(instagramAccountUrl);
    const igData = await igResponse.json();
    
    if (igData.error) {
        console.error("Meta API Error (Get IG Account):", igData.error);
        throw new Error(`Meta API Error: ${igData.error.message}. Verifique se a página está vinculada a uma conta profissional do Instagram.`);
    }
    
    const igAccountId = igData.instagram_business_account?.id;
    if (!igAccountId) {
        throw new Error("Nenhuma conta profissional do Instagram vinculada à página do Facebook encontrada.");
    }

    // 2. Criar o Contêiner de Mídia (Media Container)
    // O Meta exige que a imagem seja acessível publicamente (o que é o caso com o Supabase Storage URL)
    const mediaContainerUrl = `https://graph.facebook.com/${API_VERSION}/${igAccountId}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${pageAccessToken}`;
    
    const containerResponse = await fetch(mediaContainerUrl, { method: 'POST' });
    const containerData = await containerResponse.json();
    
    if (containerData.error) {
        console.error("Meta API Error (Create Container):", containerData.error);
        throw new Error(`Falha ao criar contêiner de mídia: ${containerData.error.message}`);
    }
    
    const mediaContainerId = containerData.id;

    // 3. Publicar o Contêiner de Mídia
    const publishUrl = `https://graph.facebook.com/${API_VERSION}/${igAccountId}/media_publish?creation_id=${mediaContainerId}&access_token=${pageAccessToken}`;
    
    const publishResponse = await fetch(publishUrl, { method: 'POST' });
    const publishData = await publishResponse.json();
    
    if (publishData.error) {
        console.error("Meta API Error (Publish):", publishData.error);
        throw new Error(`Falha ao publicar a mídia: ${publishData.error.message}`);
    }

    return new Response(JSON.stringify({ 
        success: true,
        postId: publishData.id,
        message: "Postagem agendada/publicada com sucesso!",
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in meta-post-image function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});