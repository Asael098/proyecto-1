import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Select, Boton } from '../componets/Elements.jsx';
import { successAlert } from '../componets/Alerts.jsx';
import { QuizzesTable } from '../Peticiones/RutasPeticiones.js';
import { TarjetaPregunta } from '../componets/TarjetaPregunta.jsx';

export default function ConstructorQuizPage() {
    const { id_quizz } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [preguntas, setPreguntas] = useState([]);

    // --- ESTADOS DEL FORMULARIO ---
    const [tipoFormato, setTipoFormato] = useState('');
    const [textoPregunta, setTextoPregunta] = useState('');

    // Estados para Opción Múltiple (Normal, Lectura y Audio)
    const [opcionA, setOpcionA] = useState('');
    const [opcionB, setOpcionB] = useState('');
    const [opcionC, setOpcionC] = useState('');
    const [respuestaCorrecta, setRespuestaCorrecta] = useState('');

    // Nuevos Estados para Formatos Avanzados
    const [textoLectura, setTextoLectura] = useState(''); // Para Textos largos
    const [urlAudio, setUrlAudio] = useState(''); // Para Audios
    const [oracionCorrecta, setOracionCorrecta] = useState(''); // Para Drag & Drop
    const [parejas, setParejas] = useState([{ izquierda: '', derecha: '' }]); // Para Columnas

    // ==========================================
    // 1. CARGAR PREGUNTAS PREVIAS
    // ==========================================
    useEffect(() => {
        const cargarPreguntas = async () => {
            try {
                const peticion = await fetch(`${QuizzesTable}/${id_quizz}/preguntas`, {
                    headers: { 'Authorization': token }
                });
                const res = await peticion.json();
                if (res.length > 0) setPreguntas(res);
            } catch (error) {
                console.error("Error al cargar preguntas", error);
            }
        };
        cargarPreguntas();
    }, [id_quizz]);

    // ==========================================
    // 2. AGREGAR PREGUNTA AL JSON
    // ==========================================
    const agregarPreguntaTemporal = (e) => {
        e.preventDefault();

        let objetoRespuesta = {};

        // Construcción dinámica del JSON según el formato
        if (tipoFormato === 'opcion_multiple') {
            objetoRespuesta = { tipoFormato: 'opcion_multiple', opciones: [opcionA, opcionB, opcionC], correcta: respuestaCorrecta };
        }
        else if (tipoFormato === 'llenado_espacios') {
            objetoRespuesta = { tipoFormato: 'llenado_espacios', correcta: respuestaCorrecta };
        }
        else if (tipoFormato === 'texto_opcion_multiple') {
            objetoRespuesta = { tipoFormato: 'texto_opcion_multiple', lectura: textoLectura, opciones: [opcionA, opcionB, opcionC], correcta: respuestaCorrecta };
        }
        else if (tipoFormato === 'audio_opcion_multiple') {
            objetoRespuesta = { tipoFormato: 'audio_opcion_multiple', audio: urlAudio, opciones: [opcionA, opcionB, opcionC], correcta: respuestaCorrecta };
        }
        else if (tipoFormato === 'arrastrar_palabras') {
            // El backend/frontend del alumno se encargará de desordenar esta oración
            objetoRespuesta = { tipoFormato: 'arrastrar_palabras', oracion_correcta: oracionCorrecta };
        }
        else if (tipoFormato === 'relacion_columnas') {
            objetoRespuesta = { tipoFormato: 'relacion_columnas', parejas: parejas };
        }

        const nuevaPregunta = { pregunta: textoPregunta, respuestas: objetoRespuesta };
        setPreguntas([...preguntas, nuevaPregunta]);
        limpiarFormulario();
    };

    const limpiarFormulario = () => {
        setTextoPregunta(''); setOpcionA(''); setOpcionB(''); setOpcionC(''); setRespuestaCorrecta('');
        setTextoLectura(''); setUrlAudio(''); setOracionCorrecta(''); setParejas([{ izquierda: '', derecha: '' }]);
    };

    const quitarPregunta = (index) => {
        setPreguntas(preguntas.filter((_, i) => i !== index));
    };

    // ==========================================
    // MÉTODOS PARA RELACIÓN DE COLUMNAS
    // ==========================================
    const actualizarPareja = (index, campo, valor) => {
        const nuevasParejas = [...parejas];
        nuevasParejas[index][campo] = valor;
        setParejas(nuevasParejas);
    };
    const agregarFilaPareja = () => setParejas([...parejas, { izquierda: '', derecha: '' }]);

    // ==========================================
    // 3. GUARDAR EN BD
    // ==========================================
    const guardarExamenFinal = async () => {
        try {
            const peticion = await fetch(`${QuizzesTable}/${id_quizz}/preguntas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ preguntas })
            });
            if (peticion.ok) {
                successAlert("¡Examen guardado correctamente!");
                navigate('/Quizzes');
            }
        } catch (error) {
            console.error("Error al guardar", error);
        }
    };

    // ==========================================
    // RENDERIZADO VISUAL
    // ==========================================
    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sans text-slate-200">

            <div className="mb-6 flex justify-between items-center border-b border-slate-700 pb-4">
                <div>
                    <button onClick={() => navigate('/Quizzes')} className="text-emerald-400 hover:text-emerald-300 font-medium mb-2 block">← Volver a Quizzes</button>
                    <h1 className="text-3xl font-bold text-white tracking-wide">Laboratorio de Preguntas</h1>
                </div>
                <button onClick={guardarExamenFinal} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all">
                    💾 Guardar Examen Final
                </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 items-start">

                {/* PANEL IZQUIERDO: Constructor Dinámico */}
                <div className="w-full xl:w-1/3 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700 sticky top-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <h2 className="text-xl font-semibold text-emerald-400 mb-6 border-b border-slate-700 pb-4">🔧 Configurar Pregunta</h2>

                    <form onSubmit={agregarPreguntaTemporal} className="space-y-4">
                        <Select
                            name="tipoFormato" placeholder="-- Elige el formato de pregunta --"
                            onChange={(e) => { setTipoFormato(e.target.value); limpiarFormulario(); }}
                            opciones={[
                                { valor: 'opcion_multiple', texto: '1. Opción Múltiple Clásica' },
                                { valor: 'llenado_espacios', texto: '2. Llenado de Espacios (Fill in)' },
                                { valor: 'texto_opcion_multiple', texto: '3. Lectura + Opción Múltiple' },
                                { valor: 'audio_opcion_multiple', texto: '4. Audio + Opción Múltiple' },
                                { valor: 'arrastrar_palabras', texto: '5. Arrastrar Palabras (Oraciones)' },
                                { valor: 'relacion_columnas', texto: '6. Relación de Columnas' }
                            ]}
                        />

                        {tipoFormato && (
                            <>
                                {/* Instrucción principal (Aplica para todos) */}
                                <textarea
                                    placeholder="Instrucción de la pregunta (Ej. Lee el texto y responde / Escucha y selecciona...)"
                                    value={textoPregunta} onChange={(e) => setTextoPregunta(e.target.value)}
                                    required rows="2" className="border border-slate-600 bg-slate-700 text-white p-2 rounded-lg w-full"
                                />

                                {/* 3. LECTURA */}
                                {tipoFormato === 'texto_opcion_multiple' && (
                                    <textarea
                                        placeholder="Pega aquí el texto de lectura completo..."
                                        value={textoLectura} onChange={(e) => setTextoLectura(e.target.value)}
                                        required rows="4" className="border border-blue-500/50 bg-slate-700 text-white p-2 rounded-lg w-full"
                                    />
                                )}

                                {/* 4. AUDIO */}
                                {tipoFormato === 'audio_opcion_multiple' && (
                                    <input
                                        type="url" placeholder="URL del archivo de Audio (MP3)"
                                        value={urlAudio} onChange={(e) => setUrlAudio(e.target.value)}
                                        required className="border border-purple-500/50 bg-slate-700 text-white p-2 rounded-lg w-full"
                                    />
                                )}

                                {/* BLOQUE: OPCIÓN MÚLTIPLE (Aplica para formatos 1, 3 y 4) */}
                                {['opcion_multiple', 'texto_opcion_multiple', 'audio_opcion_multiple'].includes(tipoFormato) && (
                                    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 space-y-3">
                                        <p className="text-sm text-slate-300 font-medium">Opciones:</p>
                                        <input className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white" placeholder="Opción A" required value={opcionA} onChange={(e) => setOpcionA(e.target.value)} />
                                        <input className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white" placeholder="Opción B" required value={opcionB} onChange={(e) => setOpcionB(e.target.value)} />
                                        <input className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white" placeholder="Opción C" required value={opcionC} onChange={(e) => setOpcionC(e.target.value)} />

                                        <p className="text-sm text-slate-300 font-medium mt-2">¿Correcta?</p>
                                        <select required value={respuestaCorrecta} onChange={(e) => setRespuestaCorrecta(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-emerald-400">
                                            <option value="" disabled>Selecciona la correcta</option>
                                            <option value={opcionA}>Opción A</option>
                                            <option value={opcionB}>Opción B</option>
                                            <option value={opcionC}>Opción C</option>
                                        </select>
                                    </div>
                                )}

                                {/* 2. LLENADO DE ESPACIOS */}
                                {tipoFormato === 'llenado_espacios' && (
                                    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                                        <input className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white" placeholder="Palabra exacta que falta" required value={respuestaCorrecta} onChange={(e) => setRespuestaCorrecta(e.target.value)} />
                                    </div>
                                )}

                                {/* 5. ARRASTRAR PALABRAS */}
                                {tipoFormato === 'arrastrar_palabras' && (
                                    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                                        <p className="text-xs text-slate-400 mb-2">Escribe la oración correcta. El sistema la desordenará automáticamente para el alumno.</p>
                                        <input className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white" placeholder="Ej. The cat is on the table" required value={oracionCorrecta} onChange={(e) => setOracionCorrecta(e.target.value)} />
                                    </div>
                                )}

                                {/* 6. RELACIÓN DE COLUMNAS */}
                                {tipoFormato === 'relacion_columnas' && (
                                    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 space-y-3">
                                        <p className="text-sm text-slate-300 font-medium">Parejas Correctas:</p>
                                        {parejas.map((pareja, i) => (
                                            <div key={i} className="flex gap-2">
                                                <input required className="w-1/2 p-2 bg-slate-800 border border-slate-600 rounded text-white text-sm" placeholder="Col Izquierda (Ej. Apple)" value={pareja.izquierda} onChange={(e) => actualizarPareja(i, 'izquierda', e.target.value)} />
                                                <input required className="w-1/2 p-2 bg-slate-800 border border-slate-600 rounded text-white text-sm" placeholder="Col Derecha (Ej. Manzana)" value={pareja.derecha} onChange={(e) => actualizarPareja(i, 'derecha', e.target.value)} />
                                            </div>
                                        ))}
                                        <button type="button" onClick={agregarFilaPareja} className="text-emerald-400 text-sm font-medium hover:text-emerald-300 mt-2">+ Añadir otra pareja</button>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <Boton contenido="Añadir al Examen +" type="submit" />
                                </div>
                            </>
                        )}
                    </form>
                </div>

                {/* PANEL DERECHO: Vista Previa Dinámica */}
                <div className="w-full xl:w-2/3 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700">
                    <h2 className="text-xl font-semibold text-white mb-6">Vista Previa del Examen ({preguntas.length})</h2>

                    {preguntas.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                            Aún no has agregado preguntas. Selecciona un formato en el panel izquierdo.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* 2. REEMPLAZA LAS CASI 100 LÍNEAS DE VISTA PREVIA CON ESTO: */}
                            {preguntas.map((item, index) => (
                                <TarjetaPregunta
                                    key={index}
                                    item={item}
                                    index={index}
                                    esNueva={!item.id_detalle_quizz}
                                    onEliminar={quitarPregunta}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}