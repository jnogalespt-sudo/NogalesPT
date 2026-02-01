
import { GoogleGenAI } from "@google/genai";

/**
 * Servicio de IA optimizado para el repositorio NOGALESPT.
 * Proporciona asistencia pedagógica y consejos de adaptación curricular.
 */
export const geminiService = {
  /**
   * Genera una respuesta conversacional desde Gemini.
   */
  async generateResponse(message: string) {
    try {
      // Inicialización dentro del método para evitar errores de acceso a process.env en la carga del módulo
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: message,
        config: {
          systemInstruction: "Eres un asistente experto para docentes en NOGALESPT, un repositorio de recursos REA para Andalucía. Proporcionas consejos pedagógicos, ideas de actividades, adaptaciones curriculares y ayuda con materiales educativos. Tu tono es profesional, motivador y cercano.",
          temperature: 0.7,
        },
      });
      
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  },

  /**
   * Función especializada para sugerencias basadas en recursos.
   */
  async getResourceAdvice(resourceTitle: string, summary: string, level: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
