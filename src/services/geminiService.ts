import { GoogleGenAI } from "@google/genai";

let genAI: any = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. AI features are disabled.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export async function generateMedicineDescription(medicineName: string, genericName: string, category: string): Promise<string> {
  try {
    const ai = getAI();
    
    const prompt = `Generate a brief, professional description for a medicine named "${medicineName}" (${genericName}) in the category "${category}". Include common usages and any general advice. Keep it under 60 words.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text?.trim() || "No description generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate description. Please enter manually.";
  }
}
