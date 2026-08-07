const db = require('../config/db.js');



class PersonalController {
    constructor() { }


    async consultar(req, res) {
        try {
            const query = 'select id_personal, correo, nombre, apellido_p, apellido_m, rol from personal';
            const resultado = await db.query(query);
            res.status(200).json(resultado.rows);

        } catch (err) {
            console.log('esta fallando algo ', err);
            res.status(500).send(err);
        }
    }


    async agregar(req, res) {
        const { nombre, apellido_p, apellido_m, correo, password, rol, cedula, telefono } = req.body
        try {
            const query = `Insert into personal(nombre,apellido_p,apellido_m,correo,password,rol,cedula,telefono)
                values($1, $2, $3, $4 , $5, $6, $7, $8);`;

            const values = [nombre, apellido_p, apellido_m, correo, password, rol, cedula, telefono];


            const resultado = await db.query(query, values);

            res.status(201).json({ msj: 'personal registrada correctamente' });

        } catch (err) {
            console.log('algo salio mal manito')
            res.status(500).send(err)
        }
    }


    async actualizar(req, res) {
        const { id } = req.params;
        const { nombre, apellido_p, apellido_m, correo, cedula, telefono } = req.body;
        try {
            const checkQuery = 'SELECT rol FROM personal WHERE id_personal = $1';
            const checkResult = await db.query(checkQuery, [id]);

            if (checkResult.rows.length === 0) {
                return res.status(404).json({ error: 'La persona no se encuentra en la base de datos' });
            }

            // 3. Si la persona a editar es administrador, bloqueamos la operación
            if (checkResult.rows[0].rol === 'admin') {
                return res.status(403).json({ error: 'Operación denegada: No tienes permisos para modificar a otro administrador.' });
            }



            const query = ` Update personal
            set nombre= $1, 
            apellido_p=$2,
            apellido_m=$3,
            correo=$4,
            cedula=$5,
            telefono=$6
            where id_personal = $7
            returning nombre`

            const values = [nombre, apellido_p, apellido_m, correo, cedula, telefono, id]

            const resultado = await db.query(query, values);

            if (resultado.rows.length === 0) {

                return res.status(404).json({ error: 'la persona no se encuentra en la base de datos' });
            }

            res.status(200).json({ mjs: 'se actualizo correctamente', persona: resultado.rows[0] })

        } catch (err) {

            console.log('hay un error al actualizar', err);
            res.status(500).send(err);
        }
    }


    async eliminar(req, res) {

        const { id } = req.params;
        try {
            const checkQuery = 'SELECT rol FROM personal WHERE id_personal = $1';
            const checkResult = await db.query(checkQuery, [id]);

            if (checkResult.rows.length === 0) {
                return res.status(404).json({ err: 'Esa persona no existe en la base de datos ' })
            }

            // 2. Protegemos a los administradores
            if (checkResult.rows[0].rol === 'admin') {
                return res.status(403).json({ error: 'Operación denegada: No se puede eliminar a un administrador.' });
            }



            const query = `delete from personal where id_personal=$1`;
            const value = [id];

            const resultado = await db.query(query, value);
            if (resultado.rows.length === 0) {
                return res.status(404).json({ err: 'esa persona no existe en la base de datos ' })
            }
            res.status(200).json({ msj: `personal ${id} eliminada correctamente` })


        } catch (err) {
            console.log('algo salio mal', err);
            res.status(500).send(err);
        }

    }

    consultardetalle(req, res) {

        res.json({ msj: 'consultar un profe' })
    }






}

module.exports = new PersonalController();