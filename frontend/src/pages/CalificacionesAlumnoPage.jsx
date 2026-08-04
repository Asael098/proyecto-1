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

                // MAGIA JS: Agrupamos los datos por el "nombre_grupo"
                // Esto nos dará un objeto donde la llave es el grupo y el valor es un arreglo de exámenes
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

            <div className="mb-8 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-white tracking-wide">Mis Calificaciones</h1>
                <p className="text-slate-400 mt-2">Revisa tu progreso y puntajes obtenidos en cada una de tus clases.</p>
            </div>

            {cargando ? (
                <div className="text-center py-20 text-slate-500 text-xl">Cargando tu boleta...</div>
            ) : Object.keys(historial).length === 0 ? (
                <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                    <span className="text-5xl block mb-4">📝</span>
                    Aún no tienes calificaciones registradas. ¡Resuelve tus tareas pendientes!
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Iteramos sobre cada grupo que encontramos */}
                    {Object.keys(historial).map((nombreGrupo, index) => {
                        const grupoData = historial[nombreGrupo];

                        return (
                            <div key={index} className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden animate-fade-in">

                                {/* Cabecera del Grupo */}
                                <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-5 border-b border-slate-600 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{nombreGrupo}</h2>
                                        <p className="text-sm text-slate-400">Idioma: {grupoData.idioma}</p>
                                    </div>
                                    <div className="bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-lg text-sm font-semibold border border-blue-500/30">
                                        {grupoData.examenes.length} Exámenes
                                    </div>
                                </div>

                                {/* Lista de Exámenes del Grupo */}
                                <div className="p-5">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-300">
                                            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                                                <tr>
                                                    <th className="px-4 py-3 rounded-tl-lg">Examen Evaluado</th>
                                                    <th className="px-4 py-3 text-center">Aciertos</th>
                                                    <th className="px-4 py-3 text-center">Puntaje Final</th>
                                                    <th className="px-4 py-3 rounded-tr-lg">Fecha de Entrega</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {grupoData.examenes.map((examen, i) => {
                                                    // Semáforo de colores para el puntaje
                                                    let colorPuntaje = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'; // Excelente

                                                    if (examen.estado_entrega === 'Incompleta') {
                                                        colorPuntaje = 'text-red-500 bg-red-500/10 border-red-500/30'; // 0 por no entregar
                                                    } else if (examen.puntaje < 60) {
                                                        colorPuntaje = 'text-red-400 bg-red-400/10 border-red-400/30'; // Reprobado
                                                    } else if (examen.puntaje < 80) {
                                                        colorPuntaje = 'text-amber-400 bg-amber-400/10 border-amber-400/30'; // Regular
                                                    }

                                                    return (
                                                        <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                                            <td className="px-4 py-4 font-medium text-white">{examen.nombre_examen}</td>

                                                            <td className="px-4 py-4 text-center">
                                                                {examen.estado_entrega === 'Incompleta'
                                                                    ? <span className="text-red-400 text-xs font-bold uppercase tracking-wider bg-red-500/10 px-2 py-1 rounded">No Entregada</span>
                                                                    : `${examen.correctas} de ${examen.total}`
                                                                }
                                                            </td>

                                                            <td className="px-4 py-4 text-center">
                                                                <span className={`px-3 py-1 rounded-md font-bold border ${colorPuntaje}`}>
                                                                    {examen.puntaje}
                                                                </span>
                                                            </td>

                                                            <td className="px-4 py-4 text-slate-400">
                                                                {new Date(examen.fecha_evaluacion).toLocaleDateString('es-ES', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
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