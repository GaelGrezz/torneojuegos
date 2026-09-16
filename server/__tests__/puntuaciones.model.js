jest.mock('../routes/helpers', () => ({
  callProcedure: jest.fn()
}));

const { callProcedure } = require('../routes/helpers');
const PuntuacionesModel = require('../models/puntuaciones');

describe('PuntuacionesModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('consulta la clasificación con el videojuego indicado', async () => {
    callProcedure.mockResolvedValue([]);

    await PuntuacionesModel.getClassification('Celeste');

    expect(callProcedure).toHaveBeenCalledWith('sp_mostrar_clasificacion', ['Celeste']);
  });

  test('usa null cuando no se filtra la clasificación', async () => {
    callProcedure.mockResolvedValue([]);

    await PuntuacionesModel.getClassification();

    expect(callProcedure).toHaveBeenCalledWith('sp_mostrar_clasificacion', [null]);
  });

  test('invoca el procedimiento para registrar puntuaciones', async () => {
    callProcedure.mockResolvedValue([]);

    await PuntuacionesModel.create(1, 2, 95, '2026-09-16');

    expect(callProcedure).toHaveBeenCalledWith(
      'sp_registrar_puntuacion',
      [1, 2, 95, '2026-09-16']
    );
  });
});