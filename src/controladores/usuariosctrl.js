import { conmysql } from '../db.js'
import jwt from 'jsonwebtoken'

const secret = process.env.SECRET

// Obtener todos los usuarios
export const getUsuarios = async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ message: "token no proporcionado" })

        const token = authHeader.split(" ")[1]
        if (!token) return res.status(401).json({ message: "formato de token inválido" })

        const payload = jwt.verify(token, secret)

        const [result] = await conmysql.query('select * from usuarios')
        res.json({
            usuario: payload.nombre,
            cant: result.length,
            data: result
        })
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "token inválido o manipulado" })
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "token expirado" })
        }
        return res.status(500).json({ message: "error en el servidor" })
    }
}

// Obtener usuario por ID
export const getUsuariosxId = async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ message: "token no proporcionado" })

        const token = authHeader.split(" ")[1]
        if (!token) return res.status(401).json({ message: "formato de token inválido" })

        const payload = jwt.verify(token, secret)

        const [result] = await conmysql.query('select * from usuarios where usr_id=?', [req.params.id])
        if (result.length <= 0) return res.json({
            cant: 0,
            message: "usuario no encontrado"
        })

        res.json({
            usuario: payload.nombre,
            cant: result.length,
            data: result[0]
        })
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "token inválido o manipulado" })
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "token expirado" })
        }
        return res.status(500).json({ message: "error en el servidor" })
    }
}

// Insertar nuevo usuario
export const postUsuarios = async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ message: "token no proporcionado" })

        const token = authHeader.split(" ")[1]
        if (!token) return res.status(401).json({ message: "formato de token inválido" })

        const payload = jwt.verify(token, secret)

        const { usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo, usr_activo } = req.body
        const [result] = await conmysql.query(
            'insert into usuarios (usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo, usr_activo) values (?, ?, ?, ?, ?, ?)',
            [usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo, usr_activo]
        )

        res.json({
            usuario: payload.nombre,
            mensaje: "usuario registrado correctamente",
            usr_id: result.insertId
        })
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "token inválido o manipulado" })
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "token expirado" })
        }
        return res.status(500).json({ message: "error en el servidor" })
    }
}

// Actualizar usuario
export const putUsuarios = async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ message: "token no proporcionado" })

        const token = authHeader.split(" ")[1]
        if (!token) return res.status(401).json({ message: "formato de token inválido" })

        const payload = jwt.verify(token, secret)

        const { id } = req.params
        const { usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo, usr_activo } = req.body
        const [result] = await conmysql.query(
            'update usuarios set usr_usuario=?, usr_clave=?, usr_nombre=?, usr_telefono=?, usr_correo=?, usr_activo=? where usr_id=?',
            [usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo, usr_activo, id]
        )

        if (result.affectedRows <= 0)
            return res.status(404).json({ message: "usuario no encontrado" })

        const [fila] = await conmysql.query('select * from usuarios where usr_id=?', [id])
        res.json({
            usuario: payload.nombre,
            mensaje: "usuario actualizado correctamente",
            data: fila[0]
        })
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "token inválido o manipulado" })
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "token expirado" })
        }
        return res.status(500).json({ message: "error en el servidor" })
    }
}

// Eliminar usuario
export const deleteUsuarios = async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ message: "token no proporcionado" })

        const token = authHeader.split(" ")[1]
        if (!token) return res.status(401).json({ message: "formato de token inválido" })

        const payload = jwt.verify(token, secret)

        const { id } = req.params
        const [result] = await conmysql.query('delete from usuarios where usr_id=?', [id])

        if (result.affectedRows <= 0)
            return res.status(404).json({ message: "usuario no encontrado" })

        res.json({
            usuario: payload.nombre,
            mensaje: "usuario eliminado correctamente"
        })
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "token inválido o manipulado" })
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "token expirado" })
        }
        return res.status(500).json({ message: "error en el servidor" })
    }
}
