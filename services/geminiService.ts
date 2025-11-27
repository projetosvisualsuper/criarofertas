import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

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

export const generateAdScript = async (product: Product): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Crie um roteiro de anúncio de áudio/vídeo curto (máximo 30 segundos) para o seguinte produto em Português (Brasil). O roteiro deve ser dividido em 3 ou 4 cenas/partes, incluindo uma chamada para ação clara.

      Detalhes do Produto:
      Nome: ${product.name}
      Descrição: ${product.description || 'Nenhuma descrição fornecida.'}
      Preço: R$ ${product.price} / ${product.unit}
      Preço Antigo: ${product.oldPrice ? `De R$ ${product.oldPrice}` : 'Não aplicável'}

      Formato do Roteiro (Use este formato exatamente):
      
      [CENA 1: Abertura Impactante]
      (Música animada começa)
      LOCUTOR: [Frase de impacto sobre o problema ou desejo]
      
      [CENA 2: Apresentação da Oferta]
      LOCUTOR: Mas hoje, temos a solução perfeita! O incrível ${product.name}!
      
      [CENA 3: Detalhes e Preço]
      LOCUTOR: Leve para casa por apenas R$ ${product.price} a ${product.unit}. ${product.oldPrice ? `Economize R$ ${(parseFloat(product.oldPrice) - parseFloat(product.price)).toFixed(2)}!` : ''}
      
      [CENA 4: Chamada para Ação]
      LOCUTOR: Não perca! Oferta válida só hoje. Visite nossa loja ou acesse nosso site agora!
      (Música termina com um jingle rápido)`,
    });
    return response.text?.trim() || "Erro ao gerar roteiro.";
  } catch (error) {
    console.error("Error generating ad script:", error);
    return "Não foi possível gerar o roteiro devido a um erro de conexão com a IA.";
  }
};