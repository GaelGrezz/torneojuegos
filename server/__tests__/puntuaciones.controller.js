jest.mock('../models/puntuaciones', () => ({
  getClassification: jest.fn(),
  create: jest.fn()
}));

const PuntuacionesModel = require('../models/puntuaciones');
const PuntuacionesController = require('../controllers/puntuaciones');

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('PuntuacionesController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('obtiene la clasificación filtrada por videojuego', async () => {
    const request = { query: { videojuego: 'Celeste' } };
    const response = createResponse();
    const rows = [{ JUGADOR: 'purefootsoldier', PUNTUACIÓN: 95 }];
    PuntuacionesModel.getClassification.mockResolvedValue(rows);

    await PuntuacionesController.getAll(request, response);

    expect(PuntuacionesModel.getClassification).toHaveBeenCalledWith('Celeste');
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(rows);
  });

  test('registra una puntuación', async () => {
    const request = {
      body: { id_jugador: 1, id_videojuego: 2, puntuacion: 95, fecha: '2026-09-16' }
    };
    const response = createResponse();
    const result = { estatus: 1, id_puntuacion: 3 };
    PuntuacionesModel.create.mockResolvedValue([result]);

    await PuntuacionesController.create(request, response);

    expect(PuntuacionesModel.create).toHaveBeenCalledWith(1, 2, 95, '2026-09-16');
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(result);
  });
});