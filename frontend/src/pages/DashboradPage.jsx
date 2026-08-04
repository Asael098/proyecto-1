import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Select } from '../componets/Elements.jsx';
import { EstadisticasTable } from '../Peticiones/RutasPeticiones.js'; // Lo agregaremos en el paso 4

export default function DashboardAdminPage() {
    const token = localStorage.getItem('token');

    const [cargando, setCargando] = useState(true);
    const [barrasGrupos, setBarrasGrupos] = useState([]);
    const [datosMaestros, setDatosMaestros] = useState([]);

    // Estados para la gráfica de pastel dinámica
    const [maestrosDisponibles, setMaestrosDisponibles] = useState([]);
    const [maestroSeleccionado, setMaestroSeleccionado] = useState('');
    const [datosPastel, setDatosPastel] = useState([]);

    const COLORES_PASTEL = ['#10b981', '#f59e0b', '#ef4444']; // Esmeralda, Ambar, Rojo

    useEffect(() => {
        const cargarEstadisticas = async () => {
            try {
                const peticion = await fetch(EstadisticasTable, { headers: { 'Authorization': token } });
                const res = await peticion.json();

                setBarrasGrupos(res.barrasGrupos);
                setDatosMaestros(res.datosMaestros);

                // Sacamos la lista de maestros únicos para llenar el <Select>
                const unicos = [];
                const map = new Map();
                res.datosMaestros.forEach(item => {
                    if (!map.has(item.id_personal)) {
                        map.set(item.id_personal, true);
                        unicos.push({ valor: item.id_personal, texto: item.maestro });
                    }
                });

                setMaestrosDisponibles(unicos);
                if (unicos.length > 0) setMaestroSeleccionado(unicos[0].valor);

            } catch (error) {
                console.error("Error al cargar estadísticas", error);
            } finally {
                setCargando(false);
            }
        };
        cargarEstadisticas();
    }, [token]);

    // Recalcular el pastel cada vez que el admin cambia de maestro
    useEffect(() => {
        if (!maestroSeleccionado) return;

        const calificacionesDelMaestro = datosMaestros.filter(d => d.id_personal === Number(maestroSeleccionado));

        let excelentes = 0; // 90-100
        let regulares = 0;  // 70-89
        let reprobados = 0; // < 70

        calificacionesDelMaestro.forEach(c => {
            if (c.puntaje >= 90) excelentes++;
            else if (c.puntaje >= 70) regulares++;
            else reprobados++;
        });

        // Solo actualizamos si hay datos para evitar gráficas vacías
        if (excelentes > 0 || regulares > 0 || reprobados > 0) {
            setDatosPastel([
                { name: 'Excelente (90-100)', value: excelentes },
                { name: 'Regular (70-89)', value: regulares },
                { name: 'Reprobados (<70)', value: reprobados }
            ]);
        } else {
            setDatosPastel([]);
        }

    }, [maestroSeleccionado, datosMaestros]);

    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-8 w-full font-sans text-slate-200">
            <div className="mb-8 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-white tracking-wide">Dashboard Analítico</h1>
                <p className="text-slate-400 mt-2">Métricas de rendimiento global de la institución.</p>
            </div>

            {cargando ? (
                <div className="text-center py-20 text-slate-500 text-xl">Generando métricas...</div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* GRÁFICA DE BARRAS: Promedio por Grupo */}
                    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
                        <h2 className="text-xl font-semibold text-white mb-6">Desempeño por Grupo (Promedio)</h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barrasGrupos} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                                    <Tooltip
                                        cursor={{ fill: '#334155' }}
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }}
                                    />
                                    <Bar dataKey="promedio" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Promedio General" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* GRÁFICA DE PASTEL: Filtro por Maestro */}
                    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                            <h2 className="text-xl font-semibold text-white shrink-0">Rendimiento por Maestro</h2>
                            <div className="w-full sm:w-64">
                                <Select
                                    name="maestro"
                                    placeholder="Filtro de Maestro"
                                    opciones={maestrosDisponibles}
                                    value={maestroSeleccionado}
                                    onChange={(e) => setMaestroSeleccionado(e.target.value)}
                                />
                            </div>
                        </div>

                        {datosPastel.length === 0 ? (
                            <div className="h-80 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                                Este maestro aún no tiene alumnos evaluados.
                            </div>
                        ) : (
                            <div className="h-80 w-full flex justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={datosPastel}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
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
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}