import React, { useState, useEffect } from 'react';
import { Select, Boton } from '../componets/Elements.jsx';
import { successAlert } from '../componets/Alerts.jsx';
// Importamos las rutas. (Agregaremos MisAlumnosTable y AsignacionGrupoTable a tu archivo de peticiones después)
import { GruposTable, MisAlumnosTable, AsignacionGrupoTable } from '../Peticiones/RutasPeticiones.js';
import { CheckListAlumnos } from '../componets/CheckListAlumnos.jsx';

export default function AsignacionGrupoPage() {
    // Estados para guardar la información de la base de datos
    const [grupos, setGrupos] = useState([]);
    const [misAlumnos, setMisAlumnos] = useState([]);

    // Estados para la interacción del usuario
    const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
    const [alumnosAsignados, setAlumnosAsignados] = useState([]);
    const [cargando, setCargando] = useState(false); // Nuestro escudo contra doble clic

    const token = localStorage.getItem('token');

    // ==========================================
    // 1. CARGAR DATOS INICIALES (Mis Grupos y Mis Alumnos)
    // ==========================================
    useEffect(() => {
        const cargarDatosDocente = async () => {
            try {
                // Pedimos los grupos del profesor y los alumnos que tiene asignados
                const [resGrupos, resAlumnos] = await Promise.all([
                    fetch(GruposTable, { headers: { 'Authorization': token } }),
                    fetch(MisAlumnosTable, { headers: { 'Authorization': token } })
                ]);

                const dataGrupos = await resGrupos.json();
                const dataAlumnos = await resAlumnos.json();

                // Formateamos los grupos para que el componente <Select /> los entienda
                const opcionesGrupos = dataGrupos.map(g => ({
                    valor: g.id_grupo,
                    texto: `${g.nombre} (${g.idioma})`
                }));

                setGrupos(opcionesGrupos);
                setMisAlumnos(dataAlumnos);
            } catch (error) {
                console.error("Error al cargar los catálogos del docente:", error);
            }
        };

        cargarDatosDocente();
    }, []);

    // ==========================================
    // 2. CUANDO SE SELECCIONA UN GRUPO
    // ==========================================
    const manejarCambioGrupo = async (e) => {
        const idGrupo = e.target.value;
        setGrupoSeleccionado(idGrupo);

        // Consultamos qué alumnos ya están en este grupo para marcar las casillas
        try {
            const peticion = await fetch(`${AsignacionGrupoTable}/${idGrupo}`, {
                headers: { 'Authorization': token }
            });
            const data = await peticion.json();

            // Asumiendo que el backend nos regresará un arreglo plano: [12, 14, 20]
            setAlumnosAsignados(data.alumnos_ids || []);
        } catch (error) {
            console.error("Error al traer asignaciones previas del grupo", error);
            setAlumnosAsignados([]);
        }
    };

    // ==========================================
    // 3. MARCAR / DESMARCAR UN ALUMNO (Checkbox)
    // ==========================================
    const hacerToggleAlumno = (idAlumno) => {
        setAlumnosAsignados(previos => {
            if (previos.includes(idAlumno)) {
                return previos.filter(id => id !== idAlumno); // Lo quitamos
            } else {
                return [...previos, idAlumno]; // Lo agregamos
            }
        });
    };

    // ==========================================
    // 4. GUARDAR ASIGNACIÓN EN LA BASE DE DATOS
    // ==========================================
    const guardarAsignacion = async () => {
        if (!grupoSeleccionado || cargando) return;

        setCargando(true); // Activamos el escudo

        // Armamos el paquete que espera el backend
        const payload = {
            id_grupo: grupoSeleccionado,
            alumnos: alumnosAsignados
        };

        try {
            const peticion = await fetch(AsignacionGrupoTable, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(payload)
            });

            if (peticion.ok) {
                successAlert("Lista de alumnos actualizada correctamente");
            }
        } catch (error) {
            console.error("Error al guardar la asignación del grupo", error);
        } finally {
            setCargando(false); // Desactivamos el escudo
        }
    };

    // ==========================================
    // RENDERIZADO VISUAL
    // ==========================================
    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sans text-slate-200">

            {/* Encabezado */}
            <div className="mb-8 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-white tracking-wide">Inscripción a Grupos</h1>
                <p className="text-slate-400 mt-2">Asigna tus alumnos a los grupos que has creado.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* PANEL IZQUIERDO: Selección de Grupo */}
                <div className="w-full lg:w-1/3 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700 h-fit sticky top-8">
                    <h2 className="text-xl font-semibold text-emerald-400 mb-4">1. Seleccionar Grupo</h2>
                    <p className="text-sm text-slate-400 mb-4">Elige el grupo que deseas administrar.</p>

                    <Select
                        name="grupo"
                        placeholder="-- Elige un Grupo --"
                        opciones={grupos}
                        onChange={manejarCambioGrupo}
                    />

                    {/* Botón de Guardar (Aparece solo si hay un grupo seleccionado) */}
                    {grupoSeleccionado && (
                        <div className="mt-8 border-t border-slate-700 pt-6">
                            <button
                                onClick={guardarAsignacion}
                                disabled={cargando}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cargando ? 'Guardando...' : 'Guardar Lista de Alumnos'}
                            </button>
                        </div>
                    )}
                </div>

                {/* PANEL DERECHO: Lista de Mis Alumnos con Checkboxes */}
                <div className="w-full lg:w-2/3 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-white">2. Seleccionar Estudiantes</h2>
                        <span className="bg-blue-500/20 text-blue-400 py-1 px-3 rounded-full text-sm font-medium border border-blue-500/30">
                            Inscritos: {alumnosAsignados.length}
                        </span>
                    </div>

                    {!grupoSeleccionado ? (
                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                            <span className="text-4xl block mb-2">📚</span>
                            Selecciona un grupo en el panel izquierdo para ver tu lista de alumnos.
                        </div>
                    ) : misAlumnos.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                            <span className="text-4xl block mb-2">🤷‍♂️</span>
                            Aún no tienes alumnos asignados. Pide a un administrador que te asigne estudiantes.
                        </div>
                    ) : (
                        // 2. REEMPLAZA TODO EL MAPEO GIGANTE CON ESTO:
                        <CheckListAlumnos
                            alumnos={misAlumnos}
                            alumnosAsignados={alumnosAsignados}
                            onToggle={hacerToggleAlumno}
                        />
                    )}
                </div>

            </div>
        </div>
    )
}