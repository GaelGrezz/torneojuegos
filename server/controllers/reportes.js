const ReportesModel = require('../models/reportes');

class ReportesController {
  async getClassification(req, res) {
    const idVideojuego = req.query.id_videojuego ? Number(req.query.id_videojuego) : null;
    const rows = await ReportesModel.getClassification(idVideojuego);
    res.status(200).json(rows);
  }

  async getStatistics(req, res) {
    const rows = await ReportesModel.getStatistics();
    res.status(200).json(rows[0]);
  }
}

module.exports = new ReportesController();