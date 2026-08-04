import { use } from "react";

export default function Table({ onDelete, data, onEdit, ocultar = [], onAction, actionLabel }) {

    // 1. Escudo de seguridad: Si no hay datos, mostramos un mensaje amigable
    if (!data || data.length === 0 || Object.keys(data[0]).length === 0) {
        return (
            <div className="w-full bg-slate-800 rounded-xl p-8 text-center border border-slate-700 text-slate-400">
                No hay registros disponibles.
            </div>
        )
    }

    // 2. Filtramos las cabeceras para NO mostrar contraseñas o IDs internos
    const headers = Object.keys(data[0]).filter(header => !ocultar.includes(header));

    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left text-slate-300 bg-slate-800 rounded-xl overflow-hidden shadow-lg">
                <thead className="bg-slate-900 text-emerald-400 text-xs uppercase font-semibold">
                    <tr key={0} className="border-b border-slate-700">
                        {headers.map((v, i) => (
                            <th key={i} className="p-4 tracking-wider whitespace-nowrap">{v}</th>
                        ))}
                        {(onDelete || onAction) && <th className="p-4 tracking-wider whitespace-nowrap text-center">Acciones</th>}
                    </tr>
                </thead>


                <tbody>
                    {data.map((fila, index) => {
                        return (
                            <tr
                                key={index}
                                onDoubleClick={() => onEdit(fila)}
                                className="border-b border-slate-700 hover:bg-slate-700/60 transition-colors cursor-pointer group"
                            >
                                {headers.map((dato, i) => (
                                    <td key={i} className="p-4 whitespace-nowrap">{fila[dato]}</td>
                                ))}

                                {/* Pintamos los botones dinámicamente */}
                                {(onDelete || onAction) && (
                                    <td className="p-4 flex gap-2 justify-center">
                                        {onAction && (
                                            <button
                                                onClick={() => onAction(fila)}
                                                className="bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg text-white font-semibold transition-colors shadow-sm opacity-90 group-hover:opacity-100"
                                            >
                                                {actionLabel || 'Acción'}
                                            </button>
                                        )}

                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(fila)}
                                                className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-white font-semibold transition-colors shadow-sm opacity-90 group-hover:opacity-100"
                                            >
                                                Eliminar
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}