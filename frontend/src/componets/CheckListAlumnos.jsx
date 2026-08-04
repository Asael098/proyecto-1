import React from 'react';

export const CheckListAlumnos = ({ alumnos, alumnosAsignados, onToggle }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {alumnos.map((alumno) => {
                const estaMarcado = alumnosAsignados.includes(alumno.id_alumno);

                return (
                    <label
                        key={alumno.id_alumno}
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${estaMarcado
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                                : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <input
                            type="checkbox"
                            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                            checked={estaMarcado}
                            onChange={() => onToggle(alumno.id_alumno)}
                        />
                        <div>
                            <p className="font-medium">{alumno.nombre} {alumno.apellido_p}</p>
                            <p className="text-xs opacity-70">{alumno.correo}</p>
                        </div>
                    </label>
                )
            })}
        </div>
    );
};