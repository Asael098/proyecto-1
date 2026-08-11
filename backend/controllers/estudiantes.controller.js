const db = require('../config/db.js')

class Estudiante {


    constructor() { }

    async consultar(req, res) {

        try {
            const query = `select id_alumno, 
                            nombre, 
                            apellido_p, 
                            apellido_m, 
                            correo, 
                            password, 
                            telefono,
                            TO_CHAR(fecha_nacimiento, 'YYYY-MM-DD') AS fecha_nacimiento
                            from alumno`

            const results = await db.query(query)


            res.status(200).json(results.rows)

        } catch (err) {
            console.log(err)
            res.status(500).json({
                'error': err,
                'razon': 'falla en la consulta del servidor '
            })
        }

    }

    async agregar(req, res) {

        const { nombre, apellido_p, apellido_m, correo, password, fecha_n, telefono } = req.body

        try {


            if (Number.isNaN(+telefono)) {

                return res.status(400).json({ error: 'Solo pueden haber números en el campo teléfono' });
            }

            const query = `insert into alumno
            ( nombre,apellido_p,apellido_m,correo,password,fecha_nacimiento,telefono)values($1,$2,$3,$4,$5,$6,$7)`

            const values = [nombre, apellido_p, apellido_m, correo, password, fecha_n, telefono]

            const results = await db.query(query, values)

            res.status(201).json({ 'msj': 'alumno registrado correctamente' })




        } catch (err) {
            console.log(err)
            res.status(500).json({
                'erro': err,
                'razon': 'error del servidor'
            })
        }
    }

    async eliminar(req, res) {

        const { id } = req.params

        try {
            const query = `delete from alumno
            where id_alumno=$1`

            const value = [id]
            const result = db.query(query, value)

            res.status(200).json({
                'msj': `alumno con id: ${id} fue eliminado`
            })




        } catch (err) {
            console.log(err)
            res.status(500).json({ 'msj': 'error en el servidor' })
        }



    }

    async actualizar(req, res) {

        const { id } = req.params
        const { nombre, apellido_p, apellido_m, fecha_n, telefono, correo, password } = req.body
        try {

            if (Number.isNaN(+telefono)) {

                return res.status(400).json({ error: 'Solo pueden haber números en el campo teléfono' });
            }

            const query = `update alumno
            set nombre=$1,apellido_p=$2,apellido_m=$3,fecha_nacimiento=$4,telefono=$5,correo=$6,password=$7
            where id_alumno=$8`

            const values = [nombre, apellido_p, apellido_m, fecha_n, telefono, correo, password, id]

            const result = await db.query(query, values)

            res.status(200).json({
                'msj': `alumno con id: ${id} fue actualizado`
            })





        } catch (error) {
            console.log(error)
            res.status(500).json({

                'err': `error del servidor ${error}`
            })
        }





    }



}

module.exports = new Estudiante()