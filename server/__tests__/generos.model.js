jest.mock('../routes/helpers', () => ({
  callProcedure: jest.fn()
}));

const { callProcedure } = require('../routes/helpers');
const GenerosModel = require('../models/generos');

describe('GenerosModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('consulta géneros', async () => {
    await GenerosModel.getAll();
    expect(callProcedure).toHaveBeenCalledWith('sp_consultar_generos');
  });

  test('registra, modifica y elimina géneros', async () => {
    await GenerosModel.create('Plataformas');
    await GenerosModel.update(1, 'Aventura');
    await GenerosModel.delete(1);

    expect(callProcedure).toHaveBeenNthCalledWith(1, 'sp_registrar_genero', ['Plataformas']);
    expect(callProcedure).toHaveBeenNthCalledWith(2, 'sp_modificar_genero', [1, 'Aventura']);
    expect(callProcedure).toHaveBeenNthCalledWith(3, 'sp_eliminar_genero', [1]);
  });
});