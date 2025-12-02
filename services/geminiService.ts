import { supabase } from "@/src/integrations/supabase/client";
import { Product, AdScript } from "../types";

// Helper function to invoke the edge function and handle responses
async function invokeGeminiProxy(task: string, data: any) {
  const { data: result, error } = await supabase.functions.invoke('gemini-proxy', {
    body: { task, data },
  });

  if (error) {
    console.error(`Error invoking edge function for task "${task}":`, error);
    throw new Error(error.message);
  }
  
  // CRITICAL CHECK: Ensure the result object and the nested response exist
  if (!result || !result.response) {
    console.error(`Edge function returned empty or malformed result for task "${task}":`, result);
    throw new Error("Edge function returned an empty or malformed response (missing 'response' field).");
  }
  
  // The actual Gemini response is nested inside the function's response
  return result.response;
}

export const generateMarketingCopy = async (topic: string): Promise<string> => {
  try {
    const response = await invokeGeminiProxy('generateMarketingCopy', { topic });
    return response.text?.trim() || "Ofertas Imperdíveis";
  } catch (error) {
    console.error("Error generating copy:", error);
    return "Super Ofertas";
  }
};

export const parseProductsFromText = async (text: string): Promise<Product[]> => {
  try {
    const response = await invokeGeminiProxy('parseProductsFromText', { text });
    const jsonStr = response.text?.trim();
    if (!jsonStr) return [];
    
    const rawProducts = JSON.parse(jsonStr);
    return rawProducts.map((p: any) => ({
      ...p,
      id: crypto.randomUUID(),
    }));
  } catch (error) {
    console.error("Error parsing products:", error);
    return [];
  }
};

export const generateBackgroundImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await invokeGeminiProxy('generateBackgroundImage', { prompt });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const generateAdScript = async (products: Product[]): Promise<AdScript> => {
  if (products.length === 0) {
    return { headline: "Nenhuma Oferta", script: "Selecione produtos para gerar o roteiro.", suggestions: { music: "Nenhuma", voice: "Nenhuma" } };
  }

  try {
    const response = await invokeGeminiProxy('generateAdScript', { products });
    const jsonStr = response.text?.trim();
    if (!jsonStr) throw new Error("Resposta JSON vazia.");
    
    return JSON.parse(jsonStr) as AdScript;
  } catch (error) {
    console.error("Error generating ad script:", error);
    return { headline: "Erro de Geração", script: "Não foi possível gerar o roteiro devido a um erro de conexão com a IA.", suggestions: { music: "Nenhuma", voice: "Nenhuma" } };
  }
};