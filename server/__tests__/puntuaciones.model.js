jest.mock('../routes/helpers', () => ({
  callProcedure: jest.fn()
}));

const { callProcedure } = require('../routes/helpers');
const PuntuacionesModel = require('../models/puntuaciones');

describe('PuntuacionesModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('consulta todas las puntuaciones', async () => {
    callProcedure.mockResolvedValue([]);

    await PuntuacionesModel.getAll();

    expect(callProcedure).toHaveBeenCalledWith('sp_consultar_puntuaciones');
  });

  test('invoca el procedimiento para registrar puntuaciones', async () => {
    callProcedure.mockResolvedValue([]);

    await PuntuacionesModel.create(1, 2, 95);

    expect(callProcedure).toHaveBeenCalledWith(
      'sp_registrar_puntuacion',
      [1, 2, 95]
    );
  });
});