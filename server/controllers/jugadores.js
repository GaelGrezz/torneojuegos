const JugadoresModel = require('../models/jugadores');

class JugadoresController {
  async getAll(req, res) {
    const rows = await JugadoresModel.getAll();
    res.status(200).json(rows);
  }

  async create(req, res) {
    const { nombre, alias, correo } = req.body;
    const rows = await JugadoresModel.create(nombre, alias, correo);
    res.status(201).json(rows[0]);
  }

  async update(req, res) {
    const { nombre, alias, correo } = req.body;
    const rows = await JugadoresModel.update(req.params.id, nombre, alias, correo);
    res.status(200).json(rows[0]);
  }

  async delete(req, res) {
    const rows = await JugadoresModel.delete(req.params.id);
    res.status(200).json(rows[0]);
  }
}

module.exports = new JugadoresController();