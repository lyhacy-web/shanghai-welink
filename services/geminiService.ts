import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppLanguage, Message, UserProfile } from "../types";

const getSystemInstruction = (lang: AppLanguage, profile: UserProfile | null = null) => {
  // 【产品逻辑】：这里定义了 Link 的双重人格
  let base = `You are 'Link', the cheerful AI guide for "Shanghai We Link!". 

  ROLE RULES:
  1. For LIFESTYLE (coffee, food, metro): Be very cheerful, use 2-3 emojis, and give insider tips.
  2. For POLICY (Work Permit, Visa, Residence): Be professional, clear, and use bullet points (1. 2. 3.). 
  
  CRITICAL SAFETY:
  - If a user asks about official policies and you are not 100% sure, ALWAYS advise them to call the 'Shanghai Government Service Hotline: 12345'.
  - Never make up visa or permit requirements.

  FORMATTING:
  - You MUST use DOUBLE line breaks between paragraphs for readability.
  - Keep sentences concise but warm.
  - DO NOT use asterisks (*) for bolding or lists. Use plain text or numbers for lists.`;

  if (profile) {
    base += `\n\nUSER CONTEXT:
    - Nationality: ${profile.nationality}
    - Occupation: ${profile.occupation}
    - Duration in Shanghai: ${profile.durationInSH}
    - Interests: ${profile.interests.join(', ')}
    Use this context to personalize your advice (e.g., recommend things near their interests or relevant to their background).`;
  }

  const languageMap: Record<AppLanguage, string> = {
    'EN': `${base}\nRespond in English. Do not use asterisks.`,
    'CN': `${base}\n请用中文回复。段落之间必须使用两个换行符。列表项必须另起一行。语气要亲切。不要使用星号（*）。`,
    'JP': `${base}\n日本語で答えてください。段落の間に空行を入れてください。アスタリスク（*）は使用しないでください。`,
    'KR': `${base}\n한국어로 답변해 주세요. 단락 사이에 공백을 두세요. 별표(*)를 사용하지 마세요.`,
    'FR': `${base}\nRépondez en français. Utilisez des doubles sauts de ligne. N'utilisez pas d'astérisques (*).`,
    'ES': `${base}\nResponde en español. Usa dobles saltos de línea. No uses asteriscos (*).`,
    'DE': `${base}\nAntworte auf Deutsch. Verwenden Sie doppelte Zeilenumbrüche. Verwenden Sie keine Sternchen (*).`,
    'IT': `${base}\nRispondi in italiano. Usa doppi salti di riga. Non usare asterischi (*).`,
    'PT': `${base}\nResponda em português. Use quebras de linha duplas. Não use asteriscos (*).`,
    'RU': `${base}\nОтвечайте на русском языке. Используйте двойные разрывы строк. Не используйте звездочки (*).`,
    'AR': `${base}\nيرجى الرد باللغة العربية. استخدم فواصل أسطر مزدوجة. لا تستخدم علامات النجمة (*).`
  };

  return languageMap[lang] || languageMap['EN'];
};

export interface LinkResponse {
  text: string;
  groundingMetadata?: any;
}

export const sendMessageToLink = async (
  message: string, 
  lang: AppLanguage = 'EN', 
  history: Message[] = [],
  profile: UserProfile | null = null,
  location?: { latitude: number; longitude: number }
): Promise<LinkResponse> => {
  // Use process.env.GEMINI_API_KEY as per environment guidelines
  const apiKey =import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API Key missing! Make sure GEMINI_API_KEY is set.");
    return { text: "Link is currently offline. Please check the API configuration. 🛠️" };
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  // Convert history to Gemini format, ensuring alternating roles and starting with 'user'
  const tempContents: any[] = [];
  const historyToProcess = history.slice(-10);
  
  for (const msg of historyToProcess) {
    const role = msg.sender === 'user' ? 'user' : 'model';
    // Gemini requires the first message to be from the 'user'
    if (tempContents.length === 0 && role === 'model') continue;
    
    if (tempContents.length > 0 && tempContents[tempContents.length - 1].role === role) {
      // Merge consecutive messages from the same role
      tempContents[tempContents.length - 1].parts[0].text += `\n${msg.text}`;
    } else {
      tempContents.push({
        role,
        parts: [{ text: msg.text }]
      });
    }
  }

  // Add current message, merging if the last message in history was also from 'user'
  if (tempContents.length > 0 && tempContents[tempContents.length - 1].role === 'user') {
    tempContents[tempContents.length - 1].parts[0].text += `\n${message}`;
  } else {
    tempContents.push({
      role: 'user',
      parts: [{ text: message }]
    });
  }
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      // 使用最新的 Gemini 3 Flash，兼顾速度与智能
      model: 'gemini-3-flash-preview', 
      contents: tempContents,
      config: {
        systemInstruction: getSystemInstruction(lang, profile),
        // 【调优】：0.5 的温度既能保持生活话题的活泼，又能保证政策话题的稳健
        temperature: 0.5, 
        tools: [{ googleMaps: {} }],
        toolConfig: location ? {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        } : undefined
      },
    });

    const text = response.text || "Oops! Link is a bit shy right now. Try again? 🏮";
    // Post-process to ensure no asterisks are present
    return {
      text: text.replace(/\*/g, ''),
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Link had a small technical hiccup. Let's try again! 🏙️" };
  }
};
