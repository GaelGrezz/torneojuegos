jest.mock('../models/jugadores', () => ({
	getAll: jest.fn(),
	create: jest.fn(),
	search: jest.fn()
}));

const JugadoresModel = require('../models/jugadores');
const JugadoresController = require('../controllers/jugadores');

const createResponse = () => ({
	status: jest.fn().mockReturnThis(),
	json: jest.fn()
});

describe('JugadoresController', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('obtiene todos los jugadores', async () => {
		const rows = [{ GAMERTAG: 'purefootsoldier' }];
		const response = createResponse();
		JugadoresModel.getAll.mockResolvedValue(rows);

		await JugadoresController.getAll({}, response);

		expect(JugadoresModel.getAll).toHaveBeenCalledTimes(1);
		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.json).toHaveBeenCalledWith(rows);
	});

	test('crea un jugador y devuelve el primer resultado', async () => {
		const response = createResponse();
		const request = {
			body: {
				nombre: 'José Roberto Fuentes Salinas',
				alias: 'purefootsoldier',
				correo: 'jrofunsal@gmail.com'
			}
		};
		const result = { id_registrado: 1, mensaje: 'Jugador registrado exitosamente.' };
		JugadoresModel.create.mockResolvedValue([result]);

		await JugadoresController.create(request, response);

		expect(JugadoresModel.create).toHaveBeenCalledWith(
			request.body.nombre,
			request.body.alias,
			request.body.correo,
			undefined
		);
		expect(response.status).toHaveBeenCalledWith(201);
		expect(response.json).toHaveBeenCalledWith(result);
	});

	test('busca jugadores por criterio', async () => {
		const response = createResponse();
		const request = { query: { criterio: 'purefoot' } };
		const rows = [{ GAMERTAG: 'purefootsoldier' }];
		JugadoresModel.search.mockResolvedValue(rows);

		await JugadoresController.search(request, response);

		expect(JugadoresModel.search).toHaveBeenCalledWith('purefoot');
		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.json).toHaveBeenCalledWith(rows);
	});
});
