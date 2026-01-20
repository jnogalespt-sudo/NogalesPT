
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI SDK with the API key from environment variables.
// Using GoogleGenAI according to the latest library guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  /**
   * Generates a conversational response from Gemini.
   * Uses the 'gemini-3-flash-preview' model for efficient and fast text generation.
   */
  async generateResponse(message: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: message,
        config: {
          systemInstruction: "Eres un asistente experto para docentes en NOGALESPT, un repositorio de recursos REA para Andalucía. Proporcionas consejos pedagógicos, ideas de actividades, adaptaciones curriculares y ayuda con materiales educativos. Tu tono es profesional, motivador y cercano.",
          temperature: 0.7,
        },
      });
      
      // Accessing the .text property directly from GenerateContentResponse as per guidelines.
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  },

  /**
   * Specialized function for resource-based suggestions.
   */
  async getResourceAdvice(resourceTitle: string, summary: string, level: string) {
    try {
      const prompt = `Analiza este recurso educativo titulado "${resourceTitle}" para el nivel "${level}" con el resumen "${summary}". Sugiere 3 formas creativas de adaptarlo para alumnos con Necesidades Específicas de Apoyo Educativo (NEAE).`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Lo siento, no he podido generar sugerencias para este recurso en este momento.";
    }
  }
};
