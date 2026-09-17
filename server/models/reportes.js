const { callProcedure } = require('../routes/helpers');

class ReportesModel {
  async getClassification() {
    return callProcedure('sp_consultar_puntuaciones');
  }

  async getStatistics() {
    return callProcedure('sp_obtener_estadisticas');
  }
}

module.exports = new ReportesModel();