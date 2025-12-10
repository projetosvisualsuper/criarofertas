import { supabase } from '@/src/integrations/supabase/client';
import { Product, AdScript } from '../types';

/**
 * Função auxiliar para invocar a Edge Function do OpenAI Proxy.
 */
const invokeOpenAIProxy = async (task: string, data: any) => {
  const { data: responseData, error } = await supabase.functions.invoke('openai-proxy', {
    method: 'POST',
    body: { task, data },
  });

  if (error) {
    console.error(`Error invoking OpenAI proxy for task ${task}:`, error);
    // Tenta extrair a mensagem de erro detalhada da Edge Function
    const errorDetails = (error as any).context?.body?.error || error.message;
    throw new Error(errorDetails);
  }
  
  // Se a Edge Function retornar um erro no corpo (status 200 com erro interno)
  if (responseData.error) {
      throw new Error(responseData.error);
  }

  return responseData.response;
};

/**
 * Gera um título de marketing usando IA.
 * @param topic O tópico ou subtítulo para basear o título.
 * @returns O título gerado.
 */
export const generateMarketingCopy = async (topic: string): Promise<string> => {
  const response = await invokeOpenAIProxy('generateMarketingCopy', { topic });
  return response.text.trim();
};

/**
 * Analisa um texto em massa e extrai produtos.
 * @param text O texto contendo a lista de produtos.
 * @returns Um array de objetos Product.
 */
export const parseProductsFromText = async (text: string): Promise<Partial<Product>[]> => {
  const response = await invokeOpenAIProxy('parseProductsFromText', { text });
  
  try {
    // A Edge Function deve retornar um JSON string
    const parsed = JSON.parse(response.text);
    // Se a IA retornou um objeto com uma chave 'products', usamos essa chave
    if (parsed.products && Array.isArray(parsed.products)) {
        return parsed.products;
    }
    // Caso contrário, assumimos que o array é o próprio objeto retornado
    if (Array.isArray(parsed)) {
        return parsed;
    }
    throw new Error("Formato de resposta da IA inválido.");
  } catch (e) {
    console.error("Failed to parse AI product response:", e);
    throw new Error(`Falha ao processar a resposta da IA. Verifique se o texto de entrada está claro. Resposta bruta: ${response.text}`);
  }
};

/**
 * Gera uma imagem de fundo usando IA (DALL-E).
 * @param prompt O prompt para a imagem de fundo.
 * @returns O Data URL da imagem gerada.
 */
export const generateBackgroundImage = async (prompt: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('openai-proxy', {
    method: 'POST',
    body: { task: 'generateBackgroundImage', data: { prompt } },
  });
  
  if (error) {
    const errorDetails = (error as any).context?.body?.error || error.message;
    throw new Error(errorDetails);
  }
  
  if (data.error) {
      throw new Error(data.error);
  }

  // A Edge Function retorna imageBase64 e mimeType diretamente no corpo da resposta
  const imageBase64 = data.imageBase64;
  const mimeType = data.mimeType || 'image/png';
  
  return `data:${mimeType};base64,${imageBase64}`;
};

/**
 * Gera um roteiro de anúncio de áudio/vídeo.
 * @param products Lista de produtos para incluir no roteiro.
 * @returns O objeto AdScript gerado.
 */
export const generateAdScript = async (products: Product[]): Promise<AdScript> => {
  const response = await invokeOpenAIProxy('generateAdScript', { products });
  
  try {
    const parsed = JSON.parse(response.text);
    return parsed as AdScript;
  } catch (e) {
    console.error("Failed to parse AI ad script response:", e);
    throw new Error(`Falha ao processar o roteiro da IA. Resposta bruta: ${response.text}`);
  }
};

/**
 * Função para gerar áudio usando a Edge Function de TTS (agora ElevenLabs).
 * Retorna um URL de objeto local (Blob URL) para reprodução.
 */
export const generateAudioFromText = async (text: string): Promise<string> => {
  // NOTA: A Edge Function 'gerar-audio' agora chama a 'elevenlabs-tts' internamente.
  const { data, error } = await supabase.functions.invoke('gerar-audio', {
    method: 'POST',
    body: { text },
    options: { responseType: 'arraybuffer' } 
  });

  if (error) {
    console.error("Error invoking 'gerar-audio' Edge Function:", error);
    // Tenta extrair a mensagem de erro detalhada da Edge Function
    const errorDetails = (error as any).context?.body?.error || error.message;
    throw new Error(`Falha na geração de áudio: ${errorDetails}`);
  }
  
  if (!data) {
      throw new Error("A Edge Function retornou dados vazios.");
  }
  
  // CRITICAL CHECK: Se o ArrayBuffer for muito pequeno (ex: < 10KB), é um erro.
  const MIN_AUDIO_SIZE_BYTES = 10000; 
  if (data.byteLength < MIN_AUDIO_SIZE_BYTES) {
      console.warn(`Audio data is too small (${data.byteLength} bytes). Assuming API key or voice ID error.`);
      
      // Tenta decodificar como erro JSON antes de lançar o erro de tamanho
      try {
        const decoder = new TextDecoder('utf-8');
        const textData = decoder.decode(data);
        const errorJson = JSON.parse(textData);
        
        if (errorJson.error) {
            // Se for um erro JSON retornado pelo backend, lança o erro
            throw new Error(errorJson.error);
        }
      } catch (e) {
        // Se falhar a decodificação, lança o erro de tamanho
      }
      
      // MENSAGEM DE ERRO MAIS CLARA
      throw new Error(`Falha na geração de áudio. O arquivo retornado é muito pequeno (${data.byteLength} bytes). Verifique se a ELEVENLABS_API_KEY e a ELEVENLABS_VOICE_ID estão corretas e se a voz suporta o modelo 'eleven_multilingual_v2' para Português.`);
  }
  
  // Cria um Blob a partir do ArrayBuffer retornado
  const audioBlob = new Blob([data], { type: 'audio/mpeg' });
  
  // Cria um URL de objeto para o Blob
  return URL.createObjectURL(audioBlob);
};