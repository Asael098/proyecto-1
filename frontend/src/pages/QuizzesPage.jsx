import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../componets/Table.jsx';
import Form from '../componets/Form.jsx';
import { Input, Select } from '../componets/Elements.jsx';
import { DeleteAlert, successAlert } from '../componets/Alerts.jsx';
// IMPORTANTE: Asegúrate de agregar QuizzesTable a tu archivo de RutasPeticiones.js
import { QuizzesTable } from '../Peticiones/RutasPeticiones.js';

export default function QuizzesPage() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [editar, setEditar] = useState(null);
    const [cargando, setCargando] = useState(false);
    const token = localStorage.getItem('token');

    // ==========================================
    // GET: Cargar Mis Quizzes
    // ==========================================
    const CargarQuizzes = async () => {
        try {
            const peticion = await fetch(QuizzesTable, {
                headers: { 'Authorization': token }
            });
            const res = await peticion.json();
            setData(res);
        } catch (error) {
            console.error("Error al cargar los quizzes", error);
        }
    };

    useEffect(() => {
        CargarQuizzes();
    }, []);

    // ==========================================
    // POST: Crear nuevo Quiz (Cabecera)
    // ==========================================
    const agregar = async (e) => {
        e.preventDefault();
        if (cargando) return;
        setCargando(true);

        const formData = new FormData(e.target);
        const registro = Object.fromEntries(formData);

        try {
            const peticion = await fetch(QuizzesTable, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(registro)
            });

            if (peticion.ok) {
                successAlert('Configuración del Quiz creada exitosamente');
                CargarQuizzes();
                e.target.reset();
            }
        } catch (error) {
            console.error("Error al crear", error);
        } finally {
            setCargando(false);
        }
    };

    // ==========================================
    // PUT: Actualizar Quiz
    // ==========================================
    const Actualizar = async (e) => {
        e.preventDefault();
        if (cargando) return;
        setCargando(true);

        const formData = new FormData(e.target);
        const registro = Object.fromEntries(formData);
        const id = editar.id_quizz;

        try {
            const peticion = await fetch(`${QuizzesTable}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(registro)
            });

            if (peticion.ok) {
                successAlert('Configuración actualizada');
                CargarQuizzes();
                setEditar(null);
            }
        } catch (error) {
            console.error("Error al actualizar", error);
        } finally {
            setCargando(false);
        }
    };

    // ==========================================
    // DELETE: Eliminar Quiz (y sus preguntas en cascada)
    // ==========================================
    const Eliminar = (registro) => {
        const id = registro.id_quizz;

        DeleteAlert().then(async (res) => {
            if (res.isConfirmed) {
                try {
                    await fetch(`${QuizzesTable}/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': token }
                    });

                    const newData = data.filter(v => v.id_quizz !== id);
                    setData(newData);
                    successAlert('Quiz eliminado correctamente');
                } catch (error) {
                    console.error("Error al eliminar", error);
                }
            }
        });
    };

    const prepararEdicion = (registro) => {
        setEditar({ ...registro, stamp: Date.now() });
    };

    // ==========================================
    // RENDERIZADO VISUAL
    // ==========================================
    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sans text-slate-200">
            <div className="mb-8 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-white tracking-wide">Gestor de Evaluaciones</h1>
                <p className="text-slate-400 mt-2">Crea y configura la estructura básica de tus Quizzes.</p>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 items-start">

                {/* PANEL IZQUIERDO: Formulario de Configuración */}
                <div className="w-full xl:w-1/3 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700 sticky top-8">
                    <h2 className="text-xl font-semibold text-emerald-400 mb-6 border-b border-slate-700 pb-4">
                        {editar ? '✏️ Editando Configuración' : '➕ Nuevo Quiz'}
                    </h2>

                    <Form
                        onSubmit={editar ? Actualizar : agregar}
                        editar={editar}
                        onCancel={() => setEditar(null)}
                        cargando={cargando}
                        key={editar ? editar.stamp : 'nuevo'}
                    >
                        <div className="space-y-4 mb-6">
                            <Input placeholder='Nombre del Quiz (Ej. Examen Parcial 1)' type='text' name='nombre' defaultValue={editar?.nombre || ''} />

                            <Select
                                name='tipo'
                                placeholder='Tipo de Evaluación'
                                defaultValue={editar?.tipo || ''}
                                opciones={[
                                    { valor: 'Práctica', texto: 'Práctica Libre' },
                                    { valor: 'Diagnóstico', texto: 'Examen Diagnóstico' },
                                    { valor: 'Examen Final', texto: 'Examen Final' }
                                ]}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <Select
                                    name='idioma'
                                    placeholder='Idioma'
                                    defaultValue={editar?.idioma || ''}
                                    opciones={[
                                        { valor: 'Inglés', texto: 'Inglés' },
                                        { valor: 'Francés', texto: 'Francés' }
                                    ]}
                                />
                                <Select
                                    name='nivel'
                                    placeholder='Nivel'
                                    defaultValue={editar?.nivel || ''}
                                    opciones={[
                                        { valor: 'A1', texto: 'A1 (Básico)' },
                                        { valor: 'A2', texto: 'A2' },
                                        { valor: 'B1', texto: 'B1 (Intermedio)' },
                                        { valor: 'B2', texto: 'B2' },
                                        { valor: 'C1', texto: 'C1 (Avanzado)' }
                                    ]}
                                />
                            </div>

                            <Select
                                name='habilidad'
                                placeholder='Habilidad a evaluar'
                                defaultValue={editar?.habilidad || ''}
                                opciones={[
                                    { valor: 'Grammar', texto: 'Gramática (Grammar)' },
                                    { valor: 'Listening', texto: 'Comprensión Auditiva (Listening)' },
                                    { valor: 'Reading', texto: 'Comprensión Lectora (Reading)' },
                                    { valor: 'Vocabulary', texto: 'Vocabulario' },
                                    { valor: 'Mixed', texto: 'Mixto (Varias Habilidades)' }
                                ]}
                            />

                            <Input placeholder='Tema Específico (Ej. Verb To Be, Passé Composé)' type='text' name='tema' defaultValue={editar?.tema || ''} />

                            {/* Reutilizamos las clases del Input para un Textarea de instrucciones */}
                            <textarea
                                name="instrucciones"
                                placeholder="Instrucciones generales para los alumnos..."
                                defaultValue={editar?.instrucciones || ''}
                                required
                                rows="3"
                                className="border border-slate-600 bg-slate-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full resize-none"
                            ></textarea>

                            {/* Oculto, pero útil para saber si ya lo publicamos o no */}
                            <input type="hidden" name="status" value={editar?.status || 'Borrador'} />
                        </div>
                    </Form>
                </div>

                {/* PANEL DERECHO: Directorio y Acciones */}
                <div className="w-full xl:w-2/3 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700">
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white">Directorio de Quizzes</h2>
                        <span className="bg-emerald-500/20 text-emerald-400 py-1 px-3 rounded-full text-sm font-medium border border-emerald-500/30">
                            Total: {data.length}
                        </span>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-700 shadow-inner">
                        {/* Ocultamos campos muy largos o técnicos para que la tabla 
                            se vea limpia y fácil de leer.
                        */}
                        <Table
                            onDelete={Eliminar}
                            data={data}
                            onEdit={prepararEdicion}
                            ocultar={['id_quizz', 'id_personal', 'instrucciones', 'status']}
                            onAction={(fila) => navigate(`/ConstructorQuiz/${fila.id_quizz}`)} /* <-- El redireccionamiento */
                            actionLabel="⚙️ Preguntas" /* <-- El texto del botón */
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}