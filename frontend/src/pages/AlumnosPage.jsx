import React from 'react';
import { useState, useEffect } from "react";
import Table from '../componets/Table.jsx';
import { AlumnosTable } from '../Peticiones/RutasPeticiones.js';
import Form from '../componets/Form.jsx';
import { Input } from '../componets/Elements.jsx';
import { DeleteAlert, successAlert } from '../componets/Alerts.jsx';


function AlumnosPage() {

  const [data, setData] = useState([{}])
  const [editar, setEditar] = useState(null)
  const token = localStorage.getItem('token');


  const CargarAlumnos = () => {

    try {
      const peticion = fetch(AlumnosTable,
        {
          method: 'Get',
          headers: { 'Authorization': token }
        });
      peticion.then(res => res.json()).then(res => setData(res))


    } catch (error) {
      console.log('ocurrio un error', error.message)
    }

  }



  useEffect(() => {
    CargarAlumnos()
  }, [])




  const Eliminar = (registro) => {
    const keys = Object.keys(registro)
    const idkey = keys[0]
    const id = registro[idkey]

    DeleteAlert().then(res => {
      if (res.isConfirmed) {
        const peticion = fetch(AlumnosTable + `/${id}`, {
          method: 'Delete',
          headers: { 'Authorization': token }
        })

        peticion.then(res => res.json()).then(res => console.log(res))

        const newdata = data.filter(v => v[idkey] !== id)
        setData(newdata)
      } else {
        console.log('se cancela todo')
      }
    })
  }

  const agregar = (e) => {

    e.preventDefault()

    const datos = new FormData(e.target)
    const registro = Object.fromEntries(datos)
    const peticion = fetch(AlumnosTable, {
      method: 'Post',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify(registro)
    })

    peticion.then(res => {
      if (!res.ok) {
        alert(res.json().error || 'Error al guardar el registro');
        return;

      }
      return res.json()

    }
    ).then(res => {

      successAlert('Registro completado')
      CargarAlumnos()

    }).catch(err => console.log('error de red', err))

    e.target.reset();

  }



  const Actualizar = async (e) => {
    e.preventDefault()
    console.log(editar.nombre)

    const data = new FormData(e.target)
    const registro = Object.fromEntries(data)
    const id = editar.id_alumno

    const peticion = await fetch(AlumnosTable + `/${id}`, {
      method: 'Put',
      headers: { 'Authorization': token, 'Content-Type': 'application/json' },
      body: JSON.stringify(registro)
    })

    const respuesta = await peticion.json()
    successAlert('Registro actualizado')
    CargarAlumnos()
    setEditar(null)


  }

  const prepararEdicion = (registro) => {
    setEditar({
      ...registro,
      stamp: Date.now()
    });
  }



  return (
    <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sanspro text-slate-200">

      {/* Encabezado del Dashboard */}
      <div className="mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-wide">
          Gestión de Alumnos
        </h1>
        <p className="text-slate-400 mt-2">
          Administra los registros estudiantiles de la plataforma QuizHub AI
        </p>
      </div>

      {/* Contenedor principal a dos columnas */}
      <div className="flex flex-col xl:flex-row gap-8 items-start">

        {/* PANEL IZQUIERDO: Formulario Flotante */}
        <div className="w-full xl:w-1/3 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700 sticky top-8">
          <div className="mb-6 border-b border-slate-700 pb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-emerald-400">
              {editar ? '✏️ Editando Alumno' : '➕ Registrar Nuevo'}
            </h2>
          </div>

          <Form
            onSubmit={editar ? Actualizar : agregar}
            editar={editar}
            onCancel={() => setEditar(null)}
            key={editar ? editar.stamp : 'nuevo'}
          >
            {/* Contenedor con espacio vertical para los inputs */}
            <div className="space-y-4 mb-6">
              <Input placeholder='Nombre' type='text' name='nombre' defaultValue={editar?.nombre || ''} />
              <Input placeholder='Apellido Paterno' type='text' name='apellido_p' defaultValue={editar?.apellido_p || ''} />
              <Input placeholder='Apellido Materno' type='text' name='apellido_m' defaultValue={editar?.apellido_m || ''} />
              <Input placeholder='Correo Electrónico' type='email' name='correo' defaultValue={editar?.correo || ''} />
              <Input placeholder='Contraseña' type='text' name='password' defaultValue={editar?.password || ''} />
              <Input placeholder='Fecha de Nacimiento' type='date' name='fecha_n' defaultValue={editar?.fecha_nacimiento || ''} />
              <Input placeholder='Teléfono' type='tel' name='telefono' defaultValue={editar?.telefono || ''} />
            </div>
          </Form>
        </div>

        {/* PANEL DERECHO: Tabla de Datos */}
        <div className="w-full xl:w-2/3 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700">

          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Directorio de Estudiantes</h2>

            {/* Insignia dinámica que cuenta los alumnos */}
            <span className="bg-emerald-500/20 text-emerald-400 py-1 px-3 rounded-full text-sm font-medium border border-emerald-500/30">
              Total: {data && data.length > 0 && Object.keys(data[0]).length > 0 ? data.length : 0}
            </span>
          </div>

          {/* Envoltura para darle bordes redondeados al componente Table interno */}
          <div className="overflow-hidden rounded-xl border border-slate-700 shadow-inner">
            <Table
              ocultar={['password', 'id_alumno']}
              onDelete={Eliminar}
              data={data}
              onEdit={prepararEdicion}
            />
          </div>

        </div>

      </div>
    </div>
  )
}

export default AlumnosPage
