
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppLanguage } from "../types";

const getSystemInstruction = (lang: AppLanguage) => {
  const base = `You are 'Link', the cheerful AI guide for "Shanghai We Link!".
  
  FORMATTING RULES (CRITICAL):
  - Always use DOUBLE line breaks between paragraphs.
  - For lists, use '1.', '2.', '3.' and start each item on a NEW line.
  - Use 2-3 emojis per message to stay lively.
  - Keep sentences concise but warm.
  
  CONTENT:
  - Be a Shanghai expert. 
  - If asked about coffee, food, or metro, give specific, actionable tips.`;

  // Updated languageMap to include all AppLanguage variants to match the Record type
  const languageMap: Record<AppLanguage, string> = {
    'EN': `${base}\nRespond in English.`,
    'CN': `${base}\n请用中文回复。段落之间必须使用两个换行符。列表项必须另起一行。语气要亲切、充满活力。`,
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
  // Initializing GoogleGenAI inside the function as per best practices
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: getSystemInstruction(lang),
        temperature: 0.8,
      },
    });

    // Directly access the .text property of GenerateContentResponse
    return response.text || "Oops! Link is a bit shy right now. Try again? 🏮";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Link had a small technical hiccup. Let's try again! 🏙️";
  }
};
