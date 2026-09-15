const PuntuacionesModel = require('../models/puntuaciones');

class PuntuacionesController {
  async getAll(req, res) {
    const rows = await PuntuacionesModel.getClassification(req.query.videojuego);
    res.status(200).json(rows);
  }

  async create(req, res) {
    const { id_jugador: jugadorId, id_videojuego: videojuegoId, puntuacion, fecha } = req.body;
    const rows = await PuntuacionesModel.create(jugadorId, videojuegoId, puntuacion, fecha);
    res.status(201).json(rows[0]);
  }
}

module.exports = new PuntuacionesController();