const { GoogleGenerativeAI } = require("@google/generative-ai");

class IAController {
  async generarQuiz(req, res) {
    const { idioma, nivel, tema, tipo, numero, habilidad, publico, instrucciones } = req.body;

    try {
      // Inicializamos Gemini (Recomendado: gemini-1.5-flash por su velocidad en JSON)
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

      const prompt = `
                Actúa como un profesor experto en diseño instruccional.
                Genera un quiz de ${idioma} nivel ${nivel} sobre el tema "${tema}".
                Público objetivo: ${publico}. Habilidad a evaluar: ${habilidad}.
                Crea ${numero} preguntas del tipo: ${tipo}.
                Instrucciones adicionales: ${instrucciones}.

                DEBES RESPONDER ÚNICA Y ESTRICTAMENTE CON UN OBJETO JSON VÁLIDO. NO incluyas formato markdown (como \`\`\`json).
                La estructura exacta debe ser esta:
                {
                  "title": "Título sugerido del Quiz",
                  "language": "${idioma}",
                  "level": "${nivel}",
                  "type": "multiple_choice",
                  "instructions": "Instrucciones generales para el alumno",
                  "questions": [
                    {
                      "question_text": "La pregunta aquí",
                      "options": ["opcion1", "opcion2", "opcion3", "opcion4"], 
                      "correct_answer": "opcion correcta aquí",
                      "feedback": "Retroalimentación breve explicando la respuesta"
                    }
                  ]
                }
            `;

      const result = await model.generateContent(prompt);
      let texto = result.response.text();

      // Limpieza por seguridad (por si la IA añade markdown accidentalmente)
      texto = texto.replace(/```json/g, '').replace(/```/g, '').trim();

      const quizJson = JSON.parse(texto);
      res.status(200).json(quizJson);

    } catch (error) {
      console.error("Error en IA:", error);
      res.status(500).json({ error: "No se pudo generar el quiz con IA. Intenta ser más específico en el tema." });
    }
  }
}

module.exports = new IAController();