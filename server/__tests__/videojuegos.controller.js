jest.mock('../models/videojuegos', () => ({
  create: jest.fn()
}));

const VideojuegosModel = require('../models/videojuegos');
const VideojuegosController = require('../controllers/videojuegos');

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('VideojuegosController', () => {
  test('crea un videojuego', async () => {
    const request = { body: { nombre: 'Celeste', genero: 'Plataformas' } };
    const response = createResponse();
    const result = { id_registrado: 1, mensaje: 'Videojuego registrado exitosamente.' };
    VideojuegosModel.create.mockResolvedValue([result]);

    await VideojuegosController.create(request, response);

    expect(VideojuegosModel.create).toHaveBeenCalledWith('Celeste', 'Plataformas');
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(result);
  });
});