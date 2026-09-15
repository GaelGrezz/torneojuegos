const { callProcedure } = require('../routes/helpers');

class JugadoresModel {
    async getAll() {
        return callProcedure('sp_consultar_jugadores');
    }

    async create(nombre, alias, correo, fechaRegistro) {
        return callProcedure('sp_registrar_jugador', [nombre, alias, correo, fechaRegistro || null]);
    }

    async search(criterio) {
        return callProcedure('sp_buscar_jugadores', [criterio]);
    }
}

module.exports = new JugadoresModel();