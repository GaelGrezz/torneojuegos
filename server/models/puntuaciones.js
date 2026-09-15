const { callProcedure } = require('../routes/helpers');

class PuntuacionesModel {
  async getClassification(videojuego) {
    return callProcedure('sp_mostrar_clasificacion', [videojuego || null]);
  }

  async create(jugadorId, videojuegoId, puntuacion, fecha) {
    return callProcedure('sp_registrar_puntuacion', [jugadorId, videojuegoId, puntuacion, fecha || null]);
  }
}

module.exports = new PuntuacionesModel();