import { conmysql } from '../db.js';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

const secret = process.env.SECRET;

// ---------------------
// Obtener todos los productos
// ---------------------
export const getProductos = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" });

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, secret);

    const [result] = await conmysql.query('SELECT * FROM productos');
    res.json({
      usuario: payload.nombre,
      cant: result.length,
      data: result
    });

  } catch (error) {
    console.error('Error en getProductos:', error);
    if (error.name === "JsonWebTokenError") return res.status(401).json({ message: "Token inválido o manipulado" });
    if (error.name === "TokenExpiredError") return res.status(401).json({ message: "Token expirado" });
    return res.status(500).json({ message: "error en el servidor" });
  }
};

// ---------------------
// Obtener producto por ID
// ---------------------
export const getProductosxId = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" });

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, secret);

    const [result] = await conmysql.query('SELECT * FROM productos WHERE prod_id=?', [req.params.id]);
    if (result.length === 0) return res.status(404).json({ message: "producto no encontrado" });

    res.json({
      usuario: payload.nombre,
      data: result[0]
    });

  } catch (error) {
    console.error('Error en getProductosxId:', error);
    if (error.name === "JsonWebTokenError") return res.status(401).json({ message: "Token inválido o manipulado" });
    if (error.name === "TokenExpiredError") return res.status(401).json({ message: "Token expirado" });
    return res.status(500).json({ message: "error en el servidor" });
  }
};

// ---------------------
// Insertar un producto
// ---------------------
export const postProductos = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" });

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, secret);

    const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo } = req.body;

    // Verificar si el código ya existe
    const [fila] = await conmysql.query('SELECT prod_codigo FROM productos WHERE prod_codigo = ?', [prod_codigo]);
    if (fila.length > 0) {
      if (req.file) fs.unlink(req.file.path, () => {}); // eliminar archivo temporal
      return res.status(400).json({ message: 'Producto con código ' + prod_codigo + ' ya registrado' });
    }

    // Subir imagen a Cloudinary si existe
    let prod_imagen = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'productos' });
      prod_imagen = result.secure_url;

      // Eliminar archivo temporal
      fs.unlink(req.file.path, (err) => { if (err) console.error(err); });
    }

    const [result] = await conmysql.query(
      'INSERT INTO productos (prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen) VALUES (?, ?, ?, ?, ?, ?)',
      [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen]
    );

    res.json({
      usuario: payload.nombre,
      mensaje: "producto registrado correctamente",
      data: { prod_id: result.insertId, prod_imagen }
    });

  } catch (error) {
    console.error('Error en postProductos:', error);
    if (req.file) fs.unlink(req.file.path, () => {}); // limpiar temporal
    return res.status(500).json({ message: "error en el servidor", error: error.message });
  }
};

// ---------------------
// Modificar un producto
// ---------------------
export const putProductos = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" });

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, secret);

    const { id } = req.params;
    const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo } = req.body;

    // Obtener producto actual
    const [rows] = await conmysql.query('SELECT prod_imagen FROM productos WHERE prod_id=?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: "producto no encontrado" });

    let prod_imagen = rows[0].prod_imagen;

    // Subir nueva imagen si viene
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'productos' });
      prod_imagen = result.secure_url;

      // Eliminar archivo temporal
      fs.unlink(req.file.path, (err) => { if (err) console.error(err); });
    }

    const [result] = await conmysql.query(
      'UPDATE productos SET prod_codigo=?, prod_nombre=?, prod_stock=?, prod_precio=?, prod_activo=?, prod_imagen=? WHERE prod_id=?',
      [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen, id]
    );

    // Obtener producto actualizado
    const [updated] = await conmysql.query('SELECT * FROM productos WHERE prod_id=?', [id]);
    res.json({
      usuario: payload.nombre,
      mensaje: "producto actualizado correctamente",
      data: updated[0]
    });

  } catch (error) {
    console.error('Error en putProductos:', error);
    if (req.file) fs.unlink(req.file.path, () => {}); // limpiar temporal
    return res.status(500).json({ message: "error en el servidor", error: error.message });
  }
};

// ---------------------
// Eliminar un producto
// ---------------------
export const deleteProductos = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" });

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, secret);
    const { id } = req.params;

    const [result] = await conmysql.query('DELETE FROM productos WHERE prod_id=?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "producto no encontrado" });

    res.json({
      usuario: payload.nombre,
      mensaje: "producto eliminado correctamente"
    });

  } catch (error) {
    console.error('Error en deleteProductos:', error);
    return res.status(500).json({ message: "error en el servidor", error: error.message });
  }
};
