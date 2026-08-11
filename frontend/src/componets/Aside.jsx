import React, { useState } from "react";
import { Outlet, Link, useLocation } from 'react-router-dom';
import ProfileMenu from './ProfileMenu.jsx';
import { jwtDecode } from 'jwt-decode';
import { ChartColumnStacked, School, Bot, BookCheck, Users, LayoutDashboard, Link2, Tag, UserStar, Shapes, Menu, X } from 'lucide-react';

// DICCIONARIO DE RUTAS
const MENU_LINKS = [
    {
        path: '/Dashboard',
        label: 'Dashboard',
        icon: <ChartColumnStacked />,
        rolesPermitidos: ['admin']
    },
    {
        path: '/PanelDocente',
        label: 'Mi Panel',
        icon: <LayoutDashboard />,
        rolesPermitidos: ['docente']
    },
    {
        path: '/PanelAlumno',
        label: 'Mis Clases',
        icon: <Shapes />,
        rolesPermitidos: ['alumno']
    },

    {
        path: '/Alumnos',
        label: 'Alumnos',
        icon: <UserStar />,
        rolesPermitidos: ['admin', 'coordinador']
    },
    {
        path: '/Personal',
        label: 'Personal',
        icon: <Users />,
        rolesPermitidos: ['admin']
    },
    {
        path: '/Asignaciones',
        label: 'Asignaciones',
        icon: <Link2 />,
        rolesPermitidos: ['admin'] // Solo el admin hace esto
    },
    {
        path: '/Grupos',
        label: 'Mis Grupos',
        icon: <School />,
        rolesPermitidos: ['docente'] // Solo el profesor debe ver y gestionar sus propios grupos
    },
    {
        path: '/Grupos-Asignacion',
        label: 'Grupos Asignacion',
        icon: <Tag />,
        rolesPermitidos: ['docente'] // Solo el profesor debe ver y gestionar sus propios grupos
    },
    {
        path: '/Quizzes',
        label: 'Mis Quizzes',
        icon: <BookCheck />,
        rolesPermitidos: ['docente']
    },
    {
        path: '/CalificacionesDocente',
        label: 'Calificaciones',
        icon: <ChartColumnStacked />,
        rolesPermitidos: ['docente']
    },
    {
        path: '/GeneradorIA',
        label: 'IA Generator ',
        icon: <Bot />,
        rolesPermitidos: ['docente']
    }, {
        path: '/MisTareas',
        label: 'Mis Tareas',
        icon: <BookCheck />,
        rolesPermitidos: ['alumno']
    },

    {
        path: '/MisCalificaciones',
        label: 'Mis Calificaciones',
        icon: <BookCheck />,
        rolesPermitidos: ['alumno']
    }
];

export default function Aside() {
    const token = localStorage.getItem('token');
    const location = useLocation();
    const [menuAbierto, setMenuAbierto] = useState(false);
    let usuarioRol = 'invitado';

    if (token) {
        try {
            const decoded = jwtDecode(token);
            usuarioRol = decoded.rol || 'invitado';
        } catch (error) {
            console.error("Error al decodificar token");
        }
    }

    const enlacesVisibles = MENU_LINKS.filter(link => link.rolesPermitidos.includes(usuarioRol));

    return (
        <div className="flex h-screen bg-slate-900 text-slate-200 font-playfair">

            {/* ========================================== */}
            {/* OVERLAY OSCURO (Solo visible en móvil cuando el menú está abierto) */}
            {/* ========================================== */}
            {menuAbierto && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden"
                    onClick={() => setMenuAbierto(false)}
                />
            )}

            {/* ========================================== */}
            {/* 1. MENÚ LATERAL IZQUIERDO (SIDEBAR) */}
            {/* ========================================== */}
            <aside className={`
                fixed md:static inset-y-0 left-0 w-64 bg-slate-800 flex flex-col 
                shadow-[4px_0_24px_rgba(0,0,0,0.2)] border-r border-slate-700 z-40
                transform transition-transform duration-300 ease-in-out
                ${menuAbierto ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            `}>
                <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-wider">
                        Quizz<span className="text-white">Hub</span>
                    </h2>
                    {/* Botón de cerrar (solo visible en móvil) */}
                    <button
                        onClick={() => setMenuAbierto(false)}
                        className="md:hidden text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {enlacesVisibles.map((link, index) => (
                        <Link
                            key={index}
                            to={link.path}
                            onClick={() => setMenuAbierto(false)}
                            className={`block px-4 py-3 rounded-xl transition-colors flex items-center gap-3 font-medium group
                                ${location.pathname === link.path
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                }`}
                        >
                            <span className={`text-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:text-blue-400
                                ${location.pathname === link.path ? 'text-blue-400' : ''}`}>
                                {link.icon}
                            </span>

                            {link.label}
                        </Link>
                    ))}

                    {enlacesVisibles.length === 0 && (
                        <p className="text-slate-500 text-sm px-4 text-center mt-10">No hay módulos disponibles.</p>
                    )}
                </nav>

                {/* Eliminamos el viejo botón rojo de Cerrar Sesión de aquí */}
            </aside>

            {/* ========================================== */}
            {/* 2. ÁREA PRINCIPAL DERECHA */}
            {/* ========================================== */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative z-10">

                {/* Barra Superior (Topbar) */}
                <header className="h-16 md:h-20 bg-slate-800/40 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-50">
                    {/* Botón hamburguesa (solo visible en móvil) */}
                    <button
                        onClick={() => setMenuAbierto(true)}
                        className="md:hidden text-slate-400 hover:text-white transition-colors p-2"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Logo móvil (solo visible en móvil) */}
                    <h2 className="md:hidden text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                        Quizz<span className="text-white">Hub</span>
                    </h2>

                    {/* Espaciador para desktop (empuja ProfileMenu a la derecha) */}
                    <div className="hidden md:block flex-1" />

                    <ProfileMenu />
                </header>

                {/* Contenido Dinámico (Las páginas reales de tu app) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <Outlet />
                </div>

            </main>

        </div>
    );
}