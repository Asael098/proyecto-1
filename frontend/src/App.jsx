import { Route, Routes, Navigate } from "react-router-dom"

import LoginPage from './pages/LoginPage';
import DashboradPage from "./pages/DashboradPage";
import AlumnosPage from "./pages/AlumnosPage";
import PersonalPage from "./pages/PersonalPage";
import PanelDocente from "./pages/PanelDocentePage";
import AsignacionesPage from "./pages/AsignacionesPage";
import GruposPage from "./pages/GruposPage";
import AsignacionGrupoPage from "./pages/AsignacionGrupoPage";
import QuizzesPage from "./pages/QuizzesPage";
import ConstructorQuizPage from "./pages/ConstructorQuizPage";
import PanelAlumnoPage from "./pages/PanelAlumnoPage";
import ResolverExamenPage from "./pages/ResolverExamenPage";
import CalificacionesAlumnoPage from "./pages/CalificacionesAlumnoPage";
import CalificacionesDocentePage from "./pages/CalificacionesDocentePage";
import GeneradorIAPage from "./pages/GeneradorIAPage";
import { useState } from "react";
import { jwtDecode } from 'jwt-decode'
import { ProteccionRuta } from './componets/ProtectRouter'
import Aside from "./componets/Aside";

function App() {


  return (

    <Routes>

      {/* Redirección por defecto a /login si entran a la raíz de la página */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Aside />}>

        <Route element={<ProteccionRuta UsuariosPermitidos={'docente'} />}>
          <Route path='/PanelDocente' element={<PanelDocente />}></Route>
          <Route path="/Grupos" element={<GruposPage />} />
          <Route path="/Grupos-Asignacion" element={<AsignacionGrupoPage />} />
          <Route path="/Quizzes" element={<QuizzesPage />} />
          <Route path="/ConstructorQuiz/:id_quizz" element={<ConstructorQuizPage />} />
          <Route path="/CalificacionesDocente" element={<CalificacionesDocentePage />} />
          <Route path="/GeneradorIA" element={<GeneradorIAPage />} />

        </Route>



        <Route element={<ProteccionRuta UsuariosPermitidos={'admin'} />}>
          <Route path="/Asignaciones" element={<AsignacionesPage />} />
          <Route path="/Dashboard" element={<DashboradPage />} />
          <Route path="/Alumnos" element={<AlumnosPage />} />
          <Route path="/Personal" element={<PersonalPage />} />
        </Route>

        <Route element={<ProteccionRuta UsuariosPermitidos={['alumno']} />}>
          <Route path="/PanelAlumno" element={<PanelAlumnoPage />} />
          <Route path="/ResolverExamen/:id_g_asignado/:id_quizz" element={<ResolverExamenPage />} />
          <Route path="/MisCalificaciones" element={<CalificacionesAlumnoPage />} />
        </Route>




      </Route>





    </Routes>
  )

}

export default App
