import logimg from '../assets/logo.png'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode';
import { EyeDashed, EyeClosed } from 'lucide-react'

import { AuthTable } from '../Peticiones/RutasPeticiones';

function LoginPage2() {

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setmensaje] = useState('');
  const [visible, setvisible] = useState(false);
  const navigate = useNavigate();

  const Submit = async (e) => {

    e.preventDefault()


    setmensaje('');
    setCorreo('')
    setPassword('')
    try {
      const respuesta = await fetch(AuthTable,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo: correo, password: password })

        });

      console.log(respuesta)

      const datos = await respuesta.json();

      if (!respuesta.ok) {

        throw new Error(datos.err || 'Error al intentar iniciar sesión');
      }

      localStorage.setItem('token', datos.token)


      const payload = jwtDecode(datos.token);
      const rolUsuario = payload.rol;

      if (rolUsuario === 'admin') {
        navigate('/Dashboard');
      } else if (rolUsuario === 'docente') {
        navigate('/PanelDocente');
      } else if (rolUsuario === 'alumno') {
        navigate('/PanelAlumno');
      } else {
        localStorage.removeItem('token');
        alert('Rol no reconocido');
      }





    } catch (err) {
      setmensaje(err.message)

    }
  }


  return (
    <>


      <div className="min-h-screen w-full flex justify-center items-center bg-zinc-700 p-2">

        <div className="flex max-w-6xl w-full min-h-150 rounded-4xl overflow-hidden p-2.5 border-2 border-zinc-600 bg-zinc-800 text-slate-200 shadow-2xl/70 ">

          <div className="relative flex justify-center items-center w-full md:w-1/2 rounded-2xl">

            <form onSubmit={Submit} className='flex flex-col gap-8 w-full max-w-87.5 p-2'>
              <div>{mensaje}</div>


              <h1 className="uppercase font-bold text-2xl mb-5">Sing in</h1>
              <div className="flex relative">
                <p className="absolute -top-2 left-2 bg-zinc-800 text-xs">E-mail</p>
                <input value={correo} onChange={(e) => setCorreo(e.target.value)} type="email" placeholder="Correo" className="w-full p-2 border rounded-sm" />
                <span className="absolute hidden">icon</span>

              </div>

              <div className="flex relative">
                <p className="absolute -top-2 left-2 bg-zinc-800 text-xs">Password</p>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type={`${visible ? 'text' : 'password'}`} placeholder="Contraseña" className="w-full p-2 border rounded-sm" />
                <span className="absolute top-2 right-3"><button onClick={() => setvisible(!visible)} type='button'>{visible ? <EyeClosed /> : <EyeDashed />}</button></span>

              </div>

              <button type='submit' className="w-full rounded-sm bg-linear-to-r from-slate-500 to-slate-700 p-2">Sing in </button>


            </form>


            <div className="absolute bottom-5">
              <p className="text-xs">no tienes cuenta? <a href="">crea una</a></p>


            </div>


          </div>

          <div className="hidden md:flex md:w-1/2 rounded-2xl  overflow-hidden bg-cyan-950 flex-col justify-center items-center">
            <img src={logimg} alt="" className='w-100' />




          </div>









        </div>





      </div>







    </>
  )
}

export default LoginPage2
