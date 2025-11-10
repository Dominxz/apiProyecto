import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import productosRoutes from './rutas/productosroutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: 'http://localhost:8100',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Servir archivos desde src/uploads/
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', productosRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'API funcionando',
    uploads: `${req.protocol}://${req.get('host')}/uploads`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
  console.log(`📁 Uploads en http://localhost:${PORT}/uploads`);
});

export default app;