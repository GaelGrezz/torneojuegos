jest.mock('../routes/helpers', () => ({
  callProcedure: jest.fn()
}));

const { callProcedure } = require('../routes/helpers');
const ReportesModel = require('../models/reportes');

describe('ReportesModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('invoca el procedimiento de clasificación', async () => {
    callProcedure.mockResolvedValue([]);

    await ReportesModel.getClassification(2);

    expect(callProcedure).toHaveBeenCalledWith('sp_mostrar_clasificacion', [2]);
  });

  test('invoca el procedimiento de estadísticas', async () => {
    callProcedure.mockResolvedValue([]);

    await ReportesModel.getStatistics();

    expect(callProcedure).toHaveBeenCalledWith('sp_obtener_estadisticas');
  });
});