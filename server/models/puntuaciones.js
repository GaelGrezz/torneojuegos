const { callProcedure } = require('../routes/helpers');

class PuntuacionesModel {
  async getAll() {
    return callProcedure('sp_consultar_puntuaciones');
  }

  async create(jugadorId, videojuegoId, puntuacion) {
    return callProcedure('sp_registrar_puntuacion', [jugadorId, videojuegoId, puntuacion]);
  }

  async update(id, puntuacion) {
    return callProcedure('sp_modificar_puntuacion', [id, puntuacion]);
  }

  async delete(id) {
    return callProcedure('sp_eliminar_puntuacion', [id]);
  }
}

module.exports = new PuntuacionesModel();