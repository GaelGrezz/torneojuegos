const { callProcedure } = require('../routes/helpers');

class ReportesModel {
  async getClassification(videojuego) {
    return callProcedure('sp_mostrar_clasificacion', [videojuego || null]);
  }

  async getStatistics() {
    return callProcedure('sp_obtener_estadisticas');
  }
}

module.exports = new ReportesModel();