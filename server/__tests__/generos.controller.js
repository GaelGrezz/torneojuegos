jest.mock('../models/generos', () => ({
  getAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

const GenerosModel = require('../models/generos');
const GenerosController = require('../controllers/generos');

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('GenerosController', () => {
  beforeEach(() => jest.clearAllMocks());

  test('consulta géneros', async () => {
    const rows = [{ ID: 1, GENERO: 'plataformas' }];
    const response = createResponse();
    GenerosModel.getAll.mockResolvedValue(rows);

    await GenerosController.getAll({}, response);

    expect(GenerosModel.getAll).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(rows);
  });

  test('registra un género', async () => {
    const response = createResponse();
    const result = { id_registrado: 1 };
    GenerosModel.create.mockResolvedValue([result]);

    await GenerosController.create({ body: { nombre: 'Plataformas' } }, response);

    expect(GenerosModel.create).toHaveBeenCalledWith('Plataformas');
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(result);
  });
});