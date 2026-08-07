require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const rutaspersonal = require('./routes/personalRoutes.js');
const rutasauth = require('./routes/authRoutes.js');
const rutaestudiantes = require('./routes/estudinatesRoutes.js');
const rutAsignacion = require('./routes/asignacionRoutes.js');
const rutaGrupos = require('./routes/gruposRoutes.js');
const ProtectionAuth = require('./middlewares/auth.middleware.js');
const rutasDocente = require('./routes/docenteRoutes.js');
const rutasAsignacionGrupo = require('./routes/asignacionGrupoRoutes.js');
const rutaQuizzes = require('./routes/quizzesRoutes.js');
const rutaActividades = require('./routes/actividadesRoutes.js');
const rutasAlumno = require('./routes/alumnoRoutes.js');
const rutasCalificaciones = require('./routes/calificacionesRoutes.js');
const dashboardroutes = require('./routes/dashboardRoutes.js');
const iarutes = require('./routes/iaRoutes.js');

// 1. Ocultar información del servidor y aplicar encabezados de seguridad HTTP
app.use(helmet());
app.disable('x-powered-by');

// 2. Rate Limiter para prevenir ataques de fuerza bruta en autenticación
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // Máximo 20 intentos por IP en 15 min
    message: { err: 'Demasiados intentos de inicio de sesión. Intente más tarde.' }
});

// 3. Configuración de CORS segura para desarrollo y producción
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Permitir solicitudes sin origen (como clientes móviles o Postman en dev) y orígenes autorizados
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por política de CORS'));
        }
    },
    credentials: true
}));

// 4. Limitar el tamaño de payload recibido en JSON para prevenir abusos de memoria
app.use(express.json({ limit: '10kb' }));

// 5. Definición de Rutas y Protección con Autenticación
app.use('/auth', authLimiter, rutasauth);
app.use('/personal', ProtectionAuth, rutaspersonal);
app.use('/estudiantes', ProtectionAuth, rutaestudiantes);
app.use(ProtectionAuth, rutAsignacion); // Protegida manteniendo la compatibilidad con las URLs actuales (/asignacion)
app.use('/grupos', ProtectionAuth, rutaGrupos);
app.use('/docente', ProtectionAuth, rutasDocente);
app.use('/asignacion-grupo', ProtectionAuth, rutasAsignacionGrupo);
app.use('/quizzes', ProtectionAuth, rutaQuizzes);
app.use('/actividades', ProtectionAuth, rutaActividades);
app.use('/alumno', ProtectionAuth, rutasAlumno);
app.use('/calificaciones', ProtectionAuth, rutasCalificaciones);
app.use('/dashboard', ProtectionAuth, dashboardroutes);
app.use('/ia', ProtectionAuth, iarutes);

// 6. Manejador de errores global seguro
app.use((err, req, res, next) => {
    console.error('Error no capturado:', err.stack || err.message);
    res.status(500).json({ err: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`El servidor está activo en el puerto ${PORT}`);
});
