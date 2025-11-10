import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js'; // importar configuración

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'productos',                   // carpeta en Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

const upload = multer({ storage });

export default upload;
