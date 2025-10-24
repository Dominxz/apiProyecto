import { conmysql } from '../db.js';
import jwt from 'jsonwebtoken';

const secret = process.env.SECRET;

export const getPedidos = async (req, res) => {
    try {
        // === Validar token ===
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Formato de token inválido" });
        }

        const payload = jwt.verify(token, secret);

        // === 1️⃣ Obtener todos los pedidos con cliente y usuario ===
        const [pedidos] = await conmysql.query(`
            SELECT 
                p.ped_id,
                p.ped_fecha,
                p.ped_estado,
                c.cli_nombre AS cliente,
                u.usr_nombre AS usuario
            FROM pedidos p
            LEFT JOIN clientes c ON p.cli_id = c.cli_id
            LEFT JOIN usuarios u ON p.usr_id = u.usr_id
            ORDER BY p.ped_fecha DESC
        `);

        if (pedidos.length === 0) {
            return res.json({
                usuario: payload.nombre,
                cant: 0,
                data: []
            });
        }

        // === 2️⃣ Obtener todos los detalles relacionados ===
        const [detalles] = await conmysql.query(`
            SELECT 
                d.ped_id,
                d.det_id,
                d.prod_id,
                pr.prod_nombre,
                d.det_cantidad,
                d.det_precio,
                (d.det_cantidad * d.det_precio) AS subtotal
            FROM pedidos_detalle d
            LEFT JOIN productos pr ON d.prod_id = pr.prod_id
        `);

        // === 3️⃣ Agrupar los detalles por pedido ===
        const pedidosConDetalles = pedidos.map(p => {
            const detallePedido = detalles.filter(d => d.ped_id === p.ped_id);
            const total = detallePedido.reduce((acc, d) => acc + Number(d.subtotal), 0);
            return { ...p, total, detalles: detallePedido };
        });

        // === 4️⃣ Enviar respuesta ===
        res.json({
            usuario: payload.nombre,
            cant: pedidosConDetalles.length,
            data: pedidosConDetalles
        });

    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" });
        }

        console.error("Error al obtener pedidos con detalles:", error.message);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const getPedidosxId = async (req, res) => {
    try {
        // ✅ Verificar token
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) {
            return res.status(401).json({ message: "Token no proporcionado" })
        }

        const payload = jwt.verify(token, secret)

        // ✅ Obtener parámetro de ruta
        const { id } = req.params

        // ✅ Consulta principal del pedido
        const [pedido] = await conmysql.query(`
            SELECT p.ped_id, p.ped_fecha, p.ped_estado,
                   c.cli_id, c.cli_nombre,
                   u.usr_id, u.usr_nombre
            FROM pedidos p
            INNER JOIN clientes c ON p.cli_id = c.cli_id
            INNER JOIN usuarios u ON p.usr_id = u.usr_id
            WHERE p.ped_id = ?
        `, [id])

        if (pedido.length === 0) {
            return res.status(404).json({ message: "Pedido no encontrado" })
        }

        // ✅ Consulta de detalles del pedido (tabla corregida)
        const [detalles] = await conmysql.query(`
            SELECT d.det_id, d.prod_id, p.prod_nombre, d.det_cantidad, d.det_precio
            FROM pedidos_detalle d
            INNER JOIN productos p ON d.prod_id = p.prod_id
            WHERE d.ped_id = ?
        `, [id])

        // ✅ Calcular total del pedido
        const total = detalles.reduce((acc, det) => acc + (det.det_cantidad * det.det_precio), 0)

        // ✅ Respuesta estructurada
        res.json({
            usuario: payload.usr_nombre,
            ped_id: pedido[0].ped_id,
            ped_fecha: pedido[0].ped_fecha,
            ped_estado: pedido[0].ped_estado,
            cliente: {
                cli_id: pedido[0].cli_id,
                cli_nombre: pedido[0].cli_nombre
            },
            usuario_pedido: {
                usr_id: pedido[0].usr_id,
                usr_nombre: pedido[0].usr_nombre
            },
            detalles: detalles.map(det => ({
                det_id: det.det_id,
                prod_id: det.prod_id,
                prod_nombre: det.prod_nombre,
                det_cantidad: det.det_cantidad,
                det_precio: det.det_precio
            })),
            total: total.toFixed(2)
        })

    } catch (error) {
        console.error("Error en getPedidosxId:", error)
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido" })
        }
        return res.status(500).json({ message: "Error en el servidor" })
    }
}


export const postPedido = async (req, res) => {
    const connection = await conmysql.getConnection();
    try {
        // === Validar token ===
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Formato de token inválido" });
        }

        const payload = jwt.verify(token, secret);

        // === Datos del pedido ===
        const { cli_id, usr_id, detalles, ped_estado = 0 } = req.body;
        // detalles debe ser un array de objetos [{ prod_id, det_cantidad, det_precio }, ...]

        if (!cli_id || !usr_id || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ message: "Datos incompletos o inválidos" });
        }

        // === Iniciar transacción ===
        await connection.beginTransaction();

        // 1️⃣ Insertar pedido principal
        const [pedidoResult] = await connection.query(
            'INSERT INTO pedidos (cli_id, ped_fecha, usr_id, ped_estado) VALUES (?, NOW(), ?, ?)',
            [cli_id, usr_id, ped_estado]
        );

        const ped_id = pedidoResult.insertId;

        // 2️⃣ Insertar los detalles del pedido
        for (const det of detalles) {
            const { prod_id, det_cantidad, det_precio } = det;
            await connection.query(
                'INSERT INTO pedidos_detalle (prod_id, ped_id, det_cantidad, det_precio) VALUES (?, ?, ?, ?)',
                [prod_id, ped_id, det_cantidad, det_precio]
            );
        }

        // 3️⃣ Confirmar transacción
        await connection.commit();

        res.json({
            usuario: payload.nombre,
            ped_id,
            message: "Pedido registrado correctamente"
        });

    } catch (error) {
        await connection.rollback();

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" });
        }

        console.error("Error al registrar pedido:", error.message);
        return res.status(500).json({ message: "Error en el servidor" });
    } finally {
        connection.release();
    }
};
