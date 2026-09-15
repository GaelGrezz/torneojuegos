const VideojuegosModel = require('../models/videojuegos');

class VideojuegosController {
  async create(req, res) {
    const { nombre, genero } = req.body;
    const rows = await VideojuegosModel.create(nombre, genero);
    res.status(201).json(rows[0]);
  }
}

module.exports = new VideojuegosController();