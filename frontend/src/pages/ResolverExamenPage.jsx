import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuizzesTable, CalificacionesTable } from '../Peticiones/RutasPeticiones.js';

// ==========================================
// SUB-COMPONENTE 1: Arrastrar Palabras (Interactividad)
// ==========================================
const InterfazArrastrarPalabras = ({ oracionCorrecta, onResponder }) => {
    const [disponibles, setDisponibles] = useState([]);
    const [armada, setArmada] = useState([]);


    // Al cargar, desordenamos las palabras de la oración correcta
    useEffect(() => {
        const palabras = oracionCorrecta.split(' ');
        setDisponibles(palabras.sort(() => Math.random() - 0.5));
    }, [oracionCorrecta]);

    const agregarPalabra = (palabra, indexLocal) => {
        setArmada([...armada, palabra]);
        setDisponibles(disponibles.filter((_, i) => i !== indexLocal));
    };

    const quitarPalabra = (palabra, indexLocal) => {
        setDisponibles([...disponibles, palabra]);
        setArmada(armada.filter((_, i) => i !== indexLocal));
    };

    // Cada vez que cambie la oración armada, se la mandamos al componente principal
    useEffect(() => {
        onResponder(armada.join(' '));
    }, [armada]);

    return (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600">
            {/* Zona de Respuesta */}
            <div className="min-h-[60px] p-3 bg-slate-900 rounded-lg border-2 border-dashed border-blue-500/50 mb-4 flex flex-wrap gap-2 items-center">
                {armada.length === 0 && <span className="text-slate-500 text-sm">Haz clic en las palabras de abajo para armar tu respuesta...</span>}
                {armada.map((p, i) => (
                    <button key={i} onClick={() => quitarPalabra(p, i)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded shadow transition-colors">
                        {p}
                    </button>
                ))}
            </div>
            {/* Zona de Palabras Disponibles */}
            <div className="flex flex-wrap gap-2">
                {disponibles.map((p, i) => (
                    <button key={i} onClick={() => agregarPalabra(p, i)} className="bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-500 px-3 py-1.5 rounded shadow transition-colors">
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// SUB-COMPONENTE 2: Relación de Columnas
// ==========================================
const InterfazColumnas = ({ parejas, onResponder }) => {
    const [opcionesDerecha, setOpcionesDerecha] = useState([]);
    const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState({});

    // Al cargar, extraemos solo la columna derecha y la desordenamos
    useEffect(() => {
        const derechas = parejas.map(p => p.derecha);
        setOpcionesDerecha(derechas.sort(() => Math.random() - 0.5));
    }, [parejas]);

    const manejarSeleccion = (indexIzquierda, valorDerecha) => {
        const nuevasRespuestas = { ...respuestasSeleccionadas, [indexIzquierda]: valorDerecha };
        setRespuestasSeleccionadas(nuevasRespuestas);
        onResponder(nuevasRespuestas);
    };

    return (
        <div className="space-y-3">
            {parejas.map((p, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-3 items-center bg-slate-800 p-3 rounded-lg border border-slate-600">
                    <div className="w-full md:w-1/2 bg-slate-700 p-2 rounded text-center text-white font-medium shadow-inner">
                        {p.izquierda}
                    </div>
                    <div className="w-full md:w-1/2 flex items-center gap-2">
                        <span className="text-blue-400 font-bold hidden md:block">→</span>
                        <select
                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            onChange={(e) => manejarSeleccion(i, e.target.value)}
                            defaultValue=""
                        >
                            <option value="" disabled>Selecciona su pareja...</option>
                            {opcionesDerecha.map((opcion, idx) => (
                                <option key={idx} value={opcion}>{opcion}</option>
                            ))}
                        </select>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ==========================================
// COMPONENTE PRINCIPAL DEL EXAMEN
// ==========================================
export default function ResolverExamenPage() {
    const { id_g_asignado, id_quizz } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [preguntas, setPreguntas] = useState([]);
    const [respuestasAlumno, setRespuestasAlumno] = useState({});
    const [cargando, setCargando] = useState(true);

    // Estados para los resultados
    const [examenTerminado, setExamenTerminado] = useState(false);
    const [calificacion, setCalificacion] = useState({ correctas: 0, total: 0, puntaje: 0 });

    useEffect(() => {
        const cargarExamen = async () => {
            try {
                const peticion = await fetch(`${QuizzesTable}/${id_quizz}/preguntas`, {
                    headers: { 'Authorization': token }
                });
                const data = await peticion.json();
                setPreguntas(data);
            } catch (error) {
                console.error("Error al cargar el examen", error);
            } finally {
                setCargando(false);
            }
        };
        cargarExamen();
    }, [id_quizz]);

    // ==========================================
    // Guardar lo que el alumno va respondiendo
    // ==========================================
    const registrarRespuesta = (indexPregunta, valor) => {
        setRespuestasAlumno(prev => ({
            ...prev,
            [indexPregunta]: valor
        }));
    };

    // ==========================================
    // Lógica de Evaluación Dinámica
    // ==========================================
    const evaluarExamen = async () => {
        let correctasTotales = 0;

        preguntas.forEach((item, index) => {
            const formato = item.respuestas.tipoFormato;
            const respuestaDada = respuestasAlumno[index];
            const respuestaEsperada = item.respuestas.correcta;

            if (!respuestaDada) return; // Si no la contestó, está mal automáticamente

            if (['opcion_multiple', 'texto_opcion_multiple', 'audio_opcion_multiple', 'llenado_espacios'].includes(formato)) {
                // Comprobación directa ignorando mayúsculas y espacios extra
                if (respuestaDada.trim().toLowerCase() === respuestaEsperada.trim().toLowerCase()) {
                    correctasTotales++;
                }
            }
            else if (formato === 'arrastrar_palabras') {
                if (respuestaDada === item.respuestas.oracion_correcta) correctasTotales++;
            }
            else if (formato === 'relacion_columnas') {
                // En columnas, comprobamos que todas las parejas estén bien
                let todasBien = true;
                item.respuestas.parejas.forEach((pareja, i) => {
                    if (respuestaDada[i] !== pareja.derecha) todasBien = false;
                });
                if (todasBien) correctasTotales++;
            }
        });

        const puntajeFinal = Math.round((correctasTotales / preguntas.length) * 100);

        setCalificacion({
            correctas: correctasTotales,
            total: preguntas.length,
            puntaje: puntajeFinal
        });

        setExamenTerminado(true);
        try {
            const peticion = await fetch(CalificacionesTable, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({
                    id_g_asignado: id_g_asignado,
                    puntaje: puntajeFinal,
                    correctas: correctasTotales,
                    total: preguntas.length
                })
            });

            if (!peticion.ok) {
                const error = await peticion.json();
                console.error("Error del backend:", error);
            }
        } catch (error) {
            console.error("No se pudo guardar la calificación", error);
        }



    };

    // ==========================================
    // VISTA B: PANTALLA DE RESULTADOS
    // ==========================================
    if (examenTerminado) {
        return (
            <div className="min-h-screen bg-slate-900 p-8 flex items-center justify-center font-sans">
                <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl border border-slate-700 text-center max-w-lg w-full transform animate-fade-in">
                    <h1 className="text-4xl text-white font-bold mb-4">¡Examen Terminado!</h1>
                    <div className="w-32 h-32 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center border-4 border-blue-500 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                        <span className="text-5xl font-black text-blue-400">{calificacion.puntaje}</span>
                    </div>
                    <p className="text-xl text-slate-300 mb-2">
                        Respondiste correctamente <strong className="text-emerald-400">{calificacion.correctas}</strong> de {calificacion.total} preguntas.
                    </p>
                    <p className="text-slate-500 mb-8">Tus resultados han sido enviados a tu profesor.</p>

                    <button
                        onClick={() => navigate('/PanelAlumno')}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all w-full"
                    >
                        Volver a Mis Clases
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // VISTA A: RESOLUCIÓN DEL EXAMEN
    // ==========================================
    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sans text-slate-200 pb-24">

            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <span>←</span> Salir sin guardar
                </button>

                <div className="mb-8 border-b border-slate-700 pb-4">
                    <h1 className="text-3xl font-bold text-white tracking-wide">Resolviendo Examen</h1>
                    <p className="text-slate-400 mt-2">Lee cuidadosamente cada pregunta antes de responder. ¡Mucho éxito!</p>
                </div>

                {cargando ? (
                    <div className="text-center py-20 text-slate-500 text-xl">Cargando tu examen...</div>
                ) : preguntas.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                        Este examen aún no tiene preguntas publicadas.
                    </div>
                ) : (
                    <div className="space-y-8">
                        {preguntas.map((item, index) => {
                            const resp = item.respuestas;
                            const formato = resp.tipoFormato;

                            return (
                                <div key={index} className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">

                                    {/* Etiqueta del número de pregunta */}
                                    <div className="absolute top-0 left-0 bg-blue-600 text-white px-4 py-1 rounded-br-xl font-bold shadow-md">
                                        Pregunta {index + 1}
                                    </div>

                                    <div className="mt-6 mb-6 text-lg text-white font-medium leading-relaxed">
                                        {item.pregunta}
                                    </div>

                                    {/* LECTURA */}
                                    {formato === 'texto_opcion_multiple' && (
                                        <div className="bg-slate-900 p-5 rounded-xl border border-slate-600 mb-6 text-slate-300 leading-relaxed shadow-inner">
                                            {resp.lectura}
                                        </div>
                                    )}

                                    {/* AUDIO */}
                                    {formato === 'audio_opcion_multiple' && (
                                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-600 mb-6 flex justify-center shadow-inner">
                                            <audio controls className="w-full max-w-md">
                                                <source src={resp.audio} type="audio/mpeg" />
                                                Tu navegador no soporta el elemento de audio.
                                            </audio>
                                        </div>
                                    )}

                                    {/* OPCIÓN MÚLTIPLE */}
                                    {['opcion_multiple', 'texto_opcion_multiple', 'audio_opcion_multiple'].includes(formato) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {resp.opciones.map((opt, i) => (
                                                <label
                                                    key={i}
                                                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all ${respuestasAlumno[index] === opt
                                                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`pregunta_${index}`}
                                                        value={opt}
                                                        onChange={(e) => registrarRespuesta(index, e.target.value)}
                                                        className="w-5 h-5 accent-blue-500"
                                                    />
                                                    <span className="text-lg">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {/* LLENADO DE ESPACIOS */}
                                    {formato === 'llenado_espacios' && (
                                        <div className="mt-4">
                                            <input
                                                type="text"
                                                placeholder="Escribe tu respuesta aquí..."
                                                onChange={(e) => registrarRespuesta(index, e.target.value)}
                                                className="w-full md:w-1/2 p-3 bg-slate-900 border-2 border-slate-600 rounded-xl text-white text-lg focus:ring-0 focus:border-blue-500 transition-colors placeholder:text-slate-600 outline-none"
                                            />
                                        </div>
                                    )}

                                    {/* ARRASTRAR PALABRAS */}
                                    {formato === 'arrastrar_palabras' && (
                                        <InterfazArrastrarPalabras
                                            oracionCorrecta={resp.oracion_correcta}
                                            onResponder={(texto) => registrarRespuesta(index, texto)}
                                        />
                                    )}

                                    {/* RELACIÓN DE COLUMNAS */}
                                    {formato === 'relacion_columnas' && (
                                        <InterfazColumnas
                                            parejas={resp.parejas}
                                            onResponder={(objetoRespuestas) => registrarRespuesta(index, objetoRespuestas)}
                                        />
                                    )}
                                </div>
                            );
                        })}

                        {/* Botón Flotante para Enviar */}
                        <div className="fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 p-4 flex justify-center z-50">
                            <button
                                onClick={evaluarExamen}
                                className="bg-emerald-500 hover:bg-emerald-400 text-white text-lg font-bold py-3 px-12 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-1"
                            >
                                ✓ Entregar Examen
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}