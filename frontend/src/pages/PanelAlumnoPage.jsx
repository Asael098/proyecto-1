import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Table from '../componets/Table.jsx';
// Asegúrate de exportar estas dos rutas en tu RutasPeticiones.js
import { AlumnoMisGruposTable, AlumnoActividadesTable } from '../Peticiones/RutasPeticiones.js';

export default function PanelAlumnoPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [grupos, setGrupos] = useState([]);
    const [grupoActivo, setGrupoActivo] = useState(null);
    const [actividades, setActividades] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [filtroActividad, setFiltroActividad] = useState('Todas')

    const actividadesFiltradas = actividades.filter(act => {
        if (filtroActividad === 'Todas') return true;
        return act.estado === filtroActividad;
    });

    useEffect(() => {
        // Si venimos redirigidos desde "Mis Tareas" con un id_grupo en el state
        if (location.state?.id_grupo && grupos.length > 0) {
            const grupoEncontrado = grupos.find(g => g.id_grupo === location.state.id_grupo);
            if (grupoEncontrado) {
                verDetallesGrupo(grupoEncontrado); // Llama a la función que ya tenías para abrir la vista del grupo
            }
        }
    }, [location.state, grupos]);

    // ==========================================
    // 1. Cargar las Tarjetas de mis Grupos
    // ==========================================
    useEffect(() => {
        const cargarGrupos = async () => {
            try {
                const peticion = await fetch(AlumnoMisGruposTable, {
                    headers: { 'Authorization': token }
                });
                const res = await peticion.json();
                setGrupos(res);
            } catch (error) {
                console.error("Error al cargar mis grupos", error);
            }
        };
        cargarGrupos();
    }, [token]);

    // ==========================================
    // 2. Entrar a un Grupo y Ver Exámenes
    // ==========================================
    const verDetallesGrupo = async (grupo) => {
        setGrupoActivo(grupo);
        setCargando(true);

        try {
            const peticion = await fetch(`${AlumnoActividadesTable}/${grupo.id_grupo}`, {
                headers: { 'Authorization': token }
            });
            const data = await peticion.json();
            setActividades(data);
        } catch (error) {
            console.error("Error al cargar actividades", error);
        } finally {
            setCargando(false);
        }
    };

    const volverAlGrid = () => {
        setGrupoActivo(null);
        setActividades([]);
    };

    // ==========================================
    // VISTA A: EL AULA VIRTUAL (Detalle del Grupo)
    // ==========================================
    if (grupoActivo) {
        return (
            <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sanspro text-slate-200">
                <button onClick={volverAlGrid} className="mb-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    <span>←</span> Volver a mis clases
                </button>

                {/* Banner del Grupo */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-lg mb-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold text-white tracking-wide">{grupoActivo.nombre_grupo}</h1>
                        <p className="text-blue-100 mt-2 text-lg">Idioma: {grupoActivo.idioma}</p>
                        <p className="text-blue-200 mt-1 text-sm flex items-center gap-2">
                            Profesor: {grupoActivo.maestro_nombre} {grupoActivo.maestro_apellido}
                        </p>
                    </div>
                    <div className="absolute -bottom-12 -right-12 text-9xl opacity-10">🎓</div>
                </div>

                {/* Contenedor de Actividades */}
                <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-xl font-semibold text-white">Mi Trabajo de Clase</h2>

                        {/* Botones de Filtro */}
                        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700">
                            {['Todas', 'Pendiente', 'Completada', 'Vencida'].map(filtro => (
                                <button
                                    key={filtro}
                                    onClick={() => setFiltroActividad(filtro)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filtroActividad === filtro
                                        ? 'bg-blue-600 text-white shadow'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                        }`}
                                >
                                    {filtro}
                                </button>
                            ))}
                        </div>
                    </div>

                    {cargando ? (
                        <div className="text-center py-12 text-slate-400">Cargando exámenes...</div>
                    ) : actividadesFiltradas.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                            No hay exámenes en esta categoría.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Tarjetas Personalizadas de Actividad */}
                            {actividadesFiltradas.map((act) => (
                                <div key={act.id_g_asignado} className="bg-slate-700/40 border border-slate-600 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-slate-700/60 transition-colors">

                                    {/* Lado Izquierdo: Info del Examen */}
                                    <div className="flex items-center gap-4 w-full">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0
                                            ${act.estado === 'Completada' ? 'bg-emerald-500/20 text-emerald-400' :
                                                act.estado === 'Vencida' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-blue-500/20 text-blue-400'}`}
                                        >
                                            {act.estado === 'Completada' ? '✓' : act.estado === 'Vencida' ? '!' : '📝'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{act.nombre_examen}</h3>
                                            <p className="text-sm text-slate-400">Nivel: {act.nivel} | Límite: {new Date(act.fecha_limite).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Lado Derecho: Acción Dinámica según el Estado */}
                                    <div className="shrink-0 w-full md:w-auto text-center md:text-right">
                                        {act.estado === 'Pendiente' && (
                                            <button
                                                onClick={() => navigate(`/ResolverExamen/${act.id_g_asignado}/${act.id_quizz}`)}
                                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                                            >
                                                ✍️ Resolver
                                            </button>
                                        )}

                                        {act.estado === 'Completada' && (
                                            <div className={`${act.puntaje >= 60 ? 'bg-emerald-500/10 border-emerald-500/30  text-emerald-400 ' : 'bg-red-500/10 border-red-500/30  text-red-400 '}border  px-4 py-2 rounded-lg`}>
                                                <span className="text-xs  block uppercase font-bold tracking-wider">Calificación</span>
                                                <span className="text-xl font-black ">{act.puntaje} / 100</span>
                                            </div>
                                        )}

                                        {act.estado === 'Vencida' && (
                                            <div className="bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-lg">
                                                <span className="text-sm font-bold text-red-400">No Entregada</span>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ==========================================
    // VISTA B: GRID PRINCIPAL (Tarjetas)
    // ==========================================
    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sanspro text-slate-200">
            <div className="mb-8 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-white tracking-wide">Mi Espacio de Estudio</h1>
                <p className="text-slate-400 mt-2">Selecciona un grupo para ver tus exámenes y actividades pendientes.</p>
            </div>

            {grupos.length === 0 ? (
                <div className="text-center py-16 bg-slate-800 rounded-2xl border-2 border-dashed border-slate-700">
                    <span className="text-6xl block mb-4">🏫</span>
                    <h2 className="text-2xl text-white font-medium mb-2">No estás inscrito en ningún grupo</h2>
                    <p className="text-slate-400">Pídele a tu profesor que te asigne a una clase.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {grupos.map(grupo => (
                        <div key={grupo.id_grupo} onClick={() => verDetallesGrupo(grupo)} className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-blue-500/20 hover:border-blue-500/50 transition-all duration-300 group">
                            <div className="h-24 bg-gradient-to-r from-slate-700 to-slate-600 group-hover:from-blue-600 group-hover:to-indigo-600 transition-colors duration-300 p-6 flex items-end">
                                <h3 className="text-xl font-bold text-white truncate w-full">{grupo.nombre_grupo}</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Profesor</p>
                                <p className="text-white flex items-center gap-2 mb-3">
                                    {grupo.maestro_nombre} {grupo.maestro_apellido}
                                </p>
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