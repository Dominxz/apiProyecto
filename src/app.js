import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rutas
import clientesRoutes from './routes/clientes.routes.js';
import productosRoutes from './routes/productos.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';

const app = express();

// Configuración para __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === CORS ===
const allowedOrigins = [
  'http://localhost:8100',  // navegador
  'http://localhost',       // navegador simple
  'capacitor://localhost',  // Android/iOS
  'ionic://localhost'       // Ionic Dev Server
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite peticiones sin origin (Postman, pruebas desde Android nativo)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS denegado por origen: ' + origin));
    }
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

// === Middleware ===
app.use(express.json({ limit: '10mb' }));            // Límite para subir imágenes base64
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === Rutas ===
app.use('/api', clientesRoutes);
app.use('/api', productosRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', pedidosRoutes);

// Manejo de endpoints no encontrados
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Manejo de errores CORS y otros
app.use((err, req, res, next) => {
  if (err.message.includes('CORS')) {
    return res.status(403).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

export default app;
