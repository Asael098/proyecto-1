import React, { useState, useEffect } from 'react';
import Table from '../componets/Table.jsx';
import Form from '../componets/Form.jsx';
import { Input, Select } from '../componets/Elements.jsx';
import { DeleteAlert, successAlert } from '../componets/Alerts.jsx';
// Asegúrate de exportar GruposTable en tu archivo de peticiones
import { GruposTable } from '../Peticiones/RutasPeticiones.js';

function GruposPage() {
    const [data, setData] = useState([]);
    const [editar, setEditar] = useState(null);
    const token = localStorage.getItem('token');
    const [cargando, setCargando] = useState(false);

    // ==========================================
    // GET: Cargar Grupos del Docente
    // ==========================================
    const CargarGrupos = async () => {
        try {
            const peticion = await fetch(GruposTable, {
                method: 'GET',
                headers: { 'Authorization': token }
            });
            const res = await peticion.json();
            setData(res);
        } catch (error) {
            console.log('Ocurrió un error al cargar los grupos', error.message);
        }
    }

    useEffect(() => {
        CargarGrupos();
    }, []);

    // ==========================================
    // DELETE: Eliminar Grupo
    // ==========================================
    const Eliminar = (registro) => {
        const id = registro.id_grupo; // Llave primaria de la tabla grupos

        DeleteAlert().then(async (res) => {
            if (res.isConfirmed) {
                try {
                    await fetch(`${GruposTable}/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': token }
                    });

                    const newdata = data.filter(v => v.id_grupo !== id);
                    setData(newdata);
                    successAlert('Grupo eliminado correctamente');
                } catch (error) {
                    console.log('Error al eliminar', error);
                }
            }
        });
    }

    // ==========================================
    // POST: Crear Nuevo Grupo
    // ==========================================
    const agregar = async (e) => {
        e.preventDefault();

        if (cargando) return; // 🛡️ EL ESCUDO: Si ya está trabajando, aborta el doble clic
        setCargando(true);    // Bloqueamos el formulario

        const formData = new FormData(e.target);
        const registro = Object.fromEntries(formData);

        try {
            const peticion = await fetch(GruposTable, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(registro)
            });

            if (peticion.ok) {
                successAlert('Grupo creado exitosamente');
                CargarGrupos();
                e.target.reset();
            }
        } catch (error) {
            console.log('Error al crear grupo', error);
        } finally {
            setCargando(false); // 🔓 Desbloqueamos el formulario sin importar si hubo error o éxito
        }
    }

    const Actualizar = async (e) => {
        e.preventDefault();

        if (cargando) return; // 🛡️ EL ESCUDO
        setCargando(true);

        const formData = new FormData(e.target);
        const registro = Object.fromEntries(formData);
        const id = editar.id_grupo;

        try {
            const peticion = await fetch(`${GruposTable}/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' },
                body: JSON.stringify(registro)
            });

            if (peticion.ok) {
                successAlert('Grupo actualizado correctamente');
                CargarGrupos();
                setEditar(null);
            }
        } catch (error) {
            console.log('Error al actualizar', error);
        } finally {
            setCargando(false); // 🔓 Desbloqueamos
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
                    Mis Grupos
                </h1>
                <p className="text-slate-400 mt-2">
                    Administra tus grupos de clase para la asignación de actividades.
                </p>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 items-start">

                {/* PANEL IZQUIERDO: Formulario */}
                <div className="w-full xl:w-1/3 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700 sticky top-8">
                    <div className="mb-6 border-b border-slate-700 pb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-emerald-400">
                            {editar ? '✏️ Editando Grupo' : '➕ Crear Nuevo Grupo'}
                        </h2>
                    </div>

                    <Form
                        onSubmit={editar ? Actualizar : agregar}
                        editar={editar}
                        onCancel={() => setEditar(null)}
                        key={editar ? editar.stamp : 'nuevo'}
                        cargando={cargando}
                    >
                        <div className="space-y-4 mb-6">

                            <Input
                                placeholder='Nombre del Grupo (Ej. Nivel 1 - Matutino)'
                                type='text'
                                name='nombre'
                                defaultValue={editar?.nombre || ''}
                            />

                            {/* Selector para el Idioma */}
                            <Select
                                name='idioma'
                                placeholder='Selecciona el Idioma'
                                defaultValue={editar?.idioma || ''}
                                opciones={[
                                    { valor: 'Inglés', texto: 'Inglés' },
                                    { valor: 'Francés', texto: 'Francés' }
                                ]}
                            />

                        </div>
                    </Form>
                </div>

                {/* PANEL DERECHO: Tabla */}
                <div className="w-full xl:w-2/3 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700">
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white">Directorio de Grupos</h2>
                        <span className="bg-emerald-500/20 text-emerald-400 py-1 px-3 rounded-full text-sm font-medium border border-emerald-500/30">
                            Total: {data && data.length > 0 && Object.keys(data[0]).length > 0 ? data.length : 0}
                        </span>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-700 shadow-inner">
                        <Table
                            onDelete={Eliminar}
                            data={data}
                            onEdit={prepararEdicion}
                            // Ocultamos los IDs internos para que el usuario no los vea
                            ocultar={['id_grupo', 'id_personal']}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

export default GruposPage;