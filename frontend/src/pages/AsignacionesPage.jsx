import React, { useState, useEffect } from 'react';
import { Select, Boton } from '../componets/Elements.jsx';
import { successAlert } from '../componets/Alerts.jsx';
// Importa tus rutas. Asegúrate de crear "AsignacionesTable" en tu archivo de peticiones
import { PersonalTable, AlumnosTable, AsignacionesTable } from '../Peticiones/RutasPeticiones.js';
import { CheckListAlumnos } from '../componets/CheckListAlumnos.jsx';

export default function AsignacionesPage() {
    const [docentes, setDocentes] = useState([]);
    const [alumnos, setAlumnos] = useState([]);

    // El profesor que el administrador seleccionó en el menú desplegable
    const [docenteSeleccionado, setDocenteSeleccionado] = useState('');

    // Arreglo que guardará los IDs de los alumnos marcados (Ej: [2, 5, 8])
    const [alumnosAsignados, setAlumnosAsignados] = useState([]);

    const token = localStorage.getItem('token');

    // ==========================================
    // 1. CARGAR DATOS INICIALES (Docentes y Alumnos)
    // ==========================================
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // Pedimos el personal y los alumnos al mismo tiempo
                const [resPersonal, resAlumnos] = await Promise.all([
                    fetch(PersonalTable, { headers: { 'Authorization': token } }),
                    fetch(AlumnosTable, { headers: { 'Authorization': token } })
                ]);

                const dataPersonal = await resPersonal.json();
                const dataAlumnos = await resAlumnos.json();

                // Filtramos para que en el Select solo aparezcan los docentes
                const soloDocentes = dataPersonal.filter(p => p.rol === 'docente');

                // Mapeamos los docentes para que el <Select /> los entienda
                const opcionesDocentes = soloDocentes.map(d => ({
                    valor: d.id_personal,
                    texto: `${d.nombre} ${d.apellido_p} ${d.apellido_m}`
                }));

                setDocentes(opcionesDocentes);
                setAlumnos(dataAlumnos);
            } catch (error) {
                console.error("Error al cargar los catálogos:", error);
            }
        };

        cargarDatos();
    }, []);

    // ==========================================
    // 2. CUANDO SE SELECCIONA UN DOCENTE
    // ==========================================
    const manejarCambioDocente = async (e) => {
        const idDocente = e.target.value;
        setDocenteSeleccionado(idDocente);

        // Aquí deberías hacer un fetch a tu base de datos para traer los alumnos 
        // que YA tiene asignados este profesor, para que los checkboxes aparezcan marcados.
        try {
            const peticion = await fetch(`${AsignacionesTable}/${idDocente}`, {
                headers: { 'Authorization': token }
            });
            const data = await peticion.json();

            // Asumiendo que el backend te regresa un arreglo de IDs: [1, 4, 7]
            setAlumnosAsignados(data.alumnos_ids || []);
        } catch (error) {
            console.error("Error al traer asignaciones previas", error);
            setAlumnosAsignados([]); // Si hay error o no tiene, empezamos en blanco
        }
    };

    // ==========================================
    // 3. MARCAR / DESMARCAR UN ALUMNO (Checkbox)
    // ==========================================
    const hacerToggleAlumno = (idAlumno) => {
        setAlumnosAsignados(previos => {
            // Si el alumno ya estaba en el arreglo, lo quitamos
            if (previos.includes(idAlumno)) {
                return previos.filter(id => id !== idAlumno);
            }
            // Si no estaba, lo agregamos
            else {
                return [...previos, idAlumno];
            }
        });
    };

    // ==========================================
    // 4. GUARDAR ASIGNACIÓN EN LA BASE DE DATOS
    // ==========================================
    const guardarAsignacion = async () => {
        if (!docenteSeleccionado) return;

        // Armamos el paquete de datos para tu backend
        const payload = {
            id_personal: docenteSeleccionado,
            alumnos: alumnosAsignados // Mandamos el arreglo completo de IDs
        };

        try {
            const peticion = await fetch(AsignacionesTable, {
                method: 'POST', // O 'PUT', dependiendo de tu backend
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(payload)
            });

            if (peticion.ok) {
                successAlert("Alumnos asignados correctamente");
            }
        } catch (error) {
            console.error("Error al guardar asignaciones", error);
        }
    };

    // ==========================================
    // RENDERIZADO VISUAL
    // ==========================================
    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sanspro text-slate-200">

            {/* Encabezado */}
            <div className="mb-8 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-white tracking-wide">Distribución de Grupos</h1>
                <p className="text-slate-400 mt-2">Asigna múltiples estudiantes a un profesor de forma rápida.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* PANEL IZQUIERDO: Selección de Docente */}
                <div className="w-full lg:w-1/3 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700 h-fit sticky top-8">
                    <h2 className="text-xl font-semibold text-emerald-400 mb-4">1. Seleccionar Docente</h2>
                    <p className="text-sm text-slate-400 mb-4">Elige al profesor al que deseas asignarle estudiantes.</p>

                    <Select
                        name="docente"
                        placeholder="-- Elige un Profesor --"
                        opciones={docentes}
                        onChange={manejarCambioDocente}
                    />

                    {/* Botón de Guardar (Solo aparece si hay un docente seleccionado) */}
                    {docenteSeleccionado && (
                        <div className="mt-8 border-t border-slate-700 pt-6">
                            <button
                                onClick={guardarAsignacion}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                            >
                                Guardar Asignaciones
                            </button>
                        </div>
                    )}
                </div>

                {/* PANEL DERECHO: Lista de Alumnos con Checkboxes */}
                <div className="w-full lg:w-2/3 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-white">2. Seleccionar Alumnos</h2>
                        <span className="bg-blue-500/20 text-blue-400 py-1 px-3 rounded-full text-sm font-medium border border-blue-500/30">
                            Seleccionados: {alumnosAsignados.length}
                        </span>
                    </div>

                    {!docenteSeleccionado ? (
                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                            <span className="text-4xl block mb-2">👨‍🏫</span>
                            Selecciona un docente en el panel izquierdo para ver la lista.
                        </div>
                    ) : (
                        // 2. REEMPLAZA TODO EL MAPEO CON UNA SOLA LÍNEA MAGISTRAL:
                        <CheckListAlumnos
                            alumnos={alumnos}
                            alumnosAsignados={alumnosAsignados}
                            onToggle={hacerToggleAlumno}
                        />
                    )}
                </div>

            </div>
        </div>
    )
}