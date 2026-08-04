import React, { useState, useEffect } from 'react';
import { Select } from '../componets/Elements.jsx';
import { GruposTable, ReporteCalificacionesTable } from '../Peticiones/RutasPeticiones.js';
// 1. IMPORTAMOS RECHARTS PARA EL DOCENTE
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function CalificacionesDocentePage() {
    const token = localStorage.getItem('token');

    // Estados base
    const [grupos, setGrupos] = useState([]);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
    const [cargando, setCargando] = useState(false);

    // Estados de Datos
    const [alumnosReporte, setAlumnosReporte] = useState([]);
    const [promedioGlobal, setPromedioGlobal] = useState(0);
    const [alumnoActivo, setAlumnoActivo] = useState(null);

    // Colores para la gráfica de pastel (Esmeralda, Ámbar, Rojo)
    const COLORES_PASTEL = ['#10b981', '#f59e0b', '#ef4444'];

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
        setCargando(true);

        try {
            const res = await fetch(`${ReporteCalificacionesTable}/${id_grupo}`, {
                headers: { 'Authorization': token }
            });
            const dataRaw = await res.json();

            const agrupado = dataRaw.reduce((acc, fila) => {
                if (!acc[fila.id_alumno]) {
                    acc[fila.id_alumno] = {
                        id: fila.id_alumno,
                        nombre: `${fila.nombre_alumno} ${fila.apellido_alumno}`,
                        nombreCorto: fila.nombre_alumno, // Útil para que la gráfica de barras no se amontone
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
            const alumnosArray = Object.values(agrupado);

            alumnosArray.forEach(alumno => {
                const evaluados = alumno.examenes.filter(e => e.estado !== 'Pendiente');
                const suma = evaluados.reduce((sum, e) => sum + e.puntaje, 0);

                alumno.promedio = evaluados.length > 0 ? Math.round(suma / evaluados.length) : 0;
                alumno.tareasCompletadas = alumno.examenes.filter(e => e.estado === 'Completada').length;
                alumno.tareasTotales = evaluados.length;

                sumaPromediosGlobales += alumno.promedio;
            });

            // Ordenamos a los alumnos por promedio (de mayor a menor) para que la gráfica se vea como una escalera
            alumnosArray.sort((a, b) => b.promedio - a.promedio);

            setAlumnosReporte(alumnosArray);
            setPromedioGlobal(alumnosArray.length > 0 ? Math.round(sumaPromediosGlobales / alumnosArray.length) : 0);

        } catch (error) {
            console.error("Error al cargar el reporte", error);
        } finally {
            setCargando(false);
        }
    };

    const colorPorCalificacion = (nota) => {
        if (nota >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
        if (nota >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    };

    // ==========================================
    // LÓGICA PARA LA GRÁFICA DE PASTEL
    // ==========================================
    const obtenerDatosPastel = () => {
        let excelentes = 0; // >= 80
        let regulares = 0;  // 60 - 79
        let reprobados = 0; // < 60

        alumnosReporte.forEach(a => {
            if (a.promedio >= 80) excelentes++;
            else if (a.promedio >= 60) regulares++;
            else reprobados++;
        });

        // Solo enviamos los que tengan al menos 1 alumno para no dibujar rebanadas vacías
        return [
            { name: 'Excelente (80-100)', value: excelentes },
            { name: 'Regular (60-79)', value: regulares },
            { name: 'Reprobados (<60)', value: reprobados }
        ].filter(d => d.value > 0);
    };

    const datosPastel = obtenerDatosPastel();

    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sans text-slate-200">

            <div className="mb-8 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-white tracking-wide">Libro de Calificaciones</h1>
                <p className="text-slate-400 mt-2">Revisa el rendimiento global y detallado de cada estudiante.</p>
            </div>

            {/* BARRA SUPERIOR */}
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

            {/* CONTENIDO PRINCIPAL (SI HAY DATOS) */}
            {grupoSeleccionado && !cargando && alumnosReporte.length > 0 && (
                <div className="animate-fade-in">

                    {/* --- NUEVA SECCIÓN DE GRÁFICAS --- */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

                        {/* Gráfica de Pastel (Desempeño) */}
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
                                                <Cell key={`cell-${index}`} fill={COLORES_PASTEL[index % COLORES_PASTEL.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff', borderRadius: '8px' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Gráfica de Barras (Calificaciones por Alumno) */}
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
                                        />
                                        <Bar dataKey="promedio" fill="#10b981" radius={[4, 4, 0, 0]} name="Promedio" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* --- LISTA MAESTRO-DETALLE ORIGINAL --- */}
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* PANEL IZQUIERDO: Lista de Estudiantes */}
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

                        {/* PANEL DERECHO: Detalle del Estudiante Seleccionado */}
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
                </div>
            )}
        </div>
    );
}