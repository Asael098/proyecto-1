const db = require('../config/db');

class AsignacionGrupoController {

    // ==========================================
    // GET: Obtener MIS alumnos (asignados por el Admin)
    // ==========================================
    async obtenerMisAlumnos(req, res) {
        const id_personal = req.usuario.id_personal;

        try {
            // Usamos INNER JOIN para unir la tabla 'alumno' con la tabla 'asignar_alumno'
            const query = `
                SELECT a.id_alumno, a.nombre, a.apellido_p, a.correo 
                FROM alumno a
                INNER JOIN asignar_alumno aa ON a.id_alumno = aa.id_alumno
                WHERE aa.id_personal = $1
                ORDER BY a.nombre ASC
            `;
            const result = await db.query(query, [id_personal]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error en el servidor: ${error.message}` });
        }
    }

    // ==========================================
    // GET: Obtener alumnos marcados en un grupo
    // ==========================================
    async obtenerAlumnosDeGrupo(req, res) {
        const { id_grupo } = req.params;

        try {
            const query = `SELECT id_alumno FROM asignar_grupo WHERE id_grupo = $1`;
            const result = await db.query(query, [id_grupo]);

            // Extraemos solo los IDs para el frontend: [12, 14, 20]
            const alumnos_ids = result.rows.map(row => row.id_alumno);
            res.status(200).json({ alumnos_ids });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error en el servidor: ${error.message}` });
        }
    }

    // ==========================================
    // POST: Guardar lista de alumnos en el grupo
    // ==========================================
    async guardarAsignacion(req, res) {
        const { id_grupo, alumnos } = req.body;
        const id_personal = req.usuario.id_personal; // Para verificar seguridad

        try {
            // 1. SEGURIDAD: Comprobar que el grupo le pertenece al profesor que hace la petición
            const checkQuery = `SELECT id_grupo FROM grupos WHERE id_grupo = $1 AND id_personal = $2`;
            const checkResult = await db.query(checkQuery, [id_grupo, id_personal]);

            if (checkResult.rowCount === 0) {
                return res.status(403).json({ error: 'No tienes permisos para modificar este grupo' });
            }

            // 2. LIMPIEZA: Borramos los alumnos viejos de este grupo
            await db.query(`DELETE FROM asignar_grupo WHERE id_grupo = $1`, [id_grupo]);

            // 3. INSERCIÓN: Metemos a los alumnos nuevos
            if (alumnos && alumnos.length > 0) {
                const insertQuery = `INSERT INTO asignar_grupo (id_grupo, id_alumno) VALUES ($1, $2)`;

                for (let id_alumno of alumnos) {
                    await db.query(insertQuery, [id_grupo, id_alumno]);
                }
            }

            res.status(200).json({ mensaje: 'Lista de grupo actualizada' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error al guardar: ${error.message}` });
        }
    }
    async obtenerDetallesAlumnos(req, res) {
        const { id_grupo } = req.params;

        try {
            // Unimos la tabla de alumnos con la tabla intermedia para sacar los datos reales
            const query = `
                SELECT a.id_alumno, a.nombre, a.apellido_p, a.correo
                FROM alumno a
                INNER JOIN asignar_grupo ag ON a.id_alumno = ag.id_alumno
                WHERE ag.id_grupo = $1
                ORDER BY a.nombre ASC
            `;
            const result = await db.query(query, [id_grupo]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error en el servidor: ${error.message}` });
        }
    }
}


module.exports = new AsignacionGrupoController();