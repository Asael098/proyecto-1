const { GoogleGenerativeAI } = require("@google/generative-ai");

class IAController {
  async generarQuiz(req, res) {
    const { idioma, nivel, tema, tipo, numero, habilidad, publico, instrucciones } = req.body;

    try {
      // Inicializamos Gemini (Recomendado: gemini-1.5-flash por su velocidad en JSON)
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

      // Prompt dinámico según el tipo de formato
      let estructuraJSON = '';
      let instruccionExtra = '';

      if (tipo === 'arrastrar_palabras') {
        estructuraJSON = `
                {
                  "title": "Título sugerido del Quiz",
                  "language": "${idioma}",
                  "level": "${nivel}",
                  "type": "arrastrar_palabras",
                  "instructions": "Ordena las palabras para formar la oración correcta.",
                  "questions": [
                    {
                      "question_text": "Instrucción breve para el alumno",
                      "correct_sentence": "La oración completa y correcta aquí",
                      "feedback": "Retroalimentación breve explicando la gramática o estructura"
                    }
                  ]
                }`;
        instruccionExtra = `Cada pregunta debe tener una oración completa y gramaticalmente correcta en ${idioma}. Las oraciones deben ser apropiadas para el nivel ${nivel}.`;

      } else if (tipo === 'relacion_columnas') {
        estructuraJSON = `
                {
                  "title": "Título sugerido del Quiz",
                  "language": "${idioma}",
                  "level": "${nivel}",
                  "type": "relacion_columnas",
                  "instructions": "Une cada elemento de la columna izquierda con su correspondiente de la columna derecha.",
                  "questions": [
                    {
                      "question_text": "Instrucción de la pregunta (Ej: Relaciona cada palabra con su traducción)",
                      "pairs": [
                        { "left": "elemento izquierda 1", "right": "elemento derecha 1" },
                        { "left": "elemento izquierda 2", "right": "elemento derecha 2" },
                        { "left": "elemento izquierda 3", "right": "elemento derecha 3" },
                        { "left": "elemento izquierda 4", "right": "elemento derecha 4" }
                      ],
                      "feedback": "Retroalimentación breve"
                    }
                  ]
                }`;
        instruccionExtra = `Cada pregunta debe tener entre 4 y 6 parejas para relacionar. Las parejas pueden ser: palabra-traducción, palabra-definición, imagen descriptiva-significado, verbo-conjugación, etc. Asegúrate de que las parejas sean claras y apropiadas para el nivel ${nivel}.`;

      } else if (tipo === 'texto_opcion_multiple') {
        estructuraJSON = `
                {
                  "title": "Título sugerido del Quiz",
                  "language": "${idioma}",
                  "level": "${nivel}",
                  "type": "texto_opcion_multiple",
                  "instructions": "Lee el texto y responde las preguntas.",
                  "questions": [
                    {
                      "question_text": "Pregunta sobre el texto de lectura",
                      "reading_text": "Un texto de lectura completo de al menos 4-6 oraciones en ${idioma}, apropiado para nivel ${nivel}.",
                      "options": ["opcion1", "opcion2", "opcion3"],
                      "correct_answer": "la opción correcta exacta",
                      "feedback": "Retroalimentación breve explicando la respuesta"
                    }
                  ]
                }`;
        instruccionExtra = `IMPORTANTE: Todas las preguntas deben compartir el MISMO texto de lectura (reading_text). El texto debe ser coherente, interesante y apropiado para ${publico} de nivel ${nivel}. El texto debe estar escrito en ${idioma}. Cada pregunta evalúa un aspecto diferente del texto.`;

      } else {
        estructuraJSON = `
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
                }`;
      }

      const descripcionTipo = {
        'arrastrar_palabras': 'ordenar palabras para formar oraciones correctas',
        'relacion_columnas': 'relación de columnas (unir parejas)',
        'texto_opcion_multiple': 'comprensión lectora con texto + opción múltiple',
      };

      const prompt = `
                Actúa como un profesor experto en diseño instruccional.
                Genera un quiz de ${idioma} nivel ${nivel} sobre el tema "${tema}".
                Público objetivo: ${publico}. Habilidad a evaluar: ${habilidad}.
                Crea ${numero} preguntas del tipo: ${descripcionTipo[tipo] || tipo}.
                ${instruccionExtra}
                Instrucciones adicionales: ${instrucciones}.

                DEBES RESPONDER ÚNICA Y ESTRICTAMENTE CON UN OBJETO JSON VÁLIDO. NO incluyas formato markdown (como \`\`\`json).
                La estructura exacta debe ser esta:
                ${estructuraJSON}
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