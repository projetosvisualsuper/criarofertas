import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

// Dados de planos simulados para o checkout (em um ambiente real, isso viria do DB)
const PLAN_DETAILS: Record<string, { title: string, price: number }> = {
    'premium': { title: 'Plano Premium OfertaFlash', price: 99.00 },
    'pro': { title: 'Plano Pro OfertaFlash', price: 199.00 },
};

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
    
    if (!planRole || !userId || !PLAN_DETAILS[planRole]) {
        return new Response(JSON.stringify({ error: 'Invalid planRole or missing userId' }), { status: 400, headers: corsHeaders });
    }
    
    const plan = PLAN_DETAILS[planRole];
    
    // 1. Cria o payload da Preferência de Pagamento
    const preferencePayload = {
        items: [
            {
                title: plan.title,
                quantity: 1,
                unit_price: plan.price,
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

    // 2. Chama a API do Mercado Pago para criar a preferência
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

    // 3. Retorna o link de checkout
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