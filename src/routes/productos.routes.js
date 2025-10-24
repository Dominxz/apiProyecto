import {Router} from 'express'
import upload from '../middlewares/upload.js';
import {getProductos, getProductosxId, postProductos, putProductos, deleteProductos} from '../controladores/productosctrl.js'

const router=Router();

router.get('/productos',getProductos)
router.get('/productos/:id',getProductosxId)
//router.post('/productos',postProductos)
router.post('/productos', upload.single('imagen') ,postProductos)
router.put('/productos/:id',upload.single('imagen'), putProductos)
router.delete('/productos/:id',deleteProductos)

export default router
