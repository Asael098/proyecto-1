import React, { useState, useEffect } from 'react';
import Table from '../componets/Table.jsx';
import Form from '../componets/Form.jsx';
import { Select, Boton } from '../componets/Elements.jsx';
import { successAlert, DeleteAlert } from '../componets/Alerts.jsx';
// IMPORTANTE: Asegúrate de tener todas estas rutas exportadas en tu archivo de peticiones
import { GruposTable, AsignacionGrupoTable, QuizzesTable, ActividadesTable } from '../Peticiones/RutasPeticiones.js';

export default function PanelDocentePage() {
    const token = localStorage.getItem('token');

    // Estados de navegación y carga
    const [grupos, setGrupos] = useState([]);
    const [grupoActivo, setGrupoActivo] = useState(null);
    const [activeTab, setActiveTab] = useState('actividades'); // 'actividades' o 'alumnos'
    const [cargando, setCargando] = useState(false);
    const [procesandoActividad, setProcesandoActividad] = useState(false);
    const [actividadEditar, setActividadEditar] = useState(null);

    // Estados de Datos del Grupo Activo
    const [alumnosGrupo, setAlumnosGrupo] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [actividades, setActividades] = useState([]);

    // ==========================================
    // 1. Cargar el Directorio de Grupos (Vista Principal)
    // ==========================================
    useEffect(() => {
        const cargarGrupos = async () => {
            try {
                const peticion = await fetch(GruposTable, { headers: { 'Authorization': token } });
                const res = await peticion.json();
                setGrupos(res);
            } catch (error) {
                console.error("Error al cargar grupos", error);
            }
        };
        cargarGrupos();
    }, []);

    // ==========================================
    // 2. Entrar a un Grupo (Carga Alumnos, Quizzes y Actividades)
    // ==========================================
    const verDetallesGrupo = async (grupo) => {
        setGrupoActivo(grupo);
        setCargando(true);
        setActiveTab('actividades'); // Por defecto abre en Trabajo en Clase

        try {
            // A. Traemos los alumnos de este grupo
            const peticionAlumnos = await fetch(`${AsignacionGrupoTable}/detalles/${grupo.id_grupo}`, { headers: { 'Authorization': token } });
            const dataAlumnos = await peticionAlumnos.json();
            setAlumnosGrupo(dataAlumnos);

            // B. Traemos todos los Quizzes del maestro para llenar el <Select>
            const peticionQuizzes = await fetch(QuizzesTable, { headers: { 'Authorization': token } });
            const dataQuizzes = await peticionQuizzes.json();
            setQuizzes(dataQuizzes.map(q => ({
                valor: q.id_quizz,
                texto: `${q.nombre} | ${q.idioma} (${q.nivel})`
            })));

            // C. Traemos las actividades y filtramos SOLO las de este grupo
            await recargarActividades(grupo.nombre);

        } catch (error) {
            console.error("Error al cargar los datos del aula", error);
        } finally {
            setCargando(false);
        }
    };

    // ==========================================
    // 3. Recargar Lista de Actividades Asignadas
    // ==========================================
    const recargarActividades = async (nombreDelGrupo) => {
        try {
            const peticionAct = await fetch(ActividadesTable, { headers: { 'Authorization': token } });
            const dataAct = await peticionAct.json();
            // Filtramos basándonos en el nombre del grupo para mostrar solo las relevantes aquí
            const actividadesFiltradas = dataAct.filter(act => act.nombre_grupo === nombreDelGrupo);
            setActividades(actividadesFiltradas);
        } catch (error) {
            console.error("Error al recargar actividades", error);
        }
    }

    // ==========================================
    // 4. Asignar un Nuevo Quiz a este Grupo
    // ==========================================
    const asignarActividadAlGrupo = async (e) => {
        e.preventDefault();
        if (procesandoActividad) return;
        setProcesandoActividad(true);

        const formData = new FormData(e.target);
        const registro = Object.fromEntries(formData);

        // Magia aquí: Inyectamos el ID del grupo en el que estamos parados
        registro.id_grupo = grupoActivo.id_grupo;

        try {
            const peticion = await fetch(ActividadesTable, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(registro)
            });

            if (peticion.ok) {
                successAlert('Tarea publicada correctamente en este grupo');
                await recargarActividades(grupoActivo.nombre); // Actualizamos la tabla de abajo
                e.target.reset();
            }
        } catch (error) {
            console.error("Error al asignar", error);
        } finally {
            setProcesandoActividad(false);
        }
    };

    // ==========================================
    // 5. Eliminar una Asignación
    // ==========================================
    const eliminarActividad = (registro) => {
        DeleteAlert().then(async (res) => {
            if (res.isConfirmed) {
                try {
                    await fetch(`${ActividadesTable}/${registro.id_g_asignado}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': token }
                    });
                    setActividades(actividades.filter(v => v.id_g_asignado !== registro.id_g_asignado));
                    successAlert('Asignación retirada');
                } catch (error) {
                    console.error("Error al eliminar", error);
                }
            }
        });
    };

    const volverAlGrid = () => {
        setGrupoActivo(null);
        setAlumnosGrupo([]);
        setActividades([]);
        setActividadEditar(null);
    };

    const prepararEdicionActividad = (registro) => {
        setActividadEditar(registro);
    };

    const reprogramarActividad = async (e) => {
        e.preventDefault();
        if (procesandoActividad) return;
        setProcesandoActividad(true);

        const formData = new FormData(e.target);
        const { fecha_limite } = Object.fromEntries(formData);
        const id = actividadEditar.id_g_asignado;

        try {
            const peticion = await fetch(`${ActividadesTable}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ fecha_limite })
            });

            if (peticion.ok) {
                successAlert('Tarea reprogramada con éxito');
                await recargarActividades(grupoActivo.nombre);
                setActividadEditar(null); // Limpiamos el formulario
            }
        } catch (error) {
            console.error("Error al reprogramar", error);
        } finally {
            setProcesandoActividad(false);
        }
    };

    // ==========================================
    // VISTA A: EL AULA VIRTUAL (Detalle del Grupo)
    // ==========================================
    if (grupoActivo) {
        return (
            <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sans text-slate-200">
                {/* Botón de regreso */}
                <button onClick={volverAlGrid} className="mb-6 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                    <span>←</span> Volver a mis clases
                </button>

                {/* Cabecera Banner estilo Classroom */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 rounded-t-2xl shadow-lg border-b border-emerald-500/30 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold text-white tracking-wide">{grupoActivo.nombre}</h1>
                        <p className="text-emerald-100 mt-2 text-lg">Idioma: {grupoActivo.idioma}</p>
                    </div>
                    <div className="absolute -bottom-12 -right-12 text-9xl opacity-10">📚</div>
                </div>

                {/* Barra de Pestañas de Navegación */}
                <div className="bg-slate-800 px-8 pt-4 rounded-b-2xl shadow-md border-b border-x border-slate-700 flex gap-8 mb-8">
                    <button
                        onClick={() => setActiveTab('actividades')}
                        className={`pb-3 text-lg font-medium transition-colors border-b-2 ${activeTab === 'actividades' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
                    >
                        Trabajo en Clase
                    </button>
                    <button
                        onClick={() => setActiveTab('alumnos')}
                        className={`pb-3 text-lg font-medium transition-colors border-b-2 ${activeTab === 'alumnos' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
                    >
                        Personas ({alumnosGrupo.length})
                    </button>
                </div>

                {/* CONTENIDO DE LAS PESTAÑAS */}
                {cargando ? (
                    <div className="text-center py-12 text-slate-400">Cargando el aula virtual...</div>
                ) : (
                    <>
                        {/* --- PESTAÑA: TRABAJO EN CLASE --- */}
                        {activeTab === 'actividades' && (
                            <div className="flex flex-col xl:flex-row gap-8 items-start animate-fade-in">

                                {/* Formulario para asignar nuevo examen */}
                                <div className="w-full xl:w-1/3 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 sticky top-8">
                                    <h2 className="text-xl font-semibold text-emerald-400 mb-6 border-b border-slate-700 pb-4">
                                        {actividadEditar ? '⏱️ Reprogramar Tarea' : '➕ Publicar Tarea'}
                                    </h2>

                                    {/* Cambiamos el onSubmit dinámicamente */}
                                    <Form
                                        onSubmit={actividadEditar ? reprogramarActividad : asignarActividadAlGrupo}
                                        cargando={procesandoActividad}
                                        key={actividadEditar ? actividadEditar.id_g_asignado : 'nueva'}
                                    >
                                        <div className="space-y-4 mb-6">
                                            <input type="hidden" name="id_grupo" value={grupoActivo.id_grupo} />

                                            {/* Si estamos editando, solo mostramos el nombre del examen, no dejamos cambiarlo */}
                                            {actividadEditar ? (
                                                <div className="mb-4">
                                                    <p className="text-sm text-slate-400 mb-1">Examen seleccionado:</p>
                                                    <p className="text-white font-bold bg-slate-900 p-3 rounded-lg border border-slate-600">
                                                        {actividadEditar.nombre_examen}
                                                    </p>
                                                </div>
                                            ) : (
                                                <Select name='id_quizz' placeholder='Selecciona el Examen a asignar' opciones={quizzes} />
                                            )}

                                            <div>
                                                <p className="text-sm text-slate-400 mb-1">
                                                    {actividadEditar ? 'Nueva Fecha Límite' : 'Fecha Límite'}
                                                </p>
                                                <input
                                                    type="date"
                                                    name="fecha_limite"
                                                    required
                                                    // Si estamos editando, extraemos solo la fecha (YYYY-MM-DD) para pre-llenar el input
                                                    defaultValue={actividadEditar ? actividadEditar.fecha_limite.split('T')[0] : ''}
                                                    className="border border-slate-600 bg-slate-700 text-white p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full"
                                                />
                                            </div>

                                            {/* Botón para cancelar la edición */}
                                            {actividadEditar && (
                                                <button
                                                    type="button"
                                                    onClick={() => setActividadEditar(null)}
                                                    className="w-full mt-2 text-slate-400 hover:text-white text-sm transition-colors py-2"
                                                >
                                                    Cancelar Reprogramación
                                                </button>
                                            )}
                                        </div>
                                    </Form>
                                </div>

                                {/* Tabla de actividades ya asignadas a este grupo */}
                                <div className="w-full xl:w-2/3 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                                    <h2 className="text-xl font-semibold text-white mb-6">Exámenes Activos en este Grupo</h2>

                                    {actividades.length === 0 ? (
                                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                                            Aún no has asignado ningún examen a esta clase.
                                        </div>
                                    ) : (
                                        <div className="overflow-hidden rounded-xl border border-slate-700 shadow-inner">
                                            <Table
                                                onDelete={eliminarActividad}
                                                onEdit={prepararEdicionActividad} // <-- LE PASAMOS LA FUNCIÓN AQUÍ
                                                data={actividades}
                                                ocultar={['id_g_asignado', 'nombre_grupo']}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- PESTAÑA: PERSONAS (ALUMNOS) --- */}
                        {activeTab === 'alumnos' && (
                            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 animate-fade-in">
                                <h2 className="text-xl font-semibold text-white mb-6">Directorio de Estudiantes</h2>
                                {alumnosGrupo.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                                        Este grupo aún no tiene alumnos inscritos.
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-xl border border-slate-700 shadow-inner">
                                        <Table data={alumnosGrupo} ocultar={['id_alumno']} />
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        )
    }

    // ==========================================
    // VISTA B: GRID PRINCIPAL (Tarjetas de Clases)
    // ==========================================
    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sans text-slate-200">
            <div className="mb-8 border-b border-slate-700 pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-wide">Mi Panel de Docente</h1>
                    <p className="text-slate-400 mt-2">Selecciona un grupo para ver el detalle y administrarlo.</p>
                </div>
            </div>

            {grupos.length === 0 ? (
                <div className="text-center py-16 bg-slate-800 rounded-2xl border-2 border-dashed border-slate-700">
                    <span className="text-6xl block mb-4">🏫</span>
                    <h2 className="text-2xl text-white font-medium mb-2">Aún no tienes grupos</h2>
                    <p className="text-slate-400">Ve a la sección "Mis Grupos" para crear tu primera clase.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {grupos.map(grupo => (
                        <div key={grupo.id_grupo} onClick={() => verDetallesGrupo(grupo)} className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 group">
                            <div className="h-24 bg-gradient-to-r from-slate-700 to-slate-600 group-hover:from-emerald-600 group-hover:to-teal-600 transition-colors duration-300 p-6 flex items-end">
                                <h3 className="text-xl font-bold text-white truncate w-full">{grupo.nombre}</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Idioma</p>
                                <p className="text-white flex items-center gap-2">
                                    {grupo.idioma === 'Inglés' ? '🇺🇸' : '🇫🇷'} {grupo.idioma}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}