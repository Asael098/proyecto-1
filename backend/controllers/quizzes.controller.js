const db = require('../config/db');

class QuizzesController {

    // ==========================================
    // 1. GET: Obtener todos los quizzes del profesor
    // ==========================================
    async obtenerMisQuizzes(req, res) {
        const id_personal = req.usuario.id_personal;

        try {
            const query = `SELECT * FROM quizzes WHERE id_personal = $1 ORDER BY id_quizz DESC`;
            const result = await db.query(query, [id_personal]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error en el servidor: ${error.message}` });
        }
    }

    // ==========================================
    // 2. POST: Crear la "Cabecera" de un nuevo Quiz
    // ==========================================
    async crearQuizz(req, res) {
        const id_personal = req.usuario.id_personal;
        const { nombre, tipo, nivel, idioma, tema, habilidad, instrucciones } = req.body;

        try {
            const query = `
                INSERT INTO quizzes (id_personal, nombre, tipo, nivel, idioma, tema, habilidad, instrucciones) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
            `;
            const values = [id_personal, nombre, tipo, nivel, idioma, tema, habilidad, instrucciones];
            const result = await db.query(query, values);

            res.status(200).json({ mensaje: 'Quiz creado exitosamente', quiz: result.rows[0] });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error al crear quiz: ${error.message}` });
        }
    }

    // ==========================================
    // 3. PUT: Actualizar configuración del Quiz (Ej. Publicarlo)
    // ==========================================
    async actualizarQuizz(req, res) {
        const { id } = req.params;
        const id_personal = req.usuario.id_personal;
        const { nombre, tipo, status, nivel, idioma, tema, habilidad, instrucciones } = req.body;

        try {
            const query = `
                UPDATE quizzes 
                SET nombre=$1, tipo=$2, status=$3, nivel=$4, idioma=$5, tema=$6, habilidad=$7, instrucciones=$8
                WHERE id_quizz=$9 AND id_personal=$10 RETURNING *
            `;
            const values = [nombre, tipo, status, nivel, idioma, tema, habilidad, instrucciones, id, id_personal];
            const result = await db.query(query, values);

            if (result.rowCount === 0) return res.status(404).json({ error: 'Quiz no encontrado o sin permisos' });
            res.status(200).json({ mensaje: 'Quiz actualizado', quiz: result.rows[0] });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error al actualizar: ${error.message}` });
        }
    }

    // ==========================================
    // 4. DELETE: Eliminar Quiz (Elimina preguntas en cascada)
    // ==========================================
    async eliminarQuizz(req, res) {
        const { id } = req.params;
        const id_personal = req.usuario.id_personal;

        try {
            const query = `DELETE FROM quizzes WHERE id_quizz=$1 AND id_personal=$2`;
            const result = await db.query(query, [id, id_personal]);

            if (result.rowCount === 0) return res.status(404).json({ error: 'Quiz no encontrado' });
            res.status(200).json({ mensaje: 'Quiz eliminado correctamente' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error al eliminar: ${error.message}` });
        }
    }

    // =======================================================
    // --- SECCIÓN DE PREGUNTAS (EL MOTOR JSONB) ---
    // =======================================================

    // GET: Cargar las preguntas de un quiz específico
    async obtenerPreguntas(req, res) {
        const { id_quizz } = req.params;

        try {
            const query = `SELECT * FROM preguntas WHERE id_quizz = $1 ORDER BY id_detalle_quizz ASC`;
            const result = await db.query(query, [id_quizz]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error al cargar preguntas: ${error.message}` });
        }
    }

    // POST: Guardar todas las preguntas (Lote)
    async guardarPreguntas(req, res) {
        const { id_quizz } = req.params;
        const { preguntas } = req.body; // Un arreglo de objetos desde React
        const id_personal = req.usuario.id_personal;

        try {
            // 1. Validar que el profesor es dueño de este quiz
            const checkQuery = `SELECT id_quizz FROM quizzes WHERE id_quizz=$1 AND id_personal=$2`;
            const checkResult = await db.query(checkQuery, [id_quizz, id_personal]);
            if (checkResult.rowCount === 0) return res.status(403).json({ error: 'No tienes permisos sobre este quiz' });

            // 2. Limpieza: Borramos las preguntas anteriores de este quiz
            await db.query(`DELETE FROM preguntas WHERE id_quizz=$1`, [id_quizz]);

            // 3. Inserción Dinámica
            if (preguntas && preguntas.length > 0) {
                const insertQuery = `INSERT INTO preguntas (id_quizz, pregunta, respuestas) VALUES ($1, $2, $3)`;

                for (let item of preguntas) {
                    // Stringify asegura que el objeto JS se guarde perfectamente en la columna JSONB
                    await db.query(insertQuery, [id_quizz, item.pregunta, JSON.stringify(item.respuestas)]);
                }
            }

            res.status(200).json({ mensaje: 'Preguntas guardadas con éxito' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error al guardar preguntas: ${error.message}` });
        }
    }
}

module.exports = new QuizzesController();