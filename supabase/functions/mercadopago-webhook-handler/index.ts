import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// O segredo do Mercado Pago para verificar a autenticidade do webhook
const MERCADOPAGO_WEBHOOK_SECRET = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');
const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // 1. Verificar o token de autenticação do Webhook (Segurança)
  const mpAuthHeader = req.headers.get('x-mercadopago-token');
  if (!mpAuthHeader || mpAuthHeader !== MERCADOPAGO_WEBHOOK_SECRET) {
    console.error("Webhook Error: Invalid Mercado Pago access token.");
    return new Response(JSON.stringify({ error: 'Unauthorized webhook access' }), { status: 401, headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const topic = payload.topic || payload.type; // 'payment' ou 'preapproval'
    const resourceId = payload.data?.id; // ID do recurso (pagamento ou preapproval)
    
    if (!resourceId || !topic) {
        console.warn("Webhook Warning: Missing topic or resource ID in payload.");
        return new Response(JSON.stringify({ received: true, message: "Missing topic or resource ID" }), { status: 200, headers: corsHeaders });
    }
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    let logMessage = `Event received: ${topic} for resource ${resourceId}`;
    let userId = null;
    let newRole = 'free';
    let status = null;
    let externalReference = null;

    // 2. Buscar detalhes do recurso no Mercado Pago
    const resourceType = topic === 'payment' ? 'payments' : (topic === 'preapproval' ? 'preapprovals' : null);
    
    if (!resourceType) {
        logMessage = `Ignored Mercado Pago topic: ${topic}`;
        console.log(logMessage);
        return new Response(JSON.stringify({ received: true, message: logMessage }), { status: 200, headers: corsHeaders });
    }
    
    const mpResponse = await fetch(`https://api.mercadopago.com/${resourceType}/${resourceId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
    });
    
    if (!mpResponse.ok) {
        console.error(`Failed to fetch MP resource ${resourceId}: ${mpResponse.status}`);
        return new Response(JSON.stringify({ error: `Failed to fetch MP resource: ${mpResponse.status}` }), { status: 500, headers: corsHeaders });
    }
    
    const resourceDetails = await mpResponse.json();
    
    // Extração de dados
    status = resourceDetails.status;
    externalReference = resourceDetails.external_reference;
    
    // O external_reference agora é 'userId_planRole'
    if (externalReference) {
        const parts = externalReference.split('_');
        if (parts.length === 2) {
            userId = parts[0];
            newRole = parts[1];
        }
    }

    if (!userId) {
        console.warn("Webhook Warning: Could not extract valid Supabase User ID from external_reference.");
        return new Response(JSON.stringify({ received: true, message: "Missing or invalid User ID" }), { status: 200, headers: corsHeaders });
    }
    
    // 3. Processar Status de Assinatura/Pagamento
    if (status === 'authorized' || status === 'approved' || status === 'active') {
        // Assinatura ativa ou pagamento aprovado, faz upgrade para o plano pago
        
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ role: newRole, updated_at: new Date().toISOString() })
            .eq('id', userId);
            
        if (updateError) throw updateError;
        logMessage = `User ${userId} upgraded to ${newRole} due to approved Mercado Pago status: ${status}.`;
        
    } else if (status === 'cancelled' || status === 'paused' || status === 'pending' || status === 'refunded') {
        // Assinatura cancelada, pausada ou pagamento falhou, faz downgrade para 'free'
        newRole = 'free';
        const { error: downgradeError } = await supabaseAdmin
            .from('profiles')
            .update({ role: newRole, updated_at: new Date().toISOString() })
            .eq('id', userId);
            
        if (downgradeError) throw downgradeError;
        logMessage = `User ${userId} downgraded to ${newRole} due to Mercado Pago status: ${status}.`;
    } else {
        logMessage = `Ignored Mercado Pago status: ${status}`;
    }

    console.log(logMessage);
    return new Response(JSON.stringify({ received: true, message: logMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error processing Mercado Pago webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});