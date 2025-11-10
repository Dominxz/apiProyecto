import multer from 'multer';

// Subida en memoria, para luego subir a Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeType = fileTypes.test(file.mimetype);
    const extName = fileTypes.test(file.originalname.toLowerCase());
    if (mimeType && extName) return cb(null, true);
    cb(new Error('Solo imágenes JPEG, PNG o GIF'));
  }
});

export default upload;
