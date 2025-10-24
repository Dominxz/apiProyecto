import {Router} from 'express'

//importar las funciones
import{prueba, getClientes, getClientesxId, postCliente, putCliente, deleteCliente, token} from '../controladores/clientesctrl.js'

const router=Router();
//armar nuestras rutas
//router.get('/clientes',prueba)
router.get('/clientes',getClientes)
router.get('/clientes/:id',getClientesxId)
router.post('/clientes',postCliente)
router.put('/clientes/:id',putCliente)
router.delete('/clientes/:id',deleteCliente)

//Generar token a traves de una id
router.get('/token/:id',token)


export default router