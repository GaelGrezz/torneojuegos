const VideojuegosModel = require('../models/videojuegos');

class VideojuegosController {
  async getAll(req, res) {
    const rows = await VideojuegosModel.getAll();
    res.status(200).json(rows);
  }

  async create(req, res) {
    const { nombre, id_genero: generoId } = req.body;
    const rows = await VideojuegosModel.create(nombre, generoId);
    res.status(201).json(rows[0]);
  }

  async update(req, res) {
    const { nombre, id_genero: generoId } = req.body;
    const rows = await VideojuegosModel.update(req.params.id, nombre, generoId);
    res.status(200).json(rows[0]);
  }

  async delete(req, res) {
    const rows = await VideojuegosModel.delete(req.params.id);
    res.status(200).json(rows[0]);
  }
}

module.exports = new VideojuegosController();