import React from "react";
import { Outlet, Link } from 'react-router-dom';
import ProfileMenu from './ProfileMenu.jsx'; // 1. Tu nuevo menú inteligente
import { jwtDecode } from 'jwt-decode';

// DICCIONARIO DE RUTAS
const MENU_LINKS = [
    {
        path: '/Dashboard',
        label: 'Dashboard',
        icon: '📊',
        rolesPermitidos: ['admin']
    },
    {
        path: '/PanelDocente',
        label: 'Mi Panel',
        icon: '👨‍🏫',
        rolesPermitidos: ['docente']
    },
    {
        path: '/PanelAlumno',
        label: 'Mis Clases',
        icon: '🎓',
        rolesPermitidos: ['alumno']
    },

    {
        path: '/Alumnos',
        label: 'Alumnos',
        icon: '📚',
        rolesPermitidos: ['admin', 'coordinador']
    },
    {
        path: '/Personal',
        label: 'Personal',
        icon: '👥',
        rolesPermitidos: ['admin']
    },
    {
        path: '/Asignaciones',
        label: 'Asignaciones',
        icon: '🔗',
        rolesPermitidos: ['admin'] // Solo el admin hace esto
    },
    {
        path: '/Grupos',
        label: 'Mis Grupos',
        icon: '🏫',
        rolesPermitidos: ['docente'] // Solo el profesor debe ver y gestionar sus propios grupos
    },
    {
        path: '/Grupos-Asignacion',
        label: 'Grupos Asignacion',
        icon: '🏷️',
        rolesPermitidos: ['docente'] // Solo el profesor debe ver y gestionar sus propios grupos
    },
    {
        path: '/Quizzes',
        label: 'Mis Quizzes',
        icon: '📝',
        rolesPermitidos: ['docente']
    },
    {
        path: '/CalificacionesDocente',
        label: 'Calificaciones',
        icon: '📊',
        rolesPermitidos: ['docente']
    },
    {
        path: '/GeneradorIA',
        label: 'IA Generator ✨',
        icon: '🤖',
        rolesPermitidos: ['docente']
    },

    {
        path: '/MisCalificaciones',
        label: 'Mis Calificaciones',
        icon: '📝',
        rolesPermitidos: ['alumno']
    }
];

export default function Aside() {
    const token = localStorage.getItem('token');
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
        <div className="flex h-screen bg-slate-900 text-slate-200">

            {/* ========================================== */}
            {/* 1. MENÚ LATERAL IZQUIERDO (SIDEBAR) */}
            {/* ========================================== */}
            <aside className="w-64 bg-slate-800 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.2)] border-r border-slate-700 z-20 ">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-wider">
                        Quizz<span className="text-white">Hub</span>
                    </h2>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {enlacesVisibles.map((link, index) => (
                        <Link
                            key={index}
                            to={link.path}
                            className="block px-4 py-3 rounded-xl hover:bg-slate-700/50 transition-colors flex items-center gap-3 font-medium text-slate-300 hover:text-white"
                        >
                            <span className="text-xl">{link.icon}</span>
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

                {/* NUEVO: Barra Superior (Topbar) */}
                <header className="h-20 bg-slate-800/40 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-end px-8 shrink-0 shadow-sm">
                    {/* 2. Aquí inyectamos el Avatar y el menú desplegable */}
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