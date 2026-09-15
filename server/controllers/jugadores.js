const JugadoresModel = require('../models/jugadores');

class JugadoresController {
  async getAll(req, res) {
    const rows = await JugadoresModel.getAll();
    res.status(200).json(rows);
  }

  async create(req, res) {
    const { nombre, alias, correo, fecha_registro: fechaRegistro } = req.body;
    const rows = await JugadoresModel.create(nombre, alias, correo, fechaRegistro);
    res.status(201).json(rows[0]);
  }

  async search(req, res) {
    const rows = await JugadoresModel.search(req.query.criterio);
    res.status(200).json(rows);
  }
}

module.exports = new JugadoresController();