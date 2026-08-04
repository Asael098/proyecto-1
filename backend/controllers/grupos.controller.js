const db = require('../config/db');

class GruposController {
    constructor() { }

    // ==========================================
    // GET: Obtener solo los grupos del profesor logueado
    // ==========================================
    async obtenerGrupos(req, res) {
        // Extraemos el ID del profesor desde el token (inyectado por el middleware)
        // Nota: Ajusta 'id_personal' si en tu payload del token lo llamaste distinto (ej. 'id')
        const id_personal = req.usuario.id_personal || req.usuario.id;

        try {
            const query = `SELECT * FROM grupos WHERE id_personal = $1 ORDER BY id_grupo DESC`;
            const result = await db.query(query, [id_personal]);

            res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: `Error al obtener grupos: ${error.message}` });
        }
    }

    // ==========================================
    // POST: Crear un nuevo grupo
    // ==========================================
    async crearGrupo(req, res) {
        const { nombre, idioma } = req.body;
        const id_personal = req.usuario.id_personal || req.usuario.id;

        // Validación básica
        if (!nombre || !idioma) {
            return res.status(400).json({ error: 'El nombre y el idioma son obligatorios' });
        }

        try {
            const query = `
                INSERT INTO grupos (id_personal, nombre, idioma) 
                VALUES ($1, $2, $3) RETURNING *
            `;
            const result = await db.query(query, [id_personal, nombre, idioma]);

            res.status(201).json({
                mensaje: 'Grupo creado exitosamente',
                grupo: result.rows[0]
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: `Error al crear grupo: ${error.message}` });
        }
    }

    // ==========================================
    // PUT: Actualizar un grupo existente
    // ==========================================
    async actualizarGrupo(req, res) {
        const { id } = req.params; // Este es el id_grupo que viene en la URL
        const { nombre, idioma } = req.body;
        const id_personal = req.usuario.id_personal || req.usuario.id;

        try {
            // Validamos con id_personal para asegurar que el profe solo edite SUS grupos
            const query = `
                UPDATE grupos 
                SET nombre = $1, idioma = $2 
                WHERE id_grupo = $3 AND id_personal = $4 
                RETURNING *
            `;
            const result = await db.query(query, [nombre, idioma, id, id_personal]);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Grupo no encontrado o no tienes permiso para editarlo' });
            }

            res.status(200).json({
                mensaje: 'Grupo actualizado correctamente',
                grupo: result.rows[0]
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: `Error al actualizar grupo: ${error.message}` });
        }
    }

    // ==========================================
    // DELETE: Eliminar un grupo
    // ==========================================
    async eliminarGrupo(req, res) {
        const { id } = req.params;
        const id_personal = req.usuario.id_personal || req.usuario.id;

        try {
            // Validamos con id_personal para evitar que borre grupos de otros maestros
            const query = `DELETE FROM grupos WHERE id_grupo = $1 AND id_personal = $2`;
            const result = await db.query(query, [id, id_personal]);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Grupo no encontrado o no tienes permiso para eliminarlo' });
            }

            res.status(200).json({ mensaje: 'Grupo eliminado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: `Error al eliminar grupo: ${error.message}` });
        }
    }
}

module.exports = new GruposController();