import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// O segredo do Asaas para verificar a autenticidade do webhook
const ASAAS_WEBHOOK_AUTH_TOKEN = Deno.env.get('ASAAS_WEBHOOK_AUTH_TOKEN');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // 1. Verificar o token de autenticação do Webhook (Segurança)
  const asaasAuthHeader = req.headers.get('asaas-access-token');
  if (!asaasAuthHeader || asaasAuthHeader !== ASAAS_WEBHOOK_AUTH_TOKEN) {
    console.error("Webhook Error: Invalid Asaas access token.");
    return new Response(JSON.stringify({ error: 'Unauthorized webhook access' }), { status: 401, headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const event = payload.event;
    const payment = payload.payment; // Contém informações sobre o pagamento
    
    // O ID do usuário no Supabase deve ser armazenado no campo 'externalReference'
    // ou 'description' do pagamento/assinatura no Asaas.
    const userId = payment?.externalReference; 
    
    if (!userId) {
        console.warn("Webhook Warning: Missing externalReference (Supabase User ID).");
        return new Response(JSON.stringify({ received: true, message: "Missing User ID" }), { status: 200, headers: corsHeaders });
    }
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    let newRole = 'free';
    let logMessage = `Event received: ${event}`;

    // 2. Processar Eventos de Pagamento
    switch (event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        // Assumindo que o plano (role) está no campo 'description' ou 'metadata' do Asaas
        // Para simplificar, vamos buscar o plano na descrição do pagamento.
        // Em uma integração real, você usaria o ID da assinatura para buscar o plano.
        
        // Exemplo simplificado: Se o valor for alto, assume-se um plano pago.
        // Em produção, use metadados ou IDs de assinatura.
        
        // Vamos buscar o plano atual do usuário para evitar downgrades acidentais
        const { data: currentProfile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
            
        // Se o pagamento for confirmado, mantemos o plano atual ou fazemos upgrade.
        // Aqui, você precisaria de uma lógica para mapear o produto/assinatura do Asaas para o 'role' do Supabase.
        
        // Exemplo: Se o pagamento for de R$ 99,00, assume-se 'premium'.
        const paymentValue = payment?.value || 0;
        if (paymentValue >= 199) {
            newRole = 'pro';
        } else if (paymentValue >= 99) {
            newRole = 'premium';
        } else {
            newRole = currentProfile?.role || 'free'; // Mantém o plano se o valor for baixo
        }
        
        // Se o novo plano for um upgrade, atualiza o perfil
        if (newRole !== currentProfile?.role) {
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({ role: newRole, updated_at: new Date().toISOString() })
                .eq('id', userId);
                
            if (updateError) throw updateError;
            logMessage = `User ${userId} upgraded to ${newRole} due to confirmed payment.`;
        } else {
            logMessage = `User ${userId} payment confirmed, plan remains ${currentProfile?.role}.`;
        }
        break;

      case 'PAYMENT_OVERDUE':
      case 'PAYMENT_CANCELED':
      case 'PAYMENT_REFUNDED':
        // Se o pagamento falhar ou for cancelado, faz o downgrade para 'free'
        newRole = 'free';
        const { error: downgradeError } = await supabaseAdmin
            .from('profiles')
            .update({ role: newRole, updated_at: new Date().toISOString() })
            .eq('id', userId);
            
        if (downgradeError) throw downgradeError;
        logMessage = `User ${userId} downgraded to ${newRole} due to payment event: ${event}.`;
        break;
        
      default:
        // Ignorar outros eventos
        logMessage = `Ignored Asaas event: ${event}`;
        break;
    }

    console.log(logMessage);
    return new Response(JSON.stringify({ received: true, message: logMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error processing Asaas webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});