import { GoogleGenAI, Type } from "@google/genai";
import { Product, AdScript } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMarketingCopy = async (topic: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a catchy, short, and exciting headline (max 8 words) for a retail sales poster about: ${topic}. Language: Portuguese (Brazil). Do not include quotes.`,
    });
    return response.text?.trim() || "Ofertas Imperdíveis";
  } catch (error) {
    console.error("Error generating copy:", error);
    return "Super Ofertas";
  }
};

export const parseProductsFromText = async (text: string): Promise<Product[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract a list of products with prices from this text. Return a JSON array. 
      Text: "${text}"
      
      Format:
      [
        {
          "name": "Product Name / Title",
          "description": "Short product description" (optional),
          "price": "9.99",
          "oldPrice": "12.99" (optional),
          "unit": "un" (or kg, g, etc - guess based on context)
        }
      ]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.STRING },
              oldPrice: { type: Type.STRING },
              unit: { type: Type.STRING },
            },
            required: ["name", "price", "unit"],
          },
        },
      },
    });

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
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `Background image for a supermarket flyer, texture, marketing background, high quality, 8k, ${prompt}`,
          },
        ],
      },
    });

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

  const productDetails = products.map(p => 
    `Nome: ${p.name}, Preço: R$ ${p.price} / ${p.unit}, De: ${p.oldPrice ? `R$ ${p.oldPrice}` : 'Não aplicável'}, Descrição: ${p.description || 'Nenhuma'}`
  ).join('\n---\n');

  const prompt = `Crie um roteiro de anúncio de áudio/vídeo curto (máximo 30 segundos) para as seguintes ofertas em Português (Brasil). O roteiro deve ser dividido em 3 ou 4 cenas/partes, incluindo uma chamada para ação clara.

Detalhes dos Produtos:
${productDetails}

Gere a resposta em formato JSON, seguindo exatamente o schema fornecido.

Schema JSON:
{
  "headline": "Frase de impacto curta para o anúncio",
  "script": "O roteiro completo, formatado com quebras de linha e marcadores de cena (ex: [CENA 1: Abertura])",
  "suggestions": {
    "music": "Sugestão de estilo musical (ex: Jingle animado, Música de suspense)",
    "voice": "Sugestão de estilo de voz do locutor (ex: Entusiasmado e rápido, Calmo e persuasivo)"
  }
}`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            script: { type: Type.STRING },
            suggestions: {
              type: Type.OBJECT,
              properties: {
                music: { type: Type.STRING },
                voice: { type: Type.STRING },
              },
              required: ["music", "voice"],
            },
          },
          required: ["headline", "script", "suggestions"],
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) throw new Error("Resposta JSON vazia.");
    
    return JSON.parse(jsonStr) as AdScript;

  } catch (error) {
    console.error("Error generating ad script:", error);
    return { headline: "Erro de Geração", script: "Não foi possível gerar o roteiro devido a um erro de conexão com a IA.", suggestions: { music: "Nenhuma", voice: "Nenhuma" } };
  }
};