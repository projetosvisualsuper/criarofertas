import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Verificação de Administrador (Etapa 1: Validar o chamador) ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Cabeçalho de autorização ausente.' }), { status: 401, headers: corsHeaders });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Token de usuário inválido.' }), { status: 401, headers: corsHeaders });
    }

    // --- Verificação de Administrador (Etapa 2: Confirmar a role com a chave de serviço) ---
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Acesso negado. Apenas administradores podem personificar usuários.' }), { status: 403, headers: corsHeaders });
    }

    // --- Geração do Link de Personificação (Lógica Refatorada) ---
    const { userEmailToImpersonate } = await req.json();
    if (!userEmailToImpersonate) {
      return new Response(JSON.stringify({ error: 'Email do usuário alvo ausente.' }), { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const adminAuthUrl = `${supabaseUrl}/auth/v1/admin/generate_link`;

    // Chamada direta para a API de Auth do Supabase
    const response = await fetch(adminAuthUrl, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey!,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'magiclink',
        email: userEmailToImpersonate,
        options: {
          redirectTo: '/',
        },
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Erro da API de Auth Admin do Supabase:", responseData);
      throw new Error(responseData.error_description || 'Falha ao gerar o link mágico.');
    }

    return new Response(JSON.stringify({ signInLink: responseData.action_link }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Erro na função de personificação:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});