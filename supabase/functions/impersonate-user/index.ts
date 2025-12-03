import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { decode } from "https://deno.land/x/djwt@v2.8/mod.ts"; // Importando DJWT

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Crie um cliente Supabase com a chave de serviço.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 2. Obtenha o token do cabeçalho da requisição.
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'Authentication token not found' }), { status: 401, headers: corsHeaders });
    }
    
    // 3. Decodificar o token para obter o ID do usuário (uid)
    let userId: string | null = null;
    try {
        // Decodificar o JWT (não verifica a assinatura, apenas extrai o payload)
        const [_header, payload, _signature] = decode(token);
        userId = payload.sub as string; // 'sub' é o campo padrão para user ID (uid)
        
        if (!userId) {
            throw new Error("Token payload missing user ID (sub).");
        }
    } catch (e) {
        console.error("JWT Decode Error:", e);
        return new Response(JSON.stringify({ error: 'Authentication failed or token expired', details: 'Invalid JWT format or missing user ID.' }), { status: 401, headers: corsHeaders });
    }

    // 4. Verifique se o usuário decodificado é um administrador e está ativo.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      console.warn(`Impersonation attempt by non-admin user: ${userId}`);
      return new Response(JSON.stringify({ error: 'Permission denied: User is not an admin' }), { status: 403, headers: corsHeaders });
    }

    // 5. Obtenha os dados do corpo da requisição.
    const { userEmailToImpersonate, redirectTo } = await req.json();
    if (!userEmailToImpersonate) {
      return new Response(JSON.stringify({ error: 'Target user email is missing' }), { status: 400, headers: corsHeaders });
    }
    
    const finalRedirectTo = redirectTo || '/';

    // 6. Gera o link de login mágico
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmailToImpersonate,
      options: {
        redirectTo: finalRedirectTo,
      },
    });

    if (linkError) {
      console.error("Supabase generateLink error:", linkError);
      throw new Error(`Failed to generate sign-in link: ${linkError.message}`);
    }

    // 7. Retorne o link gerado.
    return new Response(JSON.stringify({ signInLink: linkData.properties.action_link }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in impersonate-user function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});