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
          "name": "Product Name",
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
