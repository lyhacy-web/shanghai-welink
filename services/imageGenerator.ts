import { GoogleGenAI } from "@google/genai";

export async function generateWestBundPicnicImage() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: 'A beautiful sunset picnic at West Bund Museum in Shanghai, artistic style, magical lighting, people sketching with coffee, vibrant colors, high resolution, cinematic view.',
        },
      ],
    },
  });

  for (const part of response.candidates![0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
