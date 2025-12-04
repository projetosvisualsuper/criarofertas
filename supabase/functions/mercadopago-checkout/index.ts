import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "MERCADOPAGO_ACCESS_TOKEN is not configured in Supabase Secrets." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { planRole, userId } = await req.json();
    
    if (!planRole || !userId) {
        return new Response(JSON.stringify({ error: 'Missing planRole or userId' }), { status: 400, headers: corsHeaders });
    }
    
    // 1. Criar cliente Admin para buscar dados da tabela plan_configurations
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // 2. Buscar detalhes do plano no DB
    const { data: planConfig, error: planError } = await supabaseAdmin
        .from('plan_configurations')
        .select('name, price')
        .eq('role', planRole)
        .single();
        
    if (planError || !planConfig) {
        console.error("Error fetching plan configuration:", planError);
        return new Response(JSON.stringify({ error: `Plan configuration not found for role: ${planRole}` }), { status: 404, headers: corsHeaders });
    }
    
    // 3. Extrair o preço (removendo R$ e / mês para obter o valor numérico)
    const priceMatch = planConfig.price.match(/[\d,.]+/);
    let priceValue = 0;
    if (priceMatch) {
        // Substitui vírgula por ponto e garante que seja um float
        priceValue = parseFloat(priceMatch[0].replace(',', '.'));
    }
    
    if (isNaN(priceValue) || priceValue <= 0) {
        return new Response(JSON.stringify({ error: `Invalid price value found in DB for plan ${planRole}: ${planConfig.price}` }), { status: 400, headers: corsHeaders });
    }
    
    // 4. Cria o payload da Preferência de Pagamento
    const preferencePayload = {
        items: [
            {
                title: `${planConfig.name} Criar Ofertas`, // Usando o nome do DB
                quantity: 1,
                unit_price: priceValue, // Usando o valor numérico do DB
            },
        ],
        // CRÍTICO: Usar o ID do usuário Supabase como external_reference
        external_reference: userId, 
        // URL de notificação para o webhook que você já configurou
        notification_url: `https://cdktwczejznbqfzmizpu.supabase.co/functions/v1/mercadopago-webhook-handler`,
        // Redirecionamento após o pagamento (ajuste conforme sua URL de sucesso/falha)
        back_urls: {
            success: "https://ofertaflash.vercel.app/success", // Substitua pela sua URL real
            failure: "https://ofertaflash.vercel.app/failure", // Substitua pela sua URL real
            pending: "https://ofertaflash.vercel.app/pending", // Substitua pela sua URL real
        },
        auto_return: "approved",
    };

    // 5. Chama a API do Mercado Pago para criar a preferência
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preferencePayload),
    });

    if (!mpResponse.ok) {
        const errorBody = await mpResponse.json();
        console.error("Mercado Pago API Error:", errorBody);
        throw new Error(`Mercado Pago API failed: ${mpResponse.status} - ${errorBody.message || 'Unknown error'}`);
    }
    
    const preference = await mpResponse.json();

    // 6. Retorna o link de checkout
    return new Response(JSON.stringify({ 
        checkoutLink: preference.init_point, // Link para redirecionamento
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in Mercado Pago Checkout Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});