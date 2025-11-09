import app from './app.js';
import { PORT } from './config.js';

// Render te da un puerto dinámico, por eso se usa process.env.PORT
const port = process.env.PORT || PORT || 3000;

app.listen(port, () => {
  console.log('✅ El servidor está escuchando en el puerto:', port);
});
