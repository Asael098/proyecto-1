import React, { useState, useEffect } from 'react';
import Table from '../componets/Table.jsx';
import Form from '../componets/Form.jsx';
import { Select, Boton } from '../componets/Elements.jsx';
import { successAlert, DeleteAlert } from '../componets/Alerts.jsx';
import { GruposTable, AsignacionGrupoTable, QuizzesTable, ActividadesTable } from '../Peticiones/RutasPeticiones.js';

export default function PanelDocentePage() {
    const token = localStorage.getItem('token');

    // Estados de navegación y carga
    const [grupos, setGrupos] = useState([]);
    const [grupoActivo, setGrupoActivo] = useState(null);
    const [activeTab, setActiveTab] = useState('actividades');
    const [cargando, setCargando] = useState(false);
    const [procesandoActividad, setProcesandoActividad] = useState(false);
    const [actividadEditar, setActividadEditar] = useState(null);
    const [filtroDestino, setFiltroDestino] = useState('Todos');

    // ==========================================
    // ESTADOS PARA EL MULTI-SELECT DE ALUMNOS
    // ==========================================
    const [tipoAsignacion, setTipoAsignacion] = useState('grupo');
    const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]); // Arreglo para guardar a los elegidos
    const [dropdownAbierto, setDropdownAbierto] = useState(false);        // Para abrir/cerrar la lista de checkboxes

    // Estados de Datos del Grupo Activo
    const [alumnosGrupo, setAlumnosGrupo] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [actividades, setActividades] = useState([]);

    const actividadesFiltradas = actividades.filter(act => {
        if (filtroDestino === 'Todos') return true;
        if (filtroDestino === 'Grupo') return act.destinatario.includes('Todo el grupo');
        if (filtroDestino === 'Individuales') return !act.destinatario.includes('Todo el grupo');
        return true;
    });

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
    }, [token]);

    const verDetallesGrupo = async (grupo) => {
        setGrupoActivo(grupo);
        setCargando(true);
        setActiveTab('actividades');

        // Limpiamos los selectores al entrar a un nuevo grupo
        setTipoAsignacion('grupo');
        setAlumnosSeleccionados([]);
        setDropdownAbierto(false);

        try {
            const peticionAlumnos = await fetch(`${AsignacionGrupoTable}/detalles/${grupo.id_grupo}`, { headers: { 'Authorization': token } });
            const dataAlumnos = await peticionAlumnos.json();
            setAlumnosGrupo(dataAlumnos);

            const peticionQuizzes = await fetch(QuizzesTable, { headers: { 'Authorization': token } });
            const dataQuizzes = await peticionQuizzes.json();
            setQuizzes(dataQuizzes.map(q => ({
                valor: q.id_quizz,
                texto: `${q.nombre} | ${q.idioma} (${q.nivel})`
            })));

            await recargarActividades(grupo.nombre);
        } catch (error) {
            console.error("Error al cargar los datos del aula", error);
        } finally {
            setCargando(false);
        }
    };

    const recargarActividades = async (nombreDelGrupo) => {
        try {
            const peticionAct = await fetch(ActividadesTable, { headers: { 'Authorization': token } });
            const dataAct = await peticionAct.json();
            const actividadesFiltradas = dataAct.filter(act => act.nombre_grupo === nombreDelGrupo);
            setActividades(actividadesFiltradas);
        } catch (error) {
            console.error("Error al recargar actividades", error);
        }
    }

    // ==========================================
    // FUNCIÓN PARA MARCAR/DESMARCAR ALUMNOS
    // ==========================================
    const toggleAlumno = (id) => {
        setAlumnosSeleccionados(prev =>
            prev.includes(id)
                ? prev.filter(alumnoId => alumnoId !== id) // Si ya estaba, lo quitamos
                : [...prev, id]                            // Si no estaba, lo agregamos
        );
    };

    const marcarTodos = () => {
        if (alumnosSeleccionados.length === alumnosGrupo.length) {
            setAlumnosSeleccionados([]); // Desmarcar todos
        } else {
            setAlumnosSeleccionados(alumnosGrupo.map(a => a.id_alumno)); // Marcar todos
        }
    };

    // ==========================================
    // GUARDADO EN LA BASE DE DATOS (Mejorado para Múltiples Alumnos)
    // ==========================================
    const asignarActividadAlGrupo = async (e) => {
        e.preventDefault();
        if (procesandoActividad) return;
        setProcesandoActividad(true);

        const formData = new FormData(e.target);
        const registro = Object.fromEntries(formData);
        registro.id_grupo = grupoActivo.id_grupo;

        try {
            if (tipoAsignacion === 'grupo') {
                // Opción 1: Tarea para todo el grupo (Un solo fetch con null)
                registro.id_alumno = null;
                await fetch(ActividadesTable, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': token },
                    body: JSON.stringify(registro)
                });

            } else {
                // Opción 2: Tarea para varios alumnos seleccionados
                if (alumnosSeleccionados.length === 0) {
                    alert("Debes seleccionar al menos a un estudiante.");
                    setProcesandoActividad(false);
                    return;
                }

                // El Frontend hace el trabajo duro: Un ciclo for enviando la tarea a cada alumno
                for (const id_alumno of alumnosSeleccionados) {
                    const payload = { ...registro, id_alumno: id_alumno };
                    await fetch(ActividadesTable, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': token },
                        body: JSON.stringify(payload)
                    });
                }
            }

            successAlert(tipoAsignacion === 'individual' ? `Tarea asignada a ${alumnosSeleccionados.length} estudiante(s)` : 'Tarea publicada al grupo');
            await recargarActividades(grupoActivo.nombre);

            // Limpieza del formulario
            e.target.reset();
            setTipoAsignacion('grupo');
            setAlumnosSeleccionados([]);
            setDropdownAbierto(false);

        } catch (error) {
            console.error("Error al asignar", error);
        } finally {
            setProcesandoActividad(false);
        }
    };

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
        setTipoAsignacion('grupo');
        setAlumnosSeleccionados([]);
        setDropdownAbierto(false);
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
                setActividadEditar(null);
            }
        } catch (error) {
            console.error("Error al reprogramar", error);
        } finally {
            setProcesandoActividad(false);
        }
    };

    if (grupoActivo) {
        return (
            <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sans text-slate-200">
                <button onClick={volverAlGrid} className="mb-6 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                    <span>←</span> Volver a mis clases
                </button>

                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 rounded-t-2xl shadow-lg border-b border-emerald-500/30 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold text-white tracking-wide">{grupoActivo.nombre}</h1>
                        <p className="text-emerald-100 mt-2 text-lg">Idioma: {grupoActivo.idioma}</p>
                    </div>
                    <div className="absolute -bottom-12 -right-12 text-9xl opacity-10">📚</div>
                </div>

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

                {cargando ? (
                    <div className="text-center py-12 text-slate-400">Cargando el aula virtual...</div>
                ) : (
                    <>
                        {activeTab === 'actividades' && (
                            <div className="flex flex-col xl:flex-row gap-8 items-start animate-fade-in">
                                <div className="w-full xl:w-1/3 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 sticky top-8">
                                    <h2 className="text-xl font-semibold text-emerald-400 mb-6 border-b border-slate-700 pb-4">
                                        {actividadEditar ? '⏱️ Reprogramar Tarea' : '➕ Publicar Tarea'}
                                    </h2>

                                    <Form
                                        onSubmit={actividadEditar ? reprogramarActividad : asignarActividadAlGrupo}
                                        cargando={procesandoActividad}
                                        key={actividadEditar ? actividadEditar.id_g_asignado : 'nueva'}
                                    >
                                        <div className="space-y-4 mb-6">
                                            <input type="hidden" name="id_grupo" value={grupoActivo.id_grupo} />

                                            {actividadEditar ? (
                                                <div className="mb-4">
                                                    <p className="text-sm text-slate-400 mb-1">Examen seleccionado:</p>
                                                    <p className="text-white font-bold bg-slate-900 p-3 rounded-lg border border-slate-600">
                                                        {actividadEditar.nombre_examen}
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    <Select name='id_quizz' placeholder='Selecciona el Examen a asignar' opciones={quizzes} />

                                                    <div className="mb-4">
                                                        <p className="text-sm text-slate-400 mb-1">Dirigido a:</p>
                                                        <select
                                                            value={tipoAsignacion}
                                                            onChange={(e) => {
                                                                setTipoAsignacion(e.target.value);
                                                                setAlumnosSeleccionados([]); // Limpiamos al cambiar
                                                                setDropdownAbierto(false);
                                                            }}
                                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white outline-none focus:border-emerald-400 mb-3"
                                                        >
                                                            <option value="grupo">👥 Todo el Grupo</option>
                                                            <option value="individual">👤 Alumnos Específicos</option>
                                                        </select>

                                                        {/* ========================================== */}
                                                        {/* MENU DESPLEGABLE CON CHECKBOXES            */}
                                                        {/* ========================================== */}
                                                        {tipoAsignacion === 'individual' && (
                                                            <div className="animate-fade-in bg-slate-900/60 p-3 rounded-xl border border-emerald-500/30 relative">
                                                                <label className="text-xs text-emerald-400 font-bold block mb-2">Selecciona a los Alumnos:</label>

                                                                {/* El botón que simula ser un Input/Select */}
                                                                <div
                                                                    onClick={() => setDropdownAbierto(!dropdownAbierto)}
                                                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white flex justify-between items-center cursor-pointer hover:border-emerald-400 transition-colors"
                                                                >
                                                                    <span className="text-sm">
                                                                        {alumnosSeleccionados.length === 0
                                                                            ? '-- Elige Estudiantes --'
                                                                            : `${alumnosSeleccionados.length} estudiante(s) seleccionado(s)`}
                                                                    </span>
                                                                    <span className="text-xs text-slate-400">{dropdownAbierto ? '▲' : '▼'}</span>
                                                                </div>

                                                                {/* La lista flotante de Checkboxes */}
                                                                {dropdownAbierto && (
                                                                    <div className="absolute left-3 right-3 mt-1 z-50 bg-slate-800 border border-slate-500 rounded-lg shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">

                                                                        {/* Botón rápido para marcar/desmarcar todos */}
                                                                        <div
                                                                            onClick={marcarTodos}
                                                                            className="p-2.5 border-b border-slate-600 hover:bg-slate-700 cursor-pointer text-xs font-bold text-emerald-400 sticky top-0 bg-slate-800 z-10"
                                                                        >
                                                                            {alumnosSeleccionados.length === alumnosGrupo.length ? '▢ Desmarcar Todos' : '☑ Marcar Todos'}
                                                                        </div>

                                                                        {alumnosGrupo.map(a => (
                                                                            <label key={a.id_alumno} className="flex items-center gap-3 p-3 hover:bg-slate-700/50 cursor-pointer border-b border-slate-700/50 last:border-0">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={alumnosSeleccionados.includes(a.id_alumno)}
                                                                                    onChange={() => toggleAlumno(a.id_alumno)}
                                                                                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                                                                                />
                                                                                <span className="text-sm text-slate-200">
                                                                                    {a.nombre} {a.apellido_p}
                                                                                </span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            <div>
                                                <p className="text-sm text-slate-400 mb-1">
                                                    {actividadEditar ? 'Nueva Fecha Límite' : 'Fecha Límite'}
                                                </p>
                                                <input
                                                    type="date"
                                                    name="fecha_limite"
                                                    required
                                                    defaultValue={actividadEditar ? actividadEditar.fecha_limite.split('T')[0] : ''}
                                                    className="border border-slate-600 bg-slate-700 text-white p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full"
                                                />
                                            </div>

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

                                <div className="w-full xl:w-2/3 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                                    <h2 className="text-xl font-semibold text-white mb-6">Exámenes Activos en este Grupo</h2>

                                    {actividades.length === 0 ? (
                                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                                            Aún no has asignado ningún examen a esta clase.
                                        </div>
                                    ) : (
                                        <div className="overflow-hidden rounded-xl border border-slate-700 shadow-inner">
                                            <div className="flex gap-2 mb-4">
                                                <button
                                                    onClick={() => setFiltroDestino('Todos')}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold ${filtroDestino === 'Todos' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                                                >
                                                    Todas ({actividades.length})
                                                </button>
                                                <button
                                                    onClick={() => setFiltroDestino('Grupo')}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold ${filtroDestino === 'Grupo' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                                                >
                                                    👥 Grupales
                                                </button>
                                                <button
                                                    onClick={() => setFiltroDestino('Individuales')}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold ${filtroDestino === 'Individuales' ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                                                >
                                                    👤 Individuales
                                                </button>
                                            </div>
                                            <Table
                                                onDelete={eliminarActividad}
                                                onEdit={prepararEdicionActividad}
                                                data={actividadesFiltradas}
                                                ocultar={['id_g_asignado', 'nombre_grupo', 'id_alumno']}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

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

    // VISTA B: GRID PRINCIPAL (Tarjetas de Clases)
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