import React, { useState, useEffect } from 'react';
import Table from '../componets/Table.jsx';
import Form from '../componets/Form.jsx';
import { Input, Select } from '../componets/Elements.jsx';
import { DeleteAlert, successAlert } from '../componets/Alerts.jsx';
// Asegúrate de tener exportada esta ruta en tu archivo de peticiones
import { PersonalTable } from '../Peticiones/RutasPeticiones.js';

function PersonalPage() {
    const [data, setData] = useState([]);
    const [editar, setEditar] = useState(null);
    const token = localStorage.getItem('token');

    // ==========================================
    // GET: Cargar Personal
    // ==========================================
    const CargarPersonal = async () => {
        try {
            const peticion = await fetch(PersonalTable, {
                method: 'GET',
                headers: { 'Authorization': token }
            });
            const res = await peticion.json();
            setData(res);
        } catch (error) {
            console.log('Ocurrió un error al cargar el personal', error.message);
        }
    }

    useEffect(() => {
        CargarPersonal();
    }, []);

    // ==========================================
    // DELETE: Eliminar Personal
    // ==========================================
    const Eliminar = (registro) => {
        const id = registro.id_personal; // Usamos la llave primaria correcta

        DeleteAlert().then(async (res) => {
            if (res.isConfirmed) {
                try {
                    await fetch(`${PersonalTable}/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': token }
                    });

                    // Filtramos localmente para no recargar
                    const newdata = data.filter(v => v.id_personal !== id);
                    setData(newdata);
                    successAlert('Registro eliminado correctamente');
                } catch (error) {
                    console.log('Error al eliminar', error);
                }
            }
        });
    }

    // ==========================================
    // POST: Agregar Personal
    // ==========================================
    const agregar = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const registro = Object.fromEntries(formData);

        try {
            const peticion = await fetch(PersonalTable, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(registro)
            });

            if (peticion.ok) {
                successAlert('Personal registrado exitosamente');
                CargarPersonal();
                e.target.reset();
            }
        } catch (error) {
            console.log('Error al registrar', error);
        }
    }

    // ==========================================
    // PUT: Actualizar Personal
    // ==========================================
    const Actualizar = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const registro = Object.fromEntries(formData);
        const id = editar.id_personal; // Usamos el ID del personal

        try {
            const peticion = await fetch(`${PersonalTable}/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' },
                body: JSON.stringify(registro)
            });

            if (peticion.ok) {
                successAlert('Registro actualizado correctamente');
                CargarPersonal();
                setEditar(null);
            }
        } catch (error) {
            console.log('Error al actualizar', error);
        }
    }

    // ==========================================
    // PREPARAR EDICIÓN (Truco del Stamp)
    // ==========================================
    const prepararEdicion = (registro) => {
        setEditar({
            ...registro,
            stamp: Date.now()
        });
    }

    // ==========================================
    // RENDERIZADO VISUAL
    // ==========================================
    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sans text-slate-200">

            {/* Encabezado */}
            <div className="mb-8 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-white tracking-wide">
                    Gestión de Personal
                </h1>
                <p className="text-slate-400 mt-2">
                    Administración de docentes y coordinadores de la plataforma
                </p>
            </div>

            {/* Contenedor principal */}
            <div className="flex flex-col xl:flex-row gap-8 items-start">

                {/* PANEL IZQUIERDO: Formulario */}
                <div className="w-full xl:w-1/3 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700 sticky top-8">
                    <div className="mb-6 border-b border-slate-700 pb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-emerald-400">
                            {editar ? '✏️ Editando Personal' : '➕ Registrar Nuevo'}
                        </h2>
                    </div>

                    <Form
                        onSubmit={editar ? Actualizar : agregar}
                        editar={editar}
                        onCancel={() => setEditar(null)}
                        key={editar ? editar.stamp : 'nuevo'}
                    >
                        <div className="space-y-4 mb-6">
                            <Input placeholder='Nombre' type='text' name='nombre' defaultValue={editar?.nombre || ''} />
                            <Input placeholder='Apellido Paterno' type='text' name='apellido_p' defaultValue={editar?.apellido_p || ''} />
                            <Input placeholder='Apellido Materno' type='text' name='apellido_m' defaultValue={editar?.apellido_m || ''} />

                            {/* Campos específicos de Personal */}
                            <Input placeholder='Cédula Profesional' type='text' name='cedula' defaultValue={editar?.cedula || ''} />
                            <Select
                                name='rol'
                                placeholder='Selecciona un Rol'
                                defaultValue={editar?.rol || ''}
                                opciones={[
                                    { valor: 'admin', texto: 'Administrador' },
                                    { valor: 'docente', texto: 'Docente' }
                                ]}
                            />

                            <Input placeholder='Teléfono' type='tel' name='telefono' defaultValue={editar?.telefono || ''} />
                            <Input placeholder='Correo Electrónico' type='email' name='correo' defaultValue={editar?.correo || ''} />
                            <Input placeholder='Contraseña' type='text' name='password' defaultValue={editar?.password || ''} />
                        </div>
                    </Form>
                </div>

                {/* PANEL DERECHO: Tabla */}
                <div className="w-full xl:w-2/3 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700">
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white">Directorio del Personal</h2>

                        <span className="bg-emerald-500/20 text-emerald-400 py-1 px-3 rounded-full text-sm font-medium border border-emerald-500/30">
                            Total: {data && data.length > 0 && Object.keys(data[0]).length > 0 ? data.length : 0}
                        </span>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-700 shadow-inner">
                        <Table
                            onDelete={Eliminar}
                            data={data}
                            onEdit={prepararEdicion}
                            // Ocultamos la contraseña y el ID interno en la tabla
                            ocultar={['password', 'id_personal']}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

export default PersonalPage;