const GenerosModel = require('../models/generos');

class GenerosController {
  async getAll(req, res) {
    const rows = await GenerosModel.getAll();
    res.status(200).json(rows);
  }

  async create(req, res) {
    const rows = await GenerosModel.create(req.body.nombre);
    res.status(201).json(rows[0]);
  }

  async update(req, res) {
    const rows = await GenerosModel.update(req.params.id, req.body.nombre);
    res.status(200).json(rows[0]);
  }

  async delete(req, res) {
    const rows = await GenerosModel.delete(req.params.id);
    res.status(200).json(rows[0]);
  }
}

module.exports = new GenerosController();