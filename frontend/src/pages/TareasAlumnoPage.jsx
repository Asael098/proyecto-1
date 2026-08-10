import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlumnoTodasLasActividadesTable } from '../Peticiones/RutasPeticiones.js'; // Ajusta según tu archivo de rutas

export default function TareasAlumnoPage() {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const [actividades, setActividades] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('Pendiente'); // 'Todas' | 'Pendiente' | 'Finalizada' | 'No entregada'

    useEffect(() => {
        const cargarTareas = async () => {
            try {
                const res = await fetch(AlumnoTodasLasActividadesTable, {
                    headers: { 'Authorization': token }
                });
                const data = await res.json();
                setActividades(data);
            } catch (error) {
                console.error("Error al cargar tareas globales:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarTareas();
    }, [token]);

    // Métricas para los contadores superiores
    const totalPendientes = actividades.filter(a => a.estado === 'Pendiente').length;
    const totalFinalizadas = actividades.filter(a => a.estado === 'Finalizada').length;
    const totalNoEntregadas = actividades.filter(a => a.estado === 'No entregada').length;

    // Filtrado del arreglo
    const actividadesFiltradas = actividades.filter(act => {
        if (filtroEstado === 'Todas') return true;
        return act.estado === filtroEstado;
    });

    // Función para ir al grupo correspondiente
    const irAlGrupo = (id_grupo) => {
        // Redirigimos a la página de Mis Clases pasando el id_grupo en el state
        navigate('/PanelAlumno', { state: { id_grupo } });
    };

    const getBadgeStyle = (estado) => {
        switch (estado) {
            case 'Finalizada':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'No entregada':
                return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'Pendiente':
            default:
                return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sans text-slate-200">

            {/* ENCABEZADO */}
            <div className="mb-8 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-white tracking-wide">Mis Tareas Globale</h1>
                <p className="text-slate-400 mt-2">Consulta el estado de todas tus actividades asignadas en tus diferentes grupos.</p>
            </div>

            {/* TARJETAS DE MÉTRICAS RÁPIDAS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div
                    onClick={() => setFiltroEstado('Pendiente')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${filtroEstado === 'Pendiente' ? 'bg-amber-500/20 border-amber-500' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                        }`}
                >
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider"> Por Entregar</p>
                    <p className="text-3xl font-black text-white mt-1">{totalPendientes}</p>
                </div>

                <div
                    onClick={() => setFiltroEstado('No entregada')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${filtroEstado === 'No entregada' ? 'bg-red-500/20 border-red-500' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                        }`}
                >
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider"> Sin Entregar (Vencidas)</p>
                    <p className="text-3xl font-black text-white mt-1">{totalNoEntregadas}</p>
                </div>

                <div
                    onClick={() => setFiltroEstado('Finalizada')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${filtroEstado === 'Finalizada' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                        }`}
                >
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider"> Completadas</p>
                    <p className="text-3xl font-black text-white mt-1">{totalFinalizadas}</p>
                </div>
            </div>

            {/* PESTAÑAS DE FILTRO */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-4">
                {['Pendiente', 'No entregada', 'Finalizada', 'Todas'].map((estado) => (
                    <button
                        key={estado}
                        onClick={() => setFiltroEstado(estado)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtroEstado === estado
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                            }`}
                    >
                        {estado === 'Todas' ? '🌐 Todas las Tareas' : estado}
                    </button>
                ))}
            </div>

            {/* CONTENIDO DE TAREAS */}
            {cargando ? (
                <div className="text-center py-20 text-slate-500 text-xl animate-pulse">
                    Cargando tus actividades...
                </div>
            ) : actividadesFiltradas.length === 0 ? (
                <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl">
                    No tienes tareas en estado <strong className="text-slate-300">"{filtroEstado}"</strong>.
                </div>
            ) : (
                <div className="space-y-4 animate-fade-in">
                    {actividadesFiltradas.map((act) => (
                        <div
                            key={act.id_g_asignado}
                            onClick={() => irAlGrupo(act.id_grupo)}
                            className="bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-blue-500/60 transition-all cursor-pointer shadow-md hover:shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                                    {act.idioma === 'Inglés' ? '🇺🇸' : '🇫🇷'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                        {act.nombre_examen}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Grupo: <span className="text-slate-200 font-semibold">{act.nombre_grupo}</span> • Nivel: {act.nivel}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {act.estado === 'Finalizada' && act.fecha_evaluacion
                                            ? `Evaluado el: ${new Date(act.fecha_evaluacion).toLocaleDateString()}`
                                            : `Fecha Límite: ${new Date(act.fecha_limite).toLocaleDateString()}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-0 border-slate-700/60 pt-3 md:pt-0">
                                {act.estado === 'Finalizada' && (
                                    <span className="text-lg font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                                        {act.puntaje} pts
                                    </span>
                                )}

                                <span className={`px-3 py-1 rounded-lg text-xs font-extrabold border uppercase tracking-wider ${getBadgeStyle(act.estado)}`}>
                                    {act.estado}
                                </span>

                                <span className="text-slate-500 group-hover:text-white transition-colors font-bold text-sm hidden md:inline">
                                    Ver en Aula →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}