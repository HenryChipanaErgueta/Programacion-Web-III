import express from "express";
import mysql from "mysql2/promise";

const app = express();
app.use(express.json());

const bd = mysql.createPool({
  host: "localhost",
  user: "admin",
  password: "12345",
  database: "basededatos",
});

app.get("/productos", async (req, res) => {
  const [datos] = await bd.query("SELECT * FROM productos");
  res.status(200).json(datos);
});

app.get("/productos/:id", async (req, res) => {
  const id = req.params.id;
  const [dato] = await bd.query("SELECT * FROM productos WHERE id = ?", [id]);
  res.status(200).json(dato[0]);
});

app.post("/productos", async (req, res) => {
  const { nombre, precio, categoria_id } = req.body;
  const [nv] = await bd.query(
    "INSERT INTO productos(nombre, precio, categoria_id) VALUES (?,?,?)",
    [nombre, precio, categoria_id],
  );
  res.status(201).json(nv);
});

app.patch("/productos/:id", async (req, res) => {
  const id = req.params.id;
  const { nombre, precio } = req.body;
  const [mod] = await bd.query(
    "UPDATE productos SET nombre = ?, precio = ? WHERE id = ?",
    [nombre, precio, id],
  );
  res.status(200).json(mod);
});

app.delete("/productos/:id", async (req, res) => {
  const id = req.params.id;
  await bd.query("DELETE FROM productos WHERE id = ?", [id]);
  res.status(200).json({ msj: "Borrado" });
});

app.post("/categorias", async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const [r] = await bd.query(
      "INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)",
      [nombre, descripcion],
    );
    res.status(201).json({ id: r.insertId, nombre, descripcion });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/categorias", async (req, res) => {
  try {
    const [lista] = await bd.query("SELECT * FROM categorias");
    res.status(200).json(lista);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/categorias/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [cat] = await bd.query("SELECT * FROM categorias WHERE id = ?", [id]);
    if (cat.length === 0) {
      return res.status(404).json({ msj: "No existe esa categoria" });
    }
    const [prods] = await bd.query(
      "SELECT * FROM productos WHERE categoria_id = ?",
      [id],
    );

    const final = cat[0];
    final.productos = prods;

    res.status(200).json(final);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/categorias/:id", async (req, res) => {
  const id = req.params.id;
  const { nombre, descripcion } = req.body;
  try {
    await bd.query(
      "UPDATE categorias SET nombre = COALESCE(?, nombre), descripcion = COALESCE(?, descripcion), updatedAt = current_timestamp() WHERE id = ?",
      [nombre, descripcion, id],
    );
    res.status(200).json({ msj: "Actualizado" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/categorias/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [r] = await bd.query("DELETE FROM categorias WHERE id = ?", [id]);
    if (r.affectedRows === 0) {
      return res.status(404).json({ msj: "No existe" });
    }
    res.status(200).json({ msj: "Eliminado con exito" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const pto = 3001;
app.listen(pto, () => {
  console.log(`Corriendo en http://localhost:${pto}`);
});
