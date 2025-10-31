import {Router} from 'express'
import {getUsuarios,loginUsuario, getUsuariosxId, postUsuarios, putUsuarios, deleteUsuarios} from '../controladores/usuariosctrl.js'
const router=Router();

router.get('/usuarios',getUsuarios)
router.get('/usuarios/:id',getUsuariosxId)
router.post('/usuarios',postUsuarios)
router.put('/usuarios/:id',putUsuarios)
router.delete('/usuarios/:id',deleteUsuarios)
router.post('/usuarios/login', loginUsuario)


export default router
