

export const Input = (props) => {
    return (
        <input
            className="border border-slate-600 bg-slate-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full"
            placeholder={props.placeholder}
            type={props.type}
            name={props.name}
            defaultValue={props.defaultValue}
            minLength={props.length}
            required
        />
    )
}

export const Boton = (props) => {
    // Definimos los colores dependiendo de si es el botón de Editar o el de Crear
    const coloresDinamicos = props.editar
        ? 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500' // Verde oscuro para editar
        : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500';       // Azul vibrante para crear

    return (
        <button
            type={props.type}
            disabled={props.disabled}
            className={`w-full text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${coloresDinamicos}`}
        >
            {props.contenido}
        </button>
    )
}

// En Elements.jsx
export const Select = (props) => {
    return (
        <select
            name={props.name}
            defaultValue={props.defaultValue !== undefined ? props.defaultValue : ""}
            onChange={props.onChange} /* <--- ¡ESTA LÍNEA ES LA QUE TE FALTA! */
            required
            className="border border-slate-600 bg-slate-700 text-white p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full transition-all"
        >
            <option value="" disabled>{props.placeholder || 'Selecciona una opción'}</option>
            {props.opciones.map((opcion, index) => (
                <option key={index} value={opcion.valor}>{opcion.texto}</option>
            ))}
        </select>
    )
}