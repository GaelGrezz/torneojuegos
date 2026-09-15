const { callProcedure } = require('../routes/helpers');

class VideojuegosModel {
  async create(nombre, genero) {
    return callProcedure('sp_registrar_videojuego', [nombre, genero]);
  }
}

module.exports = new VideojuegosModel();