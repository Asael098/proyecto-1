import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../componets/Form.jsx';
import { Select } from '../componets/Elements.jsx';
import { successAlert } from '../componets/Alerts.jsx';
import { GeneradorIATable, QuizzesTable } from '../Peticiones/RutasPeticiones.js';

export default function GeneradorIAPage() {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const [cargando, setCargando] = useState(false);
    const [quizGenerado, setQuizGenerado] = useState(null);
    const [guardando, setGuardando] = useState(false);

    const niveles = [{ valor: 'A1', texto: 'A1' }, { valor: 'A2', texto: 'A2' }, { valor: 'B1', texto: 'B1' }, { valor: 'B2', texto: 'B2' }];
    const idiomas = [{ valor: 'Inglés', texto: 'Inglés' }, { valor: 'Francés', texto: 'Francés' }];
    const numeros = [{ valor: '5', texto: '5 Preguntas' }, { valor: '10', texto: '10 Preguntas' }, { valor: '15', texto: '15 Preguntas' }];
    const publicos = [{ valor: 'Adolescentes', texto: 'Adolescentes' }, { valor: 'Adultos', texto: 'Adultos' }, { valor: 'Profesionistas', texto: 'Profesionistas' }];
    const habilidades = [{ valor: 'Grammar', texto: 'Gramática' }, { valor: 'Vocabulary', texto: 'Vocabulario' }, { valor: 'Reading', texto: 'Comprensión Lectora' }];
    const tipos = [
        { valor: 'opcion_multiple', texto: 'Opción Múltiple' },
        { valor: 'llenado_espacios', texto: 'Llenado de Espacios' },
        { valor: 'arrastrar_palabras', texto: 'Ordenar Oraciones' },
        { valor: 'relacion_columnas', texto: 'Relación de Columnas' },
        { valor: 'texto_opcion_multiple', texto: 'Texto + Opción Múltiple' }
    ];

    // ==========================================
    // 1. GENERAR CON IA
    // ==========================================
    const generarConIA = async (e) => {
        e.preventDefault();
        setCargando(true);
        setQuizGenerado(null);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const peticion = await fetch(GeneradorIATable, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(data)
            });

            if (peticion.ok) {
                const resultado = await peticion.json();
                setQuizGenerado({ ...resultado, ...data });
                successAlert('¡Examen generado! Revísalo y edítalo antes de guardar.');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setCargando(false);
        }
    };

    // ==========================================
    // 2. FUNCIONES DE EDICIÓN EN TIEMPO REAL
    // ==========================================
    const actualizarAtributo = (campo, valor) => {
        setQuizGenerado({ ...quizGenerado, [campo]: valor });
    };

    const actualizarPregunta = (indexPregunta, campo, valor) => {
        const nuevoQuiz = { ...quizGenerado };
        nuevoQuiz.questions[indexPregunta][campo] = valor;
        setQuizGenerado(nuevoQuiz);
    };

    const actualizarOpcion = (indexPregunta, indexOpcion, valor, valorAnterior) => {
        const nuevoQuiz = { ...quizGenerado };
        nuevoQuiz.questions[indexPregunta].options[indexOpcion] = valor;

        // Si la opción que editó era la correcta, actualizamos también el campo "correct_answer"
        if (nuevoQuiz.questions[indexPregunta].correct_answer === valorAnterior) {
            nuevoQuiz.questions[indexPregunta].correct_answer = valor;
        }

        setQuizGenerado(nuevoQuiz);
    };

    const eliminarPreguntaIA = (indexPregunta) => {
        const nuevoQuiz = { ...quizGenerado };
        nuevoQuiz.questions = nuevoQuiz.questions.filter((_, i) => i !== indexPregunta);
        setQuizGenerado(nuevoQuiz);
    };

    // --- Funciones para Relación de Columnas ---
    const actualizarPareja = (indexPregunta, indexPareja, campo, valor) => {
        const nuevoQuiz = { ...quizGenerado };
        nuevoQuiz.questions[indexPregunta].pairs[indexPareja][campo] = valor;
        setQuizGenerado(nuevoQuiz);
    };

    const agregarParejaIA = (indexPregunta) => {
        const nuevoQuiz = { ...quizGenerado };
        nuevoQuiz.questions[indexPregunta].pairs.push({ left: '', right: '' });
        setQuizGenerado(nuevoQuiz);
    };

    const quitarParejaIA = (indexPregunta, indexPareja) => {
        const nuevoQuiz = { ...quizGenerado };
        nuevoQuiz.questions[indexPregunta].pairs = nuevoQuiz.questions[indexPregunta].pairs.filter((_, i) => i !== indexPareja);
        setQuizGenerado(nuevoQuiz);
    };

    // --- Función para actualizar el texto de lectura compartido ---
    const actualizarLecturaCompartida = (valor) => {
        const nuevoQuiz = { ...quizGenerado };
        nuevoQuiz.questions = nuevoQuiz.questions.map(q => ({ ...q, reading_text: valor }));
        setQuizGenerado(nuevoQuiz);
    };

    // ==========================================
    // 3. GUARDAR EN BASE DE DATOS
    // ==========================================
    const guardarYEditar = async () => {
        setGuardando(true);
        try {
            // 1. Verificación de seguridad
            if (!quizGenerado.questions || quizGenerado.questions.length === 0) {
                alert("No hay preguntas para guardar. Intenta generar el quiz nuevamente.");
                setGuardando(false);
                return;
            }

            // 2. Crear la cabecera del Quiz
            const quizData = {
                nombre: quizGenerado.title || "Examen Generado por IA",
                tema: quizGenerado.tema || "General",
                nivel: quizGenerado.nivel || "A1",
                idioma: quizGenerado.idioma || "Inglés",
                tipo: 'Práctica',
                habilidad: quizGenerado.habilidad || "Grammar"
            };

            const peticionQuiz = await fetch(QuizzesTable, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(quizData)
            });

            if (!peticionQuiz.ok) throw new Error("El servidor rechazó la creación del examen.");

            const nuevoQuiz = await peticionQuiz.json();
            const id_quizz = nuevoQuiz.quiz?.id_quizz || nuevoQuiz.id_quizz || nuevoQuiz.id || nuevoQuiz.data?.id_quizz;

            if (!id_quizz) throw new Error("El backend no devolvió un ID válido para el examen.");

            // 3. Empaquetar TODAS las preguntas en un solo arreglo (como lo espera tu backend)
            const tipoFormato = quizGenerado.tipo || 'opcion_multiple';

            const arregloPreguntas = quizGenerado.questions.map(q => {
                // Estructura diferente según el tipo de formato
                if (tipoFormato === 'arrastrar_palabras') {
                    return {
                        pregunta: q.question_text || "Ordena la siguiente oración",
                        respuestas: {
                            tipoFormato: 'arrastrar_palabras',
                            oracion_correcta: (q.correct_sentence || "").trim().replace(/\s+/g, ' ')
                        }
                    };
                }
                if (tipoFormato === 'relacion_columnas') {
                    return {
                        pregunta: q.question_text || "Relaciona las columnas",
                        respuestas: {
                            tipoFormato: 'relacion_columnas',
                            parejas: (q.pairs || []).map(p => ({ izquierda: p.left || '', derecha: p.right || '' }))
                        }
                    };
                }
                if (tipoFormato === 'texto_opcion_multiple') {
                    return {
                        pregunta: q.question_text || "Lee el texto y responde",
                        respuestas: {
                            tipoFormato: 'texto_opcion_multiple',
                            lectura: q.reading_text || '',
                            opciones: q.options || [],
                            correcta: q.correct_answer || ''
                        }
                    };
                }
                return {
                    pregunta: q.question_text || q.pregunta || "¿Pregunta sin texto?",
                    respuestas: {
                        tipoFormato: tipoFormato,
                        opciones: q.options || q.opciones || [],
                        correcta: q.correct_answer || q.respuesta_correcta || "",
                        lectura: q.feedback || q.retroalimentacion || ""
                    }
                };
            });

            // 4. Enviar el paquete completo a la API
            const resPreguntas = await fetch(`${QuizzesTable}/${id_quizz}/preguntas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                // AQUÍ ESTÁ LA MAGIA: Enviamos el objeto con la propiedad "preguntas" que espera tu Node.js
                body: JSON.stringify({ preguntas: arregloPreguntas })
            });

            if (!resPreguntas.ok) {
                throw new Error("Error al guardar el paquete de preguntas en la base de datos.");
            }

            // 5. Redirigir al Laboratorio
            navigate(`/ConstructorQuiz/${id_quizz}`);

        } catch (error) {
            console.error("Error crítico al guardar el examen:", error);
            alert(`No se pudo guardar: ${error.message}`);
            setGuardando(false);
        }
    };
    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sanspro text-slate-200">
            <div className="mb-8 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 flex items-center gap-2">
                    ✨ Creador de Quizzes con IA
                </h1>
                <p className="text-slate-400 mt-2">Configura los parámetros, revisa lo generado, haz tus correcciones y publica.</p>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">

                {/* PANEL IZQUIERDO: Parámetros */}
                <div className="w-full xl:w-1/3 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 h-fit sticky top-8 z-10">
                    <Form onSubmit={generarConIA} cargando={cargando} textoBoton="Generar con IA ✨">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Select name="idioma" placeholder="Idioma" opciones={idiomas} />
                            <Select name="nivel" placeholder="Nivel" opciones={niveles} />
                            <Select name="numero" placeholder="Cantidad" opciones={numeros} />
                            <Select name="tipo" placeholder="Formato" opciones={tipos} />
                        </div>
                        <div className="space-y-4 mb-6">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Tema Principal</p>
                                <input type="text" name="tema" required placeholder="Ej: Past Simple..." className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Select name="habilidad" placeholder="Habilidad" opciones={habilidades} />
                                <Select name="publico" placeholder="Público" opciones={publicos} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Instrucciones Específicas (Opcional)</p>
                                <textarea name="instrucciones" rows="3" placeholder="Ej: Usa un tono divertido..." className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none resize-none"></textarea>
                            </div>
                        </div>
                    </Form>
                </div>

                {/* PANEL DERECHO: Editor de Vista Previa */}
                <div className="w-full xl:w-2/3 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">

                    {cargando ? (
                        <div className="py-32 flex flex-col items-center justify-center text-purple-400 animate-pulse">
                            <span className="text-6xl mb-4">🧠</span>
                            <h3 className="text-xl font-bold">La IA está diseñando tu examen...</h3>
                        </div>
                    ) : !quizGenerado ? (
                        <div className="text-center py-24 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                            <span className="text-4xl block mb-2">🤖</span>
                            Llena los parámetros y presiona generar para ver la magia.
                        </div>
                    ) : (
                        <div className="animate-fade-in relative">

                            {/* Letrero flotante avisando que es editable */}
                            <div className="absolute -top-10 right-0 bg-blue-500/20 text-blue-400 border border-blue-500/50 px-4 py-1.5 rounded-full text-sm font-bold animate-bounce flex items-center gap-2">
                                <span>✏️</span> Puedes hacer clic en los textos para editarlos
                            </div>

                            <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-4">
                                <div className="w-full pr-4">
                                    <input
                                        type="text"
                                        value={quizGenerado.title}
                                        onChange={(e) => actualizarAtributo('title', e.target.value)}
                                        className="text-2xl font-bold text-white bg-transparent border-b border-transparent hover:border-slate-500 focus:border-purple-500 outline-none w-full mb-2 transition-colors"
                                    />
                                    <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/30">
                                        {quizGenerado.language} - {quizGenerado.level}
                                    </span>
                                </div>
                                <button
                                    onClick={guardarYEditar}
                                    disabled={guardando}
                                    className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-colors flex items-center gap-2"
                                >
                                    {guardando ? 'Guardando...' : '💾 Guardar y Asignar'}
                                </button>
                            </div>

                            <div className="mb-6 bg-slate-900 p-4 rounded-lg border-l-4 border-purple-500">
                                <strong className="block text-purple-400 mb-1 text-sm">Instrucciones para el alumno:</strong>
                                <textarea
                                    value={quizGenerado.instructions}
                                    onChange={(e) => actualizarAtributo('instructions', e.target.value)}
                                    className="w-full bg-transparent text-slate-300 outline-none resize-none border-b border-transparent hover:border-slate-600 focus:border-purple-500 transition-colors"
                                    rows="2"
                                />
                            </div>

                            {/* ===================== */}
                            {/* BLOQUE COMPARTIDO: TEXTO DE LECTURA (solo para texto_opcion_multiple) */}
                            {/* ===================== */}
                            {quizGenerado.tipo === 'texto_opcion_multiple' && quizGenerado.questions.length > 0 && (
                                <div className="mb-6 bg-slate-900/80 p-5 rounded-xl border border-blue-500/30 shadow-inner">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-2xl">📖</span>
                                        <p className="text-sm text-blue-400 font-semibold">Texto de Lectura Compartido (editable)</p>
                                    </div>
                                    <textarea
                                        value={quizGenerado.questions[0]?.reading_text || ''}
                                        onChange={(e) => actualizarLecturaCompartida(e.target.value)}
                                        rows="6"
                                        className="w-full p-4 bg-slate-800 border border-blue-500/20 rounded-lg text-blue-100 text-sm outline-none focus:border-blue-400 transition-colors resize-none leading-relaxed"
                                        placeholder="Escribe o edita el texto de lectura aquí..."
                                    />
                                    <p className="text-xs text-slate-500 mt-2">Este texto se mostrará a los alumnos antes de las preguntas.</p>
                                </div>
                            )}

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {quizGenerado.questions.map((q, i) => (
                                    <div key={i} className="bg-slate-700/30 p-5 rounded-xl border border-slate-600 hover:border-purple-500/50 transition-colors relative group">

                                        {/* Botón eliminar pregunta */}
                                        <button
                                            onClick={() => eliminarPreguntaIA(i)}
                                            className="absolute top-3 right-3 text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1 rounded text-xs transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            ✖ Quitar
                                        </button>

                                        {/* Título de la pregunta editable */}
                                        <div className="flex gap-2 mb-4">
                                            <span className="text-purple-400 font-bold mt-1.5 shrink-0">{i + 1}.</span>
                                            <textarea
                                                value={q.question_text}
                                                onChange={(e) => actualizarPregunta(i, 'question_text', e.target.value)}
                                                className="font-bold text-white text-lg bg-slate-800/50 border border-transparent hover:border-slate-500 focus:border-purple-500 rounded-lg p-2 w-full outline-none resize-none transition-colors"
                                                rows="2"
                                            />
                                        </div>

                                        {/* ===================== */}
                                        {/* VISTA: ARRASTRAR PALABRAS */}
                                        {/* ===================== */}
                                        {quizGenerado.tipo === 'arrastrar_palabras' && q.correct_sentence && (
                                            <div className="ml-6 mb-4">
                                                <p className="text-sm text-slate-400 mb-2 font-medium">🧩 Oración correcta (editable):</p>
                                                <input
                                                    type="text"
                                                    value={q.correct_sentence}
                                                    onChange={(e) => actualizarPregunta(i, 'correct_sentence', e.target.value)}
                                                    className="w-full p-2.5 bg-slate-900 border border-indigo-500/50 rounded-lg text-indigo-200 outline-none focus:border-indigo-400 transition-colors mb-3"
                                                />
                                                {/* Preview como chips */}
                                                <div className="flex gap-2 flex-wrap">
                                                    {q.correct_sentence.split(' ').filter(p => p).map((palabra, idx) => (
                                                        <span key={idx} className="bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 px-3 py-1.5 rounded-md shadow-sm text-sm font-medium">
                                                            {palabra}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* ===================== */}
                                        {/* VISTA: RELACIÓN DE COLUMNAS */}
                                        {/* ===================== */}
                                        {quizGenerado.tipo === 'relacion_columnas' && q.pairs && (
                                            <div className="ml-6 mb-4">
                                                <p className="text-sm text-slate-400 mb-2 font-medium">🔗 Parejas (editables):</p>
                                                <div className="space-y-2">
                                                    {/* Encabezados */}
                                                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-slate-500 font-semibold px-1">
                                                        <span>Columna Izquierda</span>
                                                        <span>Columna Derecha</span>
                                                        <span className="w-8"></span>
                                                    </div>
                                                    {q.pairs.map((pair, idx) => (
                                                        <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                                            <input
                                                                type="text"
                                                                value={pair.left}
                                                                onChange={(e) => actualizarPareja(i, idx, 'left', e.target.value)}
                                                                className="p-2 bg-slate-900 border border-amber-500/30 rounded-lg text-amber-200 text-sm outline-none focus:border-amber-400 transition-colors"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={pair.right}
                                                                onChange={(e) => actualizarPareja(i, idx, 'right', e.target.value)}
                                                                className="p-2 bg-slate-900 border border-cyan-500/30 rounded-lg text-cyan-200 text-sm outline-none focus:border-cyan-400 transition-colors"
                                                            />
                                                            <button
                                                                onClick={() => quitarParejaIA(i, idx)}
                                                                className="text-red-400 hover:text-red-300 text-xs p-1 rounded hover:bg-red-400/10 transition-colors"
                                                                title="Quitar pareja"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => agregarParejaIA(i)}
                                                    className="text-emerald-400 text-sm font-medium hover:text-emerald-300 mt-2"
                                                >
                                                    + Añadir otra pareja
                                                </button>
                                            </div>
                                        )}

                                        {/* ===================== */}
                                        {/* VISTA: TEXTO + OPCIÓN MÚLTIPLE (solo opciones, el texto está arriba) */}
                                        {/* ===================== */}
                                        {quizGenerado.tipo === 'texto_opcion_multiple' && q.options && (
                                            <div className="ml-6 mb-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {q.options.map((opt, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name={`correct_${i}`}
                                                                checked={opt === q.correct_answer}
                                                                onChange={() => actualizarPregunta(i, 'correct_answer', opt)}
                                                                className="accent-emerald-500 w-5 h-5 cursor-pointer shrink-0"
                                                                title="Marcar como respuesta correcta"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={(e) => actualizarOpcion(i, idx, e.target.value, opt)}
                                                                className={`w-full p-2.5 rounded-lg text-sm border focus:outline-none transition-colors ${opt === q.correct_answer
                                                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                                                                    : 'bg-slate-900 border-slate-600 text-slate-300 hover:border-slate-400 focus:border-purple-500'
                                                                    }`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* ===================== */}
                                        {/* VISTA: OPCIONES (Opción Múltiple / Llenado clásico) */}
                                        {/* ===================== */}
                                        {q.options && !['arrastrar_palabras', 'relacion_columnas', 'texto_opcion_multiple'].includes(quizGenerado.tipo) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 ml-6">
                                                {q.options.map((opt, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name={`correct_${i}`}
                                                            checked={opt === q.correct_answer}
                                                            onChange={() => actualizarPregunta(i, 'correct_answer', opt)}
                                                            className="accent-emerald-500 w-5 h-5 cursor-pointer shrink-0"
                                                            title="Marcar como respuesta correcta"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => actualizarOpcion(i, idx, e.target.value, opt)}
                                                            className={`w-full p-2.5 rounded-lg text-sm border focus:outline-none transition-colors ${opt === q.correct_answer
                                                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                                                                : 'bg-slate-900 border-slate-600 text-slate-300 hover:border-slate-400 focus:border-purple-500'
                                                                }`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Feedback editable */}
                                        <div className="ml-6 flex items-start gap-3">
                                            <span className="text-blue-400 font-bold text-sm mt-2.5 shrink-0">💡 Feedback IA:</span>
                                            <input
                                                type="text"
                                                value={q.feedback}
                                                onChange={(e) => actualizarPregunta(i, 'feedback', e.target.value)}
                                                className="w-full bg-slate-900 border border-transparent hover:border-slate-600 focus:border-purple-500 rounded-lg p-2.5 text-sm text-slate-300 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}