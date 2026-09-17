jest.mock('../models/reportes', () => ({
  getClassification: jest.fn(),
  getStatistics: jest.fn()
}));

const ReportesModel = require('../models/reportes');
const ReportesController = require('../controllers/reportes');

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('ReportesController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('obtiene la clasificación del reporte', async () => {
    const request = { query: { id_videojuego: '2' } };
    const response = createResponse();
    const rows = [{ POSICION: 1, JUGADOR: 'purefootsoldier' }];
    ReportesModel.getClassification.mockResolvedValue(rows);

    await ReportesController.getClassification(request, response);

    expect(ReportesModel.getClassification).toHaveBeenCalledWith(2);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(rows);
  });

  test('obtiene las estadísticas del sistema', async () => {
    const response = createResponse();
    const statistics = { total_jugadores: 5, total_videojuegos: 3 };
    ReportesModel.getStatistics.mockResolvedValue([statistics]);

    await ReportesController.getStatistics({}, response);

    expect(ReportesModel.getStatistics).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(statistics);
  });
});