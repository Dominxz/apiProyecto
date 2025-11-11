import express from 'express'
import cors from 'cors'

// importar las rutas OJO
import clientesRoutes from './routes/clientes.routes.js'
import productosRoutes from './routes/productos.routes.js'
import usuariosRoutes from './routes/usuarios.routes.js'
import pedidosRoutes from './routes/pedidos.routes.js'

const app = express();

// 👇 Aumentamos el límite de tamaño permitido en el body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const corsOptions = {
  origin: (origin, callback) => {
    // Permitimos solicitudes sin origin (como apps móviles)
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'https://apiproyecto20252.onrender.com',
      'http://localhost:8100', // Ionic local
      'capacitor://localhost', // App Android/iOS
      'http://localhost'       // WebView Android
    ];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  next();
});


// indicar las rutas a utilizar OJO
app.use('/api', clientesRoutes);
app.use('/api', productosRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', pedidosRoutes);

// manejo de rutas no encontradas
app.use((req, resp, next) => {
  resp.status(400).json({
    message: 'Endpoint not found'
  });
});

export default app;
