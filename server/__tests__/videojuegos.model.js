jest.mock('../routes/helpers', () => ({
  callProcedure: jest.fn()
}));

const { callProcedure } = require('../routes/helpers');
const VideojuegosModel = require('../models/videojuegos');

describe('VideojuegosModel', () => {
  test('invoca el procedimiento para registrar videojuegos', async () => {
    const rows = [{ id_registrado: 1 }];
    callProcedure.mockResolvedValue(rows);

    await expect(VideojuegosModel.create('Celeste', 'Plataformas')).resolves.toBe(rows);

    expect(callProcedure).toHaveBeenCalledWith('sp_registrar_videojuego', ['Celeste', 'Plataformas']);
  });
});