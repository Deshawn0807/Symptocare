
import { GoogleGenAI, Type } from "@google/genai";
import { SymptomSuggestion, MedicationGuidance } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSymptomSuggestions = async (text: string): Promise<SymptomSuggestion[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on these symptoms: "${text}", suggest 5-8 more specific related symptoms to help narrow down the condition. Provide them in English and Tamil.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            labelEn: { type: Type.STRING },
            labelTa: { type: Type.STRING },
          },
          required: ["id", "labelEn", "labelTa"],
        },
      },
    },
  });

  return JSON.parse(response.text.trim());
};

export const getMedicationGuidance = async (
  confirmedSymptoms: string[],
  age: number | null
): Promise<MedicationGuidance> => {
  const ageStr = age ? `${age} years old` : "unspecified age";
  const prompt = `User symptoms: ${confirmedSymptoms.join(", ")}. User age: ${ageStr}. 
  Provide precautionary healthcare guidance. 
  Rules:
  1. Do not give a final medical diagnosis.
  2. Suggest over-the-counter (OTC) or standard first-aid remedies.
  3. Include dosage for infants (0-2), children (3-12), adults (13-64), and elderly (65+) if age is not specified. If age IS specified, prioritize that group but still mention others for context.
  4. Provide content in both English and Tamil.
  5. Include a confidence score (0-100) based on how common the symptom/medicine pairing is.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          possibleConditionEn: { type: Type.STRING },
          possibleConditionTa: { type: Type.STRING },
          medicineEn: { type: Type.STRING },
          medicineTa: { type: Type.STRING },
          dosageInfo: {
            type: Type.OBJECT,
            properties: {
              infant: { type: Type.STRING },
              child: { type: Type.STRING },
              adult: { type: Type.STRING },
              elderly: { type: Type.STRING },
            },
          },
          timingEn: { type: Type.STRING },
          timingTa: { type: Type.STRING },
          durationEn: { type: Type.STRING },
          durationTa: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER },
          precautionsEn: { type: Type.ARRAY, items: { type: Type.STRING } },
          precautionsTa: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          "possibleConditionEn", "possibleConditionTa", 
          "medicineEn", "medicineTa", "dosageInfo", 
          "timingEn", "timingTa", "durationEn", 
          "durationTa", "confidenceScore", 
          "precautionsEn", "precautionsTa"
        ],
      },
    },
  });

  return JSON.parse(response.text.trim());
};
