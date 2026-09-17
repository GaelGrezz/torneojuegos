const { callProcedure } = require('../routes/helpers');

class JugadoresModel {
    async getAll() {
        return callProcedure('sp_consultar_jugadores');
    }

    async search(criterio) {
        return callProcedure('sp_buscar_jugadores', [criterio]);
    }

    async create(nombre, alias, correo) {
        return callProcedure('sp_registrar_jugador', [nombre, alias, correo]);
    }

    async update(id, nombre, alias, correo) {
        return callProcedure('sp_modificar_jugador', [id, nombre, alias, correo]);
    }

    async delete(id) {
        return callProcedure('sp_eliminar_jugador', [id]);
    }
}

module.exports = new JugadoresModel();