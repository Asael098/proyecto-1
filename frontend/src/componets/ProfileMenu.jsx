import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [userData, setUserData] = useState({ nombre: 'Usuario', rol: 'Invitado', inicial: 'U' });

    const menuRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Obtenemos el token guardado en el login
        const token = localStorage.getItem('token');

        if (token) {
            try {
                // 2. Decodificamos el payload del JWT
                const payloadBase64 = token.split('.')[1];
                const payload = JSON.parse(atob(payloadBase64));

                // Ajusta estas variables dependiendo de cómo se llamen en tu backend
                // Si guardaste el nombre en localStorage en vez del token, puedes usar localStorage.getItem('nombre')
                const nombreUsuario = payload.nombre || 'Usuario';
                console.log(nombreUsuario)
                const rolUsuario = payload.rol || 'Rol';

                setUserData({
                    nombre: nombreUsuario,
                    rol: rolUsuario,
                    inicial: nombreUsuario.charAt(0).toUpperCase()
                });
            } catch (error) {
                console.error("Error al leer la información del usuario", error);
            }
        }

        // 3. Lógica para cerrar el menú si el usuario hace clic afuera de él
        const handleClickFuera = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickFuera);
        return () => document.removeEventListener("mousedown", handleClickFuera);
    }, []);

    // ==========================================
    // FUNCIÓN PARA CERRAR SESIÓN
    // ==========================================
    const cerrarSesion = () => {
        // 1. Limpiamos toda la memoria de la sesión
        localStorage.removeItem('token');
        // Si guardaste otras cosas (ej. localStorage.removeItem('id_usuario')), bórralas aquí

        // 2. Redirigimos al Login (Asegúrate de que '/' sea tu ruta del login)
        navigate('/login');
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* EL CÍRCULO (AVATAR) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg hover:shadow-blue-500/50 transition-all focus:outline-none ring-2 ring-slate-700 hover:ring-blue-400"
                title="Menú de perfil"
            >
                {userData.inicial}
            </button>

            {/* EL MENÚ DESPLEGABLE */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-slate-800 rounded-xl shadow-2xl border border-slate-600 overflow-hidden z-50 animate-fade-in">

                    {/* Cabecera del Menú */}
                    <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                        <p className="text-sm font-bold text-white truncate">{userData.nombre}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">
                            Perfil: {userData.rol}
                        </p>
                    </div>

                    {/* Opciones del Menú */}
                    <div className="p-2">
                        <button
                            onClick={cerrarSesion}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 font-bold rounded-lg hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3"
                        >
                            <span className="text-lg">🚪</span> Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}