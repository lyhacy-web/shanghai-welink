import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppLanguage, Message, UserProfile } from "../types";

// 获取系统指令：定义 Link 的双重人格
const getSystemInstruction = (lang: AppLanguage, profile: UserProfile | null = null) => {
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
    Use this context to personalize your advice.`;
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
    'PT': `${base}\nResponda em português. Use quebras de linha duplas. No uses asteriscos (*).`,
    'RU': `${base}\nОтвечайте на русском языке. Используйте двойные разрывы строк. Не используйте звездочки (*).`,
    'AR': `${base}\nيرجى الرد باللغة العربية. استخدم فواصل أسطر مزدوجة. لا تستخدم علامات النجمة (*).`
  };

  return languageMap[lang] || languageMap['EN'];
};

export const sendMessageToLink = async (
  message: string, 
  lang: AppLanguage = 'EN', 
  history: Message[] = [],
  profile: UserProfile | null = null
): Promise<string> => {
  // 1. Vite 环境下正确读取 API Key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API Key missing! 🛠️");
    return "Link is currently offline. Please check the .env file.";
  }

  // 【核心修正】：使用 GoogleGenerativeAI 类
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 2. 初始化模型
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", // 2.5 还在预览期，建议先用 2.0-flash 调试，最稳。
    systemInstruction: getSystemInstruction(lang, profile),
  });

  // 3. 转换历史记录
  const contents = history.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  try {
    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const response = await result.response;
    let text = response.text() || "Oops! Link is a bit shy right now. 🏮";
    
    return text.replace(/\*/g, '');

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Link had a small technical hiccup. Let's try again! 🏙️";
  }
};