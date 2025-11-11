import express from 'express';
import cors from 'cors';

// importar rutas
import clientesRoutes from './routes/clientes.routes.js';
import productosRoutes from './routes/productos.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // apps móviles o curl sin origin
    const allowedOrigins = [
      'https://apiproyecto20252.onrender.com',
      'http://localhost:8100', // Ionic local
      'capacitor://localhost', // App Android/iOS
      'http://localhost'       // WebView Android
    ];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS rechazado:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200 // para solicitudes preflight en móviles
};

app.use(cors(corsOptions));

// Rutas
app.use('/api', clientesRoutes);
app.use('/api', productosRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', pedidosRoutes);

// 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

export default app;

