const express = require('express');
const app = express();
const cors = require('cors');
const rutaspersonal = require('./routes/personalRoutes.js');
const rutasauth = require('./routes/authRoutes.js');
const rutaestudiantes = require('./routes/estudinatesRoutes.js')
const rutAsignacion = require('./routes/asignacionRoutes.js')
const rutaGrupos = require('./routes/gruposRoutes.js')
const ProtectionAuth = require('./middlewares/auth.middleware.js')
const rutasDocente = require('./routes/docenteRoutes.js');
const rutasAsignacionGrupo = require('./routes/asignacionGrupoRoutes.js');
const rutaQuizzes = require('./routes/quizzesRoutes.js');
const rutaActividades = require('./routes/actividadesRoutes.js');
const rutasAlumno = require('./routes/alumnoRoutes.js');
const rutasCalificaciones = require('./routes/calificacionesRoutes.js');
const dashboardroutes = require('./routes/dashboardRoutes.js')
const iarutes = require('./routes/iaRoutes.js')

app.use(cors());
app.use(express.json());

app.use('/auth', rutasauth)
app.use('/personal', ProtectionAuth, rutaspersonal)
app.use('/estudiantes', ProtectionAuth, rutaestudiantes)
app.use(rutAsignacion)
app.use('/grupos', ProtectionAuth, rutaGrupos)
app.use('/docente', ProtectionAuth, rutasDocente)
app.use('/asignacion-grupo', ProtectionAuth, rutasAsignacionGrupo)
app.use('/quizzes', ProtectionAuth, rutaQuizzes);
app.use('/actividades', ProtectionAuth, rutaActividades);
app.use('/alumno', ProtectionAuth, rutasAlumno);
app.use('/calificaciones', ProtectionAuth, rutasCalificaciones);
app.use('/dashboard', ProtectionAuth, dashboardroutes)
app.use('/ia', ProtectionAuth, iarutes)


app.listen(5000, () => {
    console.log('El servidor esta activo ');

});

