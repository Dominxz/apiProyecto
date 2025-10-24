import {conmysql} from '../db.js'
import jwt from 'jsonwebtoken';

const secret = process.env.SECRET
export const prueba=(req,res)=>{
    res.send(' prueba con exito ')
}

export const token = async(req,res)=>{
    try {
        //Llamar usuario desde la bd
        const [result]= await conmysql.query(' select * from usuarios where usr_id=?', [req.params.id])
        
        if (result.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const usuario = result[0];

        //crear token
        const token = jwt.sign({
            id: usuario.usr_id,
            usuario: usuario.usr_usuario,
            nombre: usuario.usr_nombre,
            correo: usuario.usr_correo
        }, secret,
        { expiresIn: '1h' });
        
        res.json({
            mensaje: 'Token generado correctamente',
            token
        });

    } catch (error) {
        return res.status(500).json({message:" error en el servidor"})
    }
}

export const getClientes=async(req,res)=>{
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        // El formato debe ser: "Bearer <token>"
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Formato de token inválido" });
        }

        // Verificar el token con la clave secreta
        const payload = jwt.verify(token, secret);
        const [result]= await conmysql.query(' select * from clientes')
        res.json({
            usuario: payload.nombre,
            cant:result.length,
            data:result
        })
    } catch (error) {
        // Detectar si el error es de token
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" });
        }

        console.error("Error:", error.message);
        return res.status(500).json({ message: "Error en el servidor" });
    }
}

export const getClientesxId = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Formato de token inválido" });
        }

        const payload = jwt.verify(token, secret);

        const [result] = await conmysql.query('select * from clientes where cli_id=?', [req.params.id]);
        if (result.length <= 0) return res.json({
            cant: 0,
            message: "Cliente no encontrado"
        });

        res.json({
            usuario: payload.nombre,
            cant: result.length,
            data: result[0]
        });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" });
        }

        console.error("Error:", error.message);
        return res.status(500).json({ message: "Error en el servidor" });
    }
}

// INSERTAR CLIENTE
export const postCliente = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Formato de token inválido" });
        }

        const payload = jwt.verify(token, secret);

        const { cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad } = req.body;
        const [result] = await conmysql.query(
            'insert into clientes (cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad) values (?,?,?,?,?,?,?)',
            [cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad]
        );

        res.json({
            usuario: payload.nombre,
            cli_id: result.insertId,
            message: "Cliente agregado correctamente"
        });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" });
        }

        console.error("Error:", error.message);
        return res.status(500).json({ message: "Error en el servidor" });
    }
}

// MODIFICAR CLIENTE
export const putCliente = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Formato de token inválido" });
        }

        const payload = jwt.verify(token, secret);

        const { id } = req.params;
        const { cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad } = req.body;

        const [result] = await conmysql.query(
            'update clientes set cli_identificacion=?, cli_nombre=?, cli_telefono=?, cli_correo=?, cli_direccion=?, cli_pais=?, cli_ciudad=? where cli_id=?',
            [cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad, id]
        );

        if (result.affectedRows <= 0) return res.status(404).json({ message: "Cliente no encontrado" });

        const [fila] = await conmysql.query('select * from clientes where cli_id=?', [id]);
        res.json({
            usuario: payload.nombre,
            message: "Cliente actualizado correctamente",
            data: fila[0]
        });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" });
        }

        console.error("Error:", error.message);
        return res.status(500).json({ message: "Error en el servidor" });
    }
}

// ELIMINAR CLIENTE
export const deleteCliente = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Formato de token inválido" });
        }

        const payload = jwt.verify(token, secret);

        const { id } = req.params;
        const [result] = await conmysql.query('delete from clientes where cli_id=?', [id]);

        if (result.affectedRows <= 0) return res.status(404).json({ message: "Cliente no encontrado" });

        res.json({
            usuario: payload.nombre,
            message: "Cliente eliminado correctamente"
        });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido o manipulado" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" });
        }

        console.error("Error:", error.message);
        return res.status(500).json({ message: "Error en el servidor" });
    }
}