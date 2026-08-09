import React, { useState, useEffect } from 'react';
import { Select } from '../componets/Elements.jsx';
import { GruposTable, ReporteCalificacionesTable } from '../Peticiones/RutasPeticiones.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function CalificacionesDocentePage() {
    const token = localStorage.getItem('token');

    // Estados base
    const [grupos, setGrupos] = useState([]);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
    const [cargando, setCargando] = useState(false);

    // Modalidad de vista: 'alumnos' (Vista por Alumno) | 'actividades' (Concentrado por Actividad)
    const [vistaModalidad, setVistaModalidad] = useState('alumnos');

    // Estados de Datos
    const [alumnosReporte, setAlumnosReporte] = useState([]);
    const [actividadesReporte, setActividadesReporte] = useState([]);
    const [promedioGlobal, setPromedioGlobal] = useState(0);

    // Selecciones activas
    const [alumnoActivo, setAlumnoActivo] = useState(null);
    const [actividadActiva, setActividadActiva] = useState(null);

    useEffect(() => {
        const cargarGrupos = async () => {
            try {
                const res = await fetch(GruposTable, { headers: { 'Authorization': token } });
                const data = await res.json();
                setGrupos(data.map(g => ({ valor: g.id_grupo, texto: `${g.nombre} (${g.idioma})` })));
            } catch (error) {
                console.error("Error al cargar grupos", error);
            }
        };
        cargarGrupos();
    }, [token]);

    const cargarReporte = async (e) => {
        const id_grupo = e.target.value;
        setGrupoSeleccionado(id_grupo);
        setAlumnoActivo(null);
        setActividadActiva(null);
        setCargando(true);

        try {
            const res = await fetch(`${ReporteCalificacionesTable}/${id_grupo}`, {
                headers: { 'Authorization': token }
            });
            const dataRaw = await res.json();

            // ==========================================
            // 1. AGRUPAMIENTO POR ALUMNOS
            // ==========================================
            const agrupadoAlumnos = dataRaw.reduce((acc, fila) => {
                if (!acc[fila.id_alumno]) {
                    acc[fila.id_alumno] = {
                        id: fila.id_alumno,
                        nombre: `${fila.nombre_alumno} ${fila.apellido_alumno}`,
                        nombreCorto: fila.nombre_alumno,
                        examenes: [],
                        promedio: 0,
                        tareasCompletadas: 0,
                        tareasTotales: 0
                    };
                }
                acc[fila.id_alumno].examenes.push(fila);
                return acc;
            }, {});

            let sumaPromediosGlobales = 0;
            const alumnosArray = Object.values(agrupadoAlumnos);

            alumnosArray.forEach(alumno => {
                const evaluados = alumno.examenes.filter(e => e.estado !== 'Pendiente');
                const suma = evaluados.reduce((sum, e) => sum + e.puntaje, 0);

                alumno.promedio = evaluados.length > 0 ? Math.round(suma / evaluados.length) : 0;
                alumno.tareasCompletadas = alumno.examenes.filter(e => e.estado === 'Completada').length;
                alumno.tareasTotales = evaluados.length;

                sumaPromediosGlobales += alumno.promedio;
            });

            alumnosArray.sort((a, b) => b.promedio - a.promedio);
            setAlumnosReporte(alumnosArray);
            setPromedioGlobal(alumnosArray.length > 0 ? Math.round(sumaPromediosGlobales / alumnosArray.length) : 0);

            // ==========================================
            // 2. AGRUPAMIENTO POR ACTIVIDADES (CONCENTRADO)
            // ==========================================
            const agrupadoActividades = dataRaw.reduce((acc, fila) => {
                const clave = fila.id_quizz ? `${fila.id_quizz}_${fila.nombre_examen}` : fila.nombre_examen;
                if (!acc[clave]) {
                    acc[clave] = {
                        id_quizz: fila.id_quizz,
                        nombreExamen: fila.nombre_examen,
                        fechaLimite: fila.fecha_limite,
                        alumnos: []
                    };
                }
                acc[clave].alumnos.push(fila);
                return acc;
            }, {});

            const actividadesArray = Object.values(agrupadoActividades).map(act => {
                const totalAlumnos = act.alumnos.length;
                const realizados = act.alumnos.filter(a => a.estado === 'Completada');
                const pendientes = act.alumnos.filter(a => a.estado === 'Pendiente');
                const vencidas = act.alumnos.filter(a => a.estado === 'Vencida');

                const aprobados = realizados.filter(a => a.puntaje >= 60).length;
                const reprobados = realizados.filter(a => a.puntaje < 60).length;

                const sumaPuntajes = realizados.reduce((sum, a) => sum + a.puntaje, 0);
                const promedioActividad = realizados.length > 0 ? Math.round(sumaPuntajes / realizados.length) : 0;

                return {
                    ...act,
                    totalAlumnos,
                    totalRealizados: realizados.length,
                    totalPendientes: pendientes.length,
                    totalVencidas: vencidas.length,
                    aprobados,
                    reprobados,
                    promedioActividad
                };
            });

            setActividadesReporte(actividadesArray);

        } catch (error) {
            console.error("Error al cargar el reporte", error);
        } finally {
            setCargando(false);
        }
    };

    const colorPorCalificacion = (nota) => {
        if (nota >= 60) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    };

    const obtenerDatosPastel = () => {
        let aprobados = 0;
        let reprobados = 0;

        alumnosReporte.forEach(a => {
            if (a.promedio >= 60) aprobados++;
            else reprobados++;
        });

        return [
            { name: 'Aprobados (≥60)', value: aprobados, color: '#10b981' },
            { name: 'Reprobados (<60)', value: reprobados, color: '#ef4444' }
        ].filter(d => d.value > 0);
    };

    const datosPastel = obtenerDatosPastel();

    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sanspro text-slate-200">

            {/* ENCABEZADO */}
            <div className="mb-8 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-white tracking-wide">Libro de Calificaciones</h1>
                <p className="text-slate-400 mt-2">Revisa el rendimiento global por alumno o consulta el concentrado por actividad.</p>
            </div>

            {/* BARRA SUPERIOR DE SELECCIÓN */}
            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="w-full md:w-1/3">
                    <Select
                        name="grupo"
                        placeholder="-- Selecciona un Grupo --"
                        opciones={grupos}
                        onChange={cargarReporte}
                    />
                </div>

                {grupoSeleccionado && !cargando && alumnosReporte.length > 0 && (
                    <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-600">
                        <div className="text-right">
                            <p className="text-sm text-slate-400 uppercase tracking-wider font-bold">Promedio del Grupo</p>
                            <p className="text-sm text-slate-500">{alumnosReporte.length} alumnos evaluados</p>
                        </div>
                        <div className={`text-4xl font-black px-4 py-2 rounded-lg border ${colorPorCalificacion(promedioGlobal)}`}>
                            {promedioGlobal}
                        </div>
                    </div>
                )}
            </div>

            {cargando && <div className="text-center py-20 text-slate-500 text-xl">Calculando métricas del grupo...</div>}

            {grupoSeleccionado && !cargando && alumnosReporte.length === 0 && (
                <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                    Este grupo no tiene estudiantes ni actividades evaluables todavía.
                </div>
            )}

            {/* CONTENIDO PRINCIPAL */}
            {grupoSeleccionado && !cargando && alumnosReporte.length > 0 && (
                <div className="animate-fade-in">

                    {/* BOTONES DE CAMBIO DE VISTA (TABS) */}
                    <div className="flex gap-4 mb-8 border-b border-slate-700 pb-4">
                        <button
                            onClick={() => setVistaModalidad('alumnos')}
                            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${vistaModalidad === 'alumnos'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                                }`}
                        >
                            👥 Vista por Alumnos
                        </button>
                        <button
                            onClick={() => setVistaModalidad('actividades')}
                            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${vistaModalidad === 'actividades'
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                                }`}
                        >
                            📝 Concentrado por Actividades ({actividadesReporte.length})
                        </button>
                    </div>

                    {/* ========================================================= */}
                    {/* MODALIDAD 1: VISTA POR ALUMNOS (ORIGINAL + GRÁFICAS)     */}
                    {/* ========================================================= */}
                    {vistaModalidad === 'alumnos' && (
                        <>
                            {/* GRÁFICAS */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                                <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 xl:col-span-1">
                                    <h2 className="text-lg font-semibold text-white mb-4 text-center">Tasa de Aprobación</h2>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={datosPastel}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {datosPastel.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff', borderRadius: '8px' }} />
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 xl:col-span-2">
                                    <h2 className="text-lg font-semibold text-white mb-4">Promedios de los Alumnos</h2>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={alumnosReporte} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <XAxis dataKey="nombreCorto" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#94a3b8" domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    cursor={{ fill: '#334155' }}
                                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Bar dataKey="promedio" radius={[4, 4, 0, 0]} name="Promedio">
                                                    {alumnosReporte.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.promedio >= 60 ? '#10b981' : '#ef4444'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* LISTA DE ALUMNOS */}
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="w-full lg:w-1/3 space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                                    {alumnosReporte.map((alumno) => (
                                        <div
                                            key={alumno.id}
                                            onClick={() => setAlumnoActivo(alumno)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${alumnoActivo?.id === alumno.id
                                                ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                : 'bg-slate-800 border-slate-600 hover:bg-slate-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 border border-slate-500 shrink-0">
                                                    {alumno.nombre.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm truncate w-32 md:w-48">{alumno.nombre}</p>
                                                    <p className="text-xs text-slate-400">Entregados: {alumno.tareasCompletadas}/{alumno.tareasTotales}</p>
                                                </div>
                                            </div>
                                            <div className={`font-bold px-2 py-1 rounded text-sm border ${colorPorCalificacion(alumno.promedio)}`}>
                                                {alumno.promedio}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="w-full lg:w-2/3 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 h-fit sticky top-8">
                                    {!alumnoActivo ? (
                                        <div className="text-center py-24 text-slate-500">
                                            <span className="text-5xl block mb-4">👆</span>
                                            Haz clic en un estudiante de la lista para ver su historial detallado.
                                        </div>
                                    ) : (
                                        <div className="animate-fade-in">
                                            <div className="flex justify-between items-end border-b border-slate-700 pb-6 mb-6">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white mb-1">{alumnoActivo.nombre}</h2>
                                                    <p className="text-slate-400">Historial completo de este grupo</p>
                                                </div>
                                                <div className={`text-3xl font-black px-4 py-2 rounded-lg border ${colorPorCalificacion(alumnoActivo.promedio)}`}>
                                                    {alumnoActivo.promedio}
                                                </div>
                                            </div>

                                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                {alumnoActivo.examenes.map((examen, i) => (
                                                    <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-500 transition-colors">
                                                        <div>
                                                            <p className="font-bold text-white text-lg">{examen.nombre_examen}</p>
                                                            <p className="text-xs text-slate-400 mt-1">
                                                                {examen.estado === 'Pendiente'
                                                                    ? `Vence: ${new Date(examen.fecha_limite).toLocaleDateString()}`
                                                                    : `Evaluado: ${examen.fecha_evaluacion ? new Date(examen.fecha_evaluacion).toLocaleDateString() : 'N/A'}`}
                                                            </p>
                                                        </div>

                                                        <div className="shrink-0 text-right">
                                                            {examen.estado === 'Pendiente' && <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-sm font-medium border border-slate-600">Pendiente</span>}
                                                            {examen.estado === 'Vencida' && <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-sm font-bold border border-red-500/30 uppercase">No Entregado (0)</span>}
                                                            {examen.estado === 'Completada' && (
                                                                <span className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${colorPorCalificacion(examen.puntaje)}`}>
                                                                    {examen.puntaje} pts
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ========================================================= */}
                    {/* MODALIDAD 2: CONCENTRADO POR ACTIVIDADES (NUEVO)         */}
                    {/* ========================================================= */}
                    {vistaModalidad === 'actividades' && (
                        <div className="flex flex-col lg:flex-row gap-8">

                            {/* LISTA IZQUIERDA DE ACTIVIDADES */}
                            <div className="w-full lg:w-1/2 space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                                {actividadesReporte.map((act, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setActividadActiva(act)}
                                        className={`p-5 rounded-2xl border cursor-pointer transition-all ${actividadActiva?.nombreExamen === act.nombreExamen
                                            ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                            : 'bg-slate-800 border-slate-700 hover:bg-slate-700/80'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">{act.nombreExamen}</h3>
                                                <p className="text-xs text-slate-400">
                                                    Fecha límite: {new Date(act.fechaLimite).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className={`text-xl font-black px-3 py-1 rounded-lg border ${colorPorCalificacion(act.promedioActividad)}`}>
                                                {act.promedioActividad} pts
                                            </div>
                                        </div>

                                        {/* MÉTRICAS RÁPIDAS DE LA ACTIVIDAD */}
                                        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/80 text-center">
                                            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                                                <p className="text-xs text-slate-400 font-bold">Participación</p>
                                                <p className="text-sm font-extrabold text-blue-400 mt-0.5">
                                                    {act.totalRealizados} / {act.totalAlumnos}
                                                </p>
                                            </div>
                                            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/30">
                                                <p className="text-xs text-emerald-400 font-bold">Aprobados</p>
                                                <p className="text-sm font-extrabold text-emerald-400 mt-0.5">
                                                    {act.aprobados}
                                                </p>
                                            </div>
                                            <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/30">
                                                <p className="text-xs text-red-400 font-bold">Reprobados</p>
                                                <p className="text-sm font-extrabold text-red-400 mt-0.5">
                                                    {act.reprobados}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* PANEL DERECHO: DETALLE DE ESTUDIANTES EN ESTA ACTIVIDAD */}
                            <div className="w-full lg:w-1/2 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 h-fit sticky top-8">
                                {!actividadActiva ? (
                                    <div className="text-center py-24 text-slate-500">
                                        <span className="text-5xl block mb-4">📝</span>
                                        Selecciona una actividad de la izquierda para ver el reporte detallado de los alumnos.
                                    </div>
                                ) : (
                                    <div className="animate-fade-in">
                                        <div className="border-b border-slate-700 pb-4 mb-6">
                                            <h2 className="text-2xl font-bold text-white">{actividadActiva.nombreExamen}</h2>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Desglose de alumnos ({actividadActiva.totalRealizados} entregados, {actividadActiva.totalPendientes} pendientes, {actividadActiva.totalVencidas} vencidos)
                                            </p>
                                        </div>

                                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {actividadActiva.alumnos.map((alum, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 flex justify-between items-center hover:border-slate-600 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-slate-600 text-sm shrink-0">
                                                            {alum.nombre_alumno.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white text-sm">
                                                                {alum.nombre_alumno} {alum.apellido_alumno}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {alum.fecha_evaluacion
                                                                    ? `Entregado: ${new Date(alum.fecha_evaluacion).toLocaleDateString()}`
                                                                    : 'Sin registro de fecha'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        {alum.estado === 'Pendiente' && (
                                                            <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs font-bold border border-slate-600">
                                                                Pendiente
                                                            </span>
                                                        )}
                                                        {alum.estado === 'Vencida' && (
                                                            <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold border border-red-500/30">
                                                                No Entregó (0 pts)
                                                            </span>
                                                        )}
                                                        {alum.estado === 'Completada' && (
                                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${colorPorCalificacion(alum.puntaje)}`}>
                                                                {alum.puntaje >= 60 ? '✓ Aprobado' : '✕ Reprobado'} ({alum.puntaje} pts)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    )}

                </div>
            )}
        </div>
    );
}