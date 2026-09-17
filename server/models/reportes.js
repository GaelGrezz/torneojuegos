const { callProcedure } = require('../routes/helpers');

class ReportesModel {
  async getClassification(idVideojuego) {
    return callProcedure('sp_mostrar_clasificacion', [idVideojuego || null]);
  }

  async getStatistics() {
    return callProcedure('sp_obtener_estadisticas');
  }
}

module.exports = new ReportesModel();