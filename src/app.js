import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

// importar las rutas
import clientesRoutes from './routes/clientes.routes.js'
import productosRoutes from './routes/productos.routes.js'
import usuariosRoutes from './routes/usuarios.routes.js'
import pedidosRoutes from './routes/pedidos.routes.js'

const app = express();

// Para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 Aumentamos el límite de tamaño permitido en el body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const corsOption = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
};
app.use(cors(corsOption));

// 👉 Servir la carpeta uploads como pública
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// indicar las rutas a utilizar
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
