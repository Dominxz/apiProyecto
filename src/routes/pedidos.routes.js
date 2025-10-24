import {Router} from 'express'

import {postPedido, getPedidos, getPedidosxId} from '../controladores/pedidosctrl.js'

const router=Router();

router.get('/pedidos/:id',getPedidosxId)
router.get('/pedidos',getPedidos)
router.post('/pedidos',postPedido)


export default router