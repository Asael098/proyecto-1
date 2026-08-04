import React from 'react';

export const TarjetaPregunta = ({ item, index, esNueva, onEliminar }) => {
    const resp = item.respuestas;

    const estiloTarjeta = esNueva
        ? 'bg-amber-900/10 border-amber-500/50 border-dashed'
        : 'bg-slate-700 border-slate-600';

    const estiloNumero = esNueva
        ? 'text-amber-400 border-amber-500/30 bg-amber-400/10'
        : 'text-emerald-400 border-emerald-500/30 bg-slate-800';

    return (
        <div className={`p-5 rounded-xl border relative group transition-all ${estiloTarjeta}`}>

            {/* Letrero de advertencia para preguntas no guardadas */}
            {esNueva && (
                <div className="absolute -top-3 left-6 bg-amber-500 text-amber-950 text-xs font-bold px-3 py-1 rounded-full shadow border border-amber-400 z-10 flex items-center gap-1">
                    <span>⚠️</span> Pendiente de guardar
                </div>
            )}

            {/* Botón de eliminar opcional (Para que la tarjeta sirva también para los alumnos) */}
            {onEliminar && (
                <button
                    onClick={() => onEliminar(index)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1 rounded transition-colors opacity-0 group-hover:opacity-100 z-10"
                >
                    ✖ Quitar
                </button>
            )}

            <div className="flex gap-4 mt-2">
                <div className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-lg shrink-0 border ${estiloNumero}`}>
                    {index + 1}
                </div>
                <div className="w-full pr-12">
                    <p className="text-lg text-white font-medium mb-3">{item.pregunta}</p>

                    {/* Preview: Texto Largo */}
                    {resp.tipoFormato === 'texto_opcion_multiple' && (
                        <div className="bg-slate-800 p-3 rounded text-sm text-slate-300 mb-3 border-l-2 border-blue-500">
                            {resp.lectura}
                        </div>
                    )}

                    {/* Preview: Audio */}
                    {resp.tipoFormato === 'audio_opcion_multiple' && (
                        <div className="bg-slate-800 p-3 rounded mb-3 border-l-2 border-purple-500 flex items-center gap-2 text-purple-400 text-sm">
                            <span>🔊 Audio Adjunto:</span>
                            <a href={resp.audio} target="_blank" rel="noreferrer" className="underline truncate">
                                {resp.audio}
                            </a>
                        </div>
                    )}

                    {/* Preview: Opciones */}
                    {['opcion_multiple', 'texto_opcion_multiple', 'audio_opcion_multiple'].includes(resp.tipoFormato) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {resp.opciones.map((opt, i) => (
                                <div key={i} className={`p-2 rounded border text-sm ${opt === resp.correcta ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
                                    {opt} {opt === resp.correcta && '✓'}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Preview: Llenado de Espacios */}
                    {resp.tipoFormato === 'llenado_espacios' && (
                        <div className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-200 rounded-lg text-sm">
                            Respuesta esperada: <strong>{resp.correcta}</strong>
                        </div>
                    )}

                    {/* Preview: Arrastrar palabras */}
                    {resp.tipoFormato === 'arrastrar_palabras' && (
                        <div className="flex gap-2 flex-wrap mt-2">
                            {resp.oracion_correcta.split(' ').map((palabra, i) => (
                                <span key={i} className="bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 px-3 py-1 rounded-md shadow-sm">
                                    {palabra}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Preview: Relación Columnas */}
                    {resp.tipoFormato === 'relacion_columnas' && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {resp.parejas.map((p, i) => (
                                <React.Fragment key={i}>
                                    <div className="bg-slate-800 p-2 rounded border border-slate-600 text-center text-sm">{p.izquierda}</div>
                                    <div className="bg-slate-800 p-2 rounded border border-slate-600 text-center text-sm">{p.derecha}</div>
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};