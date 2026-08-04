import React from "react";
import { Boton } from "./Elements.jsx";

export default function Formulario({ children, onSubmit, editar, onCancel, cargando }) { // <-- Añadimos 'cargando'

    if (editar) {
        return (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                {children}
                <div className="flex gap-3 mt-2">
                    <Boton
                        contenido={cargando ? 'Guardando...' : 'Actualizar'}
                        type='submit'
                        editar
                        disabled={cargando} // <-- Bloqueamos el botón
                    />
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={cargando}
                        className="w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        )
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {children}
            <div className="mt-2">
                <Boton
                    contenido={cargando ? 'Procesando...' : 'Guardar Registro'}
                    type='submit'
                    disabled={cargando} // <-- Bloqueamos el botón
                />
            </div>
        </form>
    )
}