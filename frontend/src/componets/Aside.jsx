import React from "react";
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importamos para leer el rol

// 1. DICCIONARIO DE RUTAS
// Aquí defines todas las rutas de tu sistema y quién puede verlas
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
    const navigate = useNavigate();

    // 2. OBTENER EL ROL DEL USUARIO
    // Extraemos el token del localStorage y lo decodificamos
    const token = localStorage.getItem('token');
    let rolUsuario = '';

    if (token) {
        try {
            const decodificado = jwtDecode(token);
            rolUsuario = decodificado.rol; // Ojo: asegúrate de que tu backend mande el rol bajo esta propiedad
        } catch (error) {
            console.error("Token inválido");
        }
    }

    // 3. FILTRAR LOS ENLACES
    // Solo nos quedamos con los enlaces donde el arreglo de rolesPermitidos incluya el rol del usuario actual
    const enlacesVisibles = MENU_LINKS.filter(link =>
        link.rolesPermitidos.includes(rolUsuario)
    );

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans w-full">

            {/* El Sidebar Dinámico */}
            <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl">
                <div className="p-6 text-center text-2xl font-bold border-b border-slate-700">
                    Quizz Hub
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">

                    {/* 4. RENDERIZAR LOS ENLACES DINÁMICAMENTE */}
                    {enlacesVisibles.map((link, index) => (
                        <Link
                            key={index}
                            to={link.path}
                            className="block px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                            <span>{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}

                    {/* Mensaje por si un rol no tiene rutas asignadas */}
                    {enlacesVisibles.length === 0 && (
                        <p className="text-slate-400 text-sm px-4">No hay módulos disponibles.</p>
                    )}

                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={cerrarSesion}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Dinámico a la derecha */}
            <main className="flex-1 overflow-y-auto w-full">
                <Outlet />
            </main>

        </div>
    );
}