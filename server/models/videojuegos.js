const { callProcedure } = require('../routes/helpers');

class VideojuegosModel {
  async getAll() {
    return callProcedure('sp_consultar_videojuegos');
  }

  async create(nombre, generoId) {
    return callProcedure('sp_registrar_videojuego', [nombre, generoId || null]);
  }

  async update(id, nombre, generoId) {
    return callProcedure('sp_modificar_videojuego', [id, nombre, generoId || null]);
  }

  async delete(id) {
    return callProcedure('sp_eliminar_videojuego', [id]);
  }
}

module.exports = new VideojuegosModel();