const PuntuacionesModel = require('../models/puntuaciones');

class PuntuacionesController {
  async getAll(req, res) {
    const rows = await PuntuacionesModel.getAll();
    res.status(200).json(rows);
  }

  async create(req, res) {
    const { id_jugador: jugadorId, id_videojuego: videojuegoId, puntuacion } = req.body;
    const rows = await PuntuacionesModel.create(jugadorId, videojuegoId, puntuacion);
    res.status(201).json(rows[0]);
  }

  async update(req, res) {
    const rows = await PuntuacionesModel.update(req.params.id, req.body.puntuacion);
    res.status(200).json(rows[0]);
  }

  async delete(req, res) {
    const rows = await PuntuacionesModel.delete(req.params.id);
    res.status(200).json(rows[0]);
  }
}

module.exports = new PuntuacionesController();