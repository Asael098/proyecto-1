import React, { useState, useEffect } from 'react';
import { AlumnoCalificacionesTable } from '../Peticiones/RutasPeticiones.js';

export default function CalificacionesAlumnoPage() {
    const token = localStorage.getItem('token');
    const [historial, setHistorial] = useState({});
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarCalificaciones = async () => {
            try {
                const peticion = await fetch(AlumnoCalificacionesTable, {
                    headers: { 'Authorization': token }
                });
                const data = await peticion.json();

                // Agrupamos los datos por el "nombre_grupo"
                const datosAgrupados = data.reduce((acumulador, actual) => {
                    if (!acumulador[actual.nombre_grupo]) {
                        acumulador[actual.nombre_grupo] = {
                            idioma: actual.idioma,
                            examenes: []
                        };
                    }
                    acumulador[actual.nombre_grupo].examenes.push(actual);
                    return acumulador;
                }, {});

                setHistorial(datosAgrupados);
            } catch (error) {
                console.error("Error al cargar calificaciones", error);
            } finally {
                setCargando(false);
            }
        };

        cargarCalificaciones();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sans text-slate-200">

            {/* ENCABEZADO DE LA PÁGINA */}
            <div className="mb-8 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-white tracking-wide">Mis Calificaciones</h1>
                <p className="text-slate-400 mt-2">Consulta el resumen de tu rendimiento académico por grupo e idioma.</p>
            </div>

            {cargando ? (
                <div className="text-center py-20 text-slate-500 text-xl animate-pulse">
                    Cargando tu historial académico...
                </div>
            ) : Object.keys(historial).length === 0 ? (
                <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl">
                    Aún no tienes calificaciones registradas en ningún grupo.
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    {Object.keys(historial).map((nombreGrupo) => {
                        const grupo = historial[nombreGrupo];

                        // ==========================================
                        // CÁLCULO DEL PROMEDIO DEL GRUPO
                        // ==========================================
                        const sumaTotal = grupo.examenes.reduce((sum, ex) => sum + (Number(ex.puntaje) || 0), 0);
                        const promedioGrupo = grupo.examenes.length > 0
                            ? Math.round(sumaTotal / grupo.examenes.length)
                            : 0;

                        // Estilo dinámico de color según la calificación del grupo (>= 60 Verde, < 60 Rojo)
                        const colorPromedioGrupo = promedioGrupo >= 60
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                            : 'text-red-400 bg-red-500/10 border-red-500/30';

                        return (
                            <div key={nombreGrupo} className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">

                                {/* ENCABEZADO DEL GRUPO CON EL PROMEDIO GENERAL */}
                                <div className="p-6 bg-slate-800/80 border-b border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">
                                            {grupo.idioma === 'Inglés' ? '🇺🇸' : '🇫🇷'}
                                        </span>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{nombreGrupo}</h2>
                                            <p className="text-xs text-slate-400">{grupo.examenes.length} actividades evaluadas</p>
                                        </div>
                                    </div>

                                    {/* BADGE DEL PROMEDIO GENERAL DEL GRUPO */}
                                    <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-700/80 w-fit">
                                        <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Promedio General:</span>
                                        <span className={`px-3 py-1 rounded-lg font-black text-base border ${colorPromedioGrupo}`}>
                                            {promedioGrupo} pts
                                        </span>
                                    </div>
                                </div>

                                {/* TABLA DE EXÁMENES / ACTIVIDADES */}
                                <div className="p-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700/80">
                                                    <th className="pb-3 px-4 font-semibold">Examen / Actividad</th>
                                                    <th className="pb-3 px-4 font-semibold">Calificación</th>
                                                    <th className="pb-3 px-4 font-semibold">Fecha de Evaluación</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/50">
                                                {grupo.examenes.map((examen, i) => {
                                                    const colorPuntaje = examen.estado_entrega === 'Incompleta' || examen.puntaje < 60
                                                        ? 'text-red-400 bg-red-500/10 border-red-500/30'
                                                        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

                                                    return (
                                                        <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                                                            <td className="px-4 py-4 font-medium text-white">
                                                                {examen.nombre_examen}
                                                            </td>

                                                            <td className="px-4 py-4">
                                                                <span className={`px-3 py-1 rounded-md font-bold border text-sm ${colorPuntaje}`}>
                                                                    {examen.puntaje} pts
                                                                </span>
                                                            </td>

                                                            <td className="px-4 py-4 text-slate-400 text-sm">
                                                                {examen.fecha_evaluacion
                                                                    ? new Date(examen.fecha_evaluacion).toLocaleDateString('es-ES', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })
                                                                    : 'N/A'
                                                                }
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}