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
    console.log("MP Credit Checkout: Starting request processing.");
    
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!MERCADOPAGO_ACCESS_TOKEN) {
      const errorMsg = "MERCADOPAGO_ACCESS_TOKEN is not configured in Supabase Secrets.";
      console.error("MP Credit Checkout Error:", errorMsg);
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    let amount, price, userId;
    try {
        const body = await req.json();
        amount = body.amount; // Quantidade de créditos
        price = body.price;   // Preço em BRL
        userId = body.userId;
        console.log(`MP Credit Checkout: Received body - amount: ${amount}, price: ${price}, userId: ${userId}`);
    } catch (e) {
        console.error("MP Credit Checkout Error: Failed to parse request body.", e);
        return new Response(JSON.stringify({ error: 'Invalid JSON body received.' }), { status: 200, headers: corsHeaders });
    }
    
    if (!amount || !price || !userId) {
        const errorMsg = 'Missing amount, price, or userId in request body';
        console.error("MP Credit Checkout Error:", errorMsg);
        return new Response(JSON.stringify({ error: errorMsg }), { status: 200, headers: corsHeaders });
    }
    
    const transactionAmount = parseFloat(price.toFixed(2));
    const creditAmount = parseInt(amount, 10);
    
    if (isNaN(transactionAmount) || transactionAmount <= 0 || isNaN(creditAmount) || creditAmount <= 0) {
        const errorMsg = `Invalid transaction amount (${transactionAmount}) or credit amount (${creditAmount}).`;
        console.error("MP Credit Checkout Error:", errorMsg);
        return new Response(JSON.stringify({ error: errorMsg }), { status: 200, headers: corsHeaders });
    }
    
    // 2. Cria o payload da Preferência de Pagamento (Checkout Simples)
    // O external_reference agora é 'userId_credits_amount'
    const externalReference = `${userId}_credits_${creditAmount}`;
    
    // URLs de retorno e notificação
    const backUrl = "https://criarofertas.vercel.app/#profile"; 
    const notificationUrl = `https://cdktwczejznbqfzmizpu.supabase.co/functions/v1/mercadopago-webhook-handler`; // Reutiliza o webhook existente

    const preferencePayload = {
        items: [
            {
                title: `${creditAmount} Créditos de IA Adicionais`,
                quantity: 1,
                currency_id: "BRL",
                unit_price: transactionAmount,
            }
        ],
        back_urls: {
            success: backUrl,
            pending: backUrl,
            failure: backUrl,
        },
        auto_return: "approved",
        external_reference: externalReference, 
        notification_url: notificationUrl,
    };
    
    console.log("MP Credit Checkout: Sending Preference Payload:", JSON.stringify(preferencePayload));

    // 3. Chama a API do Mercado Pago para criar a preferência
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preferencePayload),
    });

    if (!mpResponse.ok) {
        let errorBody;
        try {
            errorBody = await mpResponse.json();
        } catch (e) {
            errorBody = { message: await mpResponse.text() };
        }
        
        const errorMsg = `Mercado Pago API failed (${mpResponse.status}): ${errorBody.message || 'Unknown error'}. Verifique o Access Token e as permissões.`;
        
        console.error("MP Credit Checkout Error: Mercado Pago API failed:", mpResponse.status, JSON.stringify(errorBody));
        
        return new Response(JSON.stringify({ 
            error: errorMsg,
            mpStatus: mpResponse.status,
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    
    const preference = await mpResponse.json();
    console.log("MP Credit Checkout: Preference created successfully.");

    // 4. Retorna o link de checkout
    return new Response(JSON.stringify({ 
        checkoutLink: preference.init_point,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("MP Credit Checkout Error: Internal Edge Function error:", error);
    return new Response(JSON.stringify({ error: `Internal Edge Function Error: ${error.message}` }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});