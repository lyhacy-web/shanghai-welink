import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppLanguage } from "../types";

const getSystemInstruction = (lang: AppLanguage) => {
  // 【产品逻辑】：这里定义了 Link 的双重人格
  const base = `You are 'Link', the cheerful AI guide for "Shanghai We Link!". 

  ROLE RULES:
  1. For LIFESTYLE (coffee, food, metro): Be very cheerful, use 2-3 emojis, and give insider tips.
  2. For POLICY (Work Permit, Visa, Residence): Be professional, clear, and use bullet points (1. 2. 3.). 
  
  CRITICAL SAFETY:
  - If a user asks about official policies and you are not 100% sure, ALWAYS advise them to call the 'Shanghai Government Service Hotline: 12345'.
  - Never make up visa or permit requirements.

  FORMATTING:
  - You MUST use DOUBLE line breaks between paragraphs for readability.
  - Keep sentences concise but warm.`;

  const languageMap: Record<AppLanguage, string> = {
    'EN': `${base}\nRespond in English.`,
    'CN': `${base}\n请用中文回复。段落之间必须使用两个换行符。列表项必须另起一行。语气要亲切。`,
    'JP': `${base}\n日本語で答えてください。段落の間に空行を入れてください。`,
    'KR': `${base}\n한국어로 답변해 주세요. 단락 사이에 공백을 두세요.`,
    'FR': `${base}\nRépondez en français. Utilisez des doubles sauts de ligne.`,
    'ES': `${base}\nResponde en español. Usa dobles saltos de línea.`,
    'DE': `${base}\nAntworte auf Deutsch. Verwenden Sie doppelte Zeilenumbrüche.`,
    'IT': `${base}\nRispondi in italiano. Usa doppi salti di riga.`,
    'PT': `${base}\nResponda em português. Use quebras de linha duplas.`,
    'RU': `${base}\nОтвечайте на русском языке. Используйте двойные разрывы строк.`,
    'AR': `${base}\nيرجى الرد باللغة العربية. استخدم فواصل أسطر مزدوجة.`
  };

  return languageMap[lang] || languageMap['EN'];
};

export const sendMessageToLink = async (message: string, lang: AppLanguage = 'EN'): Promise<string> => {
  // 【修正点】：使用 Vite 的环境变量写法获取 API Key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API Key missing! Make sure VITE_GEMINI_API_KEY is set in Vercel.");
    return "Link is currently offline. Please check the API configuration. 🛠️";
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      // 使用最新的 Gemini 3 Flash，兼顾速度与智能
      model: 'gemini-3-flash-preview', 
      contents: message,
      config: {
        systemInstruction: getSystemInstruction(lang),
        // 【调优】：0.5 的温度既能保持生活话题的活泼，又能保证政策话题的稳健
        temperature: 0.5, 
      },
    });

    return response.text || "Oops! Link is a bit shy right now. Try again? 🏮";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Link had a small technical hiccup. Let's try again! 🏙️";
  }
};
