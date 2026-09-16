const { callProcedure } = require('../routes/helpers');

class GenerosModel {
  async getAll() {
    return callProcedure('sp_consultar_generos');
  }

  async create(nombre) {
    return callProcedure('sp_registrar_genero', [nombre]);
  }

  async update(id, nombre) {
    return callProcedure('sp_modificar_genero', [id, nombre]);
  }

  async delete(id) {
    return callProcedure('sp_eliminar_genero', [id]);
  }
}

module.exports = new GenerosModel();