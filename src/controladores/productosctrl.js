import { conmysql } from '../db.js'
import jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const secret = process.env.SECRET

// Obtener todos los productos
export const getProductos = async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" })

        const token = authHeader.split(" ")[1]
        if (!token) return res.status(401).json({ message: "Formato de token inválido" })

        const payload = jwt.verify(token, secret)

        const [result] = await conmysql.query('SELECT * FROM productos')
        res.json({
            usuario: payload.nombre,
            cant: result.length,
            data: result
        })

    } catch (error) {
        console.error('Error en getProductos:', error)
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

        const [result] = await conmysql.query('SELECT * FROM productos WHERE prod_id=?', [req.params.id])
        if (result.length <= 0) {
            return res.json({
                cant: 0,
                message: "producto no encontrado"
            })
        }

        res.json({
            usuario: payload.nombre,
            cant: result.length,
            data: result[0]
        })

    } catch (error) {
        console.error('Error en getProductosxId:', error)
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

        // ✅ Verificar si el código ya existe
        const [fila] = await conmysql.query(
            'SELECT prod_codigo FROM productos WHERE prod_codigo = ?',
            [prod_codigo]
        )
        
        if (fila.length > 0) {
            // Si hay imagen subida, eliminarla
            if (req.file) {
                fs.unlinkSync(req.file.path)
            }
            return res.status(400).json({
                id: 0,
                message: 'Producto con código: ' + prod_codigo + ' ya está registrado'
            })
        }

        // ✅ Construir URL COMPLETA de la imagen
        const prod_imagen = req.file 
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : null

        console.log('📸 URL de imagen a guardar:', prod_imagen)

        const [result] = await conmysql.query(
            'INSERT INTO productos (prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen) VALUES (?, ?, ?, ?, ?, ?)',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen]
        )

        res.json({
            usuario: payload.nombre,
            mensaje: "producto registrado correctamente",
            data: {
                prod_id: result.insertId,
                prod_imagen: prod_imagen
            }
        })

    } catch (error) {
        console.error('❌ Error en postProductos:', error)
        
        // Si hay error, eliminar la imagen subida
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path)
            } catch (err) {
                console.error('Error al eliminar archivo:', err)
            }
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" })
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" })
        }
        return res.status(500).json({ 
            message: "error en el servidor", 
            error: error.message 
        })
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
        
        let prod_imagen = null

        // ✅ Si viene nueva imagen
        if (req.file) {
            // Construir URL COMPLETA
            prod_imagen = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            
            console.log('📸 Nueva URL de imagen:', prod_imagen)
            
            // 🗑️ Eliminar imagen anterior del servidor
            const [oldProduct] = await conmysql.query(
                'SELECT prod_imagen FROM productos WHERE prod_id = ?',
                [id]
            )
            
            if (oldProduct && oldProduct.length > 0 && oldProduct[0].prod_imagen) {
                try {
                    // Extraer nombre del archivo de la URL
                    const oldImageName = path.basename(oldProduct[0].prod_imagen)
                    // ✅ Ruta correcta: src/controladores/ → src/uploads/
                    const oldImagePath = path.join(__dirname, '../uploads', oldImageName)
                    
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath)
                        console.log('🗑️ Imagen anterior eliminada:', oldImageName)
                    }
                } catch (err) {
                    console.error('⚠️ Error al eliminar imagen anterior:', err)
                }
            }
        } else {
            // ✅ Si NO viene nueva imagen, mantener la anterior
            const [rows] = await conmysql.query(
                'SELECT prod_imagen FROM productos WHERE prod_id = ?',
                [id]
            )
            
            if (rows && rows.length > 0) {
                prod_imagen = rows[0].prod_imagen
                console.log('📸 Manteniendo imagen anterior:', prod_imagen)
            }
        }

        // ✅ Actualizar producto
        const [result] = await conmysql.query(
            'UPDATE productos SET prod_codigo=?, prod_nombre=?, prod_stock=?, prod_precio=?, prod_activo=?, prod_imagen=? WHERE prod_id=?',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen, id]
        )

        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: "producto no encontrado" })
        }

        // ✅ Obtener datos actualizados
        const [fila] = await conmysql.query('SELECT * FROM productos WHERE prod_id=?', [id])
        
        res.json({
            usuario: payload.nombre,
            mensaje: "producto actualizado correctamente",
            data: fila[0]
        })

    } catch (error) {
        console.error('❌ Error en putProductos:', error)
        
        // Si hay error, eliminar la nueva imagen subida
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path)
            } catch (err) {
                console.error('Error al eliminar archivo:', err)
            }
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" })
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" })
        }
        return res.status(500).json({ 
            message: "error en el servidor", 
            error: error.message 
        })
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

        // ✅ Obtener la imagen antes de eliminar
        const [producto] = await conmysql.query(
            'SELECT prod_imagen FROM productos WHERE prod_id = ?',
            [id]
        )

        // ✅ Eliminar el producto de la BD
        const [result] = await conmysql.query('DELETE FROM productos WHERE prod_id=?', [id])

        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: "producto no encontrado" })
        }

        // 🗑️ Eliminar imagen física del servidor
        if (producto && producto.length > 0 && producto[0].prod_imagen) {
            try {
                const imageName = path.basename(producto[0].prod_imagen)
                // ✅ Ruta correcta: src/controladores/ → src/uploads/
                const imagePath = path.join(__dirname, '../uploads', imageName)
                
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath)
                    console.log('🗑️ Imagen eliminada:', imageName)
                }
            } catch (err) {
                console.error('⚠️ Error al eliminar imagen:', err)
            }
        }

        res.json({
            usuario: payload.nombre,
            mensaje: "producto eliminado correctamente"
        })

    } catch (error) {
        console.error('❌ Error en deleteProductos:', error)
        
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" })
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" })
        }
        return res.status(500).json({ message: "error en el servidor" })
    }
}