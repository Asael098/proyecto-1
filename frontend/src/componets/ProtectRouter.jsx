import { Navigate, Outlet } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

export const ProteccionRuta = ({ UsuariosPermitidos }) => {
    const token = localStorage.getItem('token')

    if (!token) {
        console.log('no tienes token')
        return <Navigate to='/login' replace />

    }

    try {
        const payload = jwtDecode(token)

        let { rol } = payload;

        if (payload.exp < Date.now() / 1000) {

            console.log('token caducado')
            localStorage.removeItem('token')
            return <Navigate to='/login' replace />
        }

        if (UsuariosPermitidos.includes(rol)) {
            return <Outlet />

        } else {
            console.log('No tienes acceso')

            return <Navigate to='/login' replace />
        }

    } catch (error) {
        return <Navigate to='login' replace />

    }

}