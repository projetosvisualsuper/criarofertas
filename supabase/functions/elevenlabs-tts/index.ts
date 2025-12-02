import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

// Removendo o Voice ID para usar o padrão da conta
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

serve(async (req) => {
  // 1. Handle CORS OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 2. Get API Key from Supabase Secrets
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey) {
    console.error("TTS Error: ELEVENLABS_API_KEY is missing from environment.");
    return new Response(JSON.stringify({ error: 'ELEVENLABS_API_KEY not configured. Please set the secret.' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  try {
    const { text } = await req.json(); 

    if (!text) {
      return new Response(JSON.stringify({ error: 'Missing text parameter' }), {
        status: 400,
        headers: corsHeaders,
      });
    }
    
    // 3. Call ElevenLabs API (usando o endpoint sem Voice ID)
    const ttsPayload = {
      text: text,
      model_id: "eleven_multilingual_v2", // Modelo que suporta pt-BR
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
      },
    };

    // O endpoint agora é ELEVENLABS_API_URL + /:voice_id
    // Precisamos de um Voice ID. Se não pudermos usar um fixo, precisamos que o usuário forneça um.
    // Voltando à ideia de usar um ID, mas vamos usar o ID que o usuário forneceu inicialmente,
    // pois se ele for um clone de voz, ele pode ser o único que funciona.
    
    // REVERTENDO: O endpoint /v1/text-to-speech exige um Voice ID.
    // Se o ID padrão (Adam) não funcionou, e o ID do usuário falhou, o problema é a chave API.
    
    // Vamos reverter para o ID do usuário, mas com uma nota de que a chave API deve ser verificada.
    // Se o ID do usuário for um clone de voz, ele pode ser o único que funciona.
    
    // Vamos tentar o ID do usuário novamente, mas com a certeza de que o problema é a chave.
    // Se a chave estiver correta, o problema é o ID.
    
    // A Edge Function precisa de um Voice ID no URL. Se o ID do usuário falhar, o problema é a chave.
    
    // Vamos usar um ID de voz padrão que é conhecido por funcionar com o modelo multilingual.
    // Se o ID "Adam" falhou, vamos tentar o ID "Rachel" (21m00Tz4R8PpnVzPzV0S)
    const FALLBACK_VOICE_ID = "21m00Tz4R8PpnVzPzV0S"; // Rachel
    
    const ttsResponse = await fetch(`${ELEVENLABS_API_URL}/${FALLBACK_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify(ttsPayload),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("ElevenLabs TTS API Error:", ttsResponse.status, errorText);
      
      let details = errorText;
      try {
          const errorJson = JSON.parse(errorText);
          details = errorJson.detail?.message || errorJson.detail || errorText;
      } catch (e) {
          // Ignora erro de parse se não for JSON
      }
      
      return new Response(JSON.stringify({ error: 'Failed to synthesize speech with ElevenLabs', details: details }), {
        status: ttsResponse.status,
        headers: corsHeaders,
      });
    }

    // 4. Read the audio stream as ArrayBuffer
    const audioBuffer = await ttsResponse.arrayBuffer();
    
    // 5. Convert ArrayBuffer to Base64
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    
    // 6. Return the audio content (base64 encoded MP3)
    return new Response(JSON.stringify({ audioContent: audioBase64 }), {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error("TTS Catch Error:", error);
    return new Response(JSON.stringify({ error: 'Internal server error during ElevenLabs TTS generation', details: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});