import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const GOOGLE_TTS_API_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";
const DEFAULT_VOICE = "pt-BR-Standard-A"; // Voz padrão em Português (Brasil)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 1. Get API Key from Supabase Secrets
  const apiKey = Deno.env.get('GOOGLE_TTS_API_KEY');
  if (!apiKey) {
    console.error("TTS Error: GOOGLE_TTS_API_KEY is missing from environment.");
    return new Response(JSON.stringify({ error: 'GOOGLE_TTS_API_KEY not configured. Please set the secret.' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  try {
    const { text, voiceStyle } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Missing text parameter' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 2. Call Google Cloud TTS API
    const ttsPayload = {
      input: { text: text },
      voice: { languageCode: "pt-BR", name: DEFAULT_VOICE },
      audioConfig: { audioEncoding: "MP3" },
    };

    const ttsResponse = await fetch(`${GOOGLE_TTS_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ttsPayload),
    });

    if (!ttsResponse.ok) {
      const errorJson = await ttsResponse.json();
      console.error("Google TTS API Error:", ttsResponse.status, errorJson);
      return new Response(JSON.stringify({ error: 'Failed to synthesize speech with Google TTS', details: errorJson.error?.message || 'Unknown error' }), {
        status: ttsResponse.status,
        headers: corsHeaders,
      });
    }

    const data = await ttsResponse.json();
    
    if (!data.audioContent) {
        throw new Error("Google TTS did not return audio content.");
    }

    // 3. Return the audio content (base64 encoded MP3)
    return new Response(JSON.stringify({ audioContent: data.audioContent }), {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error("TTS Catch Error:", error);
    return new Response(JSON.stringify({ error: 'Internal server error during Google TTS generation' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});