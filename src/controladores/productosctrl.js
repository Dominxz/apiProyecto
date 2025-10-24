import { conmysql } from '../db.js'
import jwt from 'jsonwebtoken'

const secret = process.env.SECRET

// Obtener todos los productos
export const getProductos = async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" })

        const token = authHeader.split(" ")[1]
        if (!token) return res.status(401).json({ message: "Formato de token inválido" })

        const payload = jwt.verify(token, secret)

        const [result] = await conmysql.query('select * from productos')
        res.json({
            usuario: payload.nombre,
            cant: result.length,
            data: result
        })

    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" })
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" })
        }
        return res.status(500).json({ message: "error en el servidor" })
    }
}

// Obtener producto por ID
export const getProductosxId = async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" })

        const token = authHeader.split(" ")[1]
        if (!token) return res.status(401).json({ message: "Formato de token inválido" })

        const payload = jwt.verify(token, secret)

        const [result] = await conmysql.query('select * from productos where prod_id=?', [req.params.id])
        if (result.length <= 0) return res.json({
            cant: 0,
            message: "producto no encontrado"
        })

        res.json({
            usuario: payload.nombre,
            cant: result.length,
            data: result[0]
        })

    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" })
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" })
        }
        return res.status(500).json({ message: "error en el servidor" })
    }
}

// Insertar un producto
export const postProductos = async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" })

        const token = authHeader.split(" ")[1]
        if (!token) return res.status(401).json({ message: "Formato de token inválido" })

        const payload = jwt.verify(token, secret)

        const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo } = req.body
        const prod_imagen=req.file? `/uploads/${req.file.filename}`:null;
        if(fila.length > 0) return res.status(404).json({
            id:0,
            message:'Producto con codigo: ' + prod_codigo + 'ya esta registrado'
        })
        const [result] = await conmysql.query(
            'insert into productos (prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen) values (?, ?, ?, ?, ?, ?)',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen]
        )

        res.json({
            usuario: payload.nombre,
            mensaje: "producto registrado correctamente",
            prod_id: result.insertId
        })

    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" })
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" })
        }
        return res.status(500).json({ message: "error en el servidor" })
    }
}

// Modificar un producto
export const putProductos = async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" })

        const token = authHeader.split(" ")[1]
        if (!token) return res.status(401).json({ message: "Formato de token inválido" })

        const payload = jwt.verify(token, secret)

        const { id } = req.params
        const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo } = req.body
        let prod_imagen=req.file? `/uploads/${req.file.filename}`:null;

        if(!req.file){
            const [rows] = await conmysql.query(
                'select prod_imagen from productos where prod_id = ?',
                [id]
            );
            if(rows && rows.length > 0){
                prod_imagen = rows[0].prod_imagen;
            }else{
                return res.status(401).json({ message: "Imagen no puesta" })
            }
        }

        const [result] = await conmysql.query(
            'update productos set prod_codigo=?, prod_nombre=?, prod_stock=?, prod_precio=?, prod_activo=?, prod_imagen=? where prod_id=?',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen, id]
        )

        if (result.affectedRows <= 0) return res.status(404).json({ message: "producto no encontrado" })

        const [fila] = await conmysql.query('select * from productos where prod_id=?', [id])
        res.json({
            usuario: payload.nombre,
            mensaje: "producto actualizado correctamente",
            data: fila[0]
        })

    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" })
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" })
        }
        return res.status(500).json({ message: "error en el servidor" })
    }
}

// Eliminar un producto
export const deleteProductos = async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" })

        const token = authHeader.split(" ")[1]
        if (!token) return res.status(401).json({ message: "Formato de token inválido" })

        const payload = jwt.verify(token, secret)

        const { id } = req.params

        const [result] = await conmysql.query('delete from productos where prod_id=?', [id])

        if (result.affectedRows <= 0) return res.status(404).json({ message: "producto no encontrado" })

        res.json({
            usuario: payload.nombre,
            mensaje: "producto eliminado correctamente"
        })

    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" })
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" })
        }
        return res.status(500).json({ message: "error en el servidor" })
    }
}
 