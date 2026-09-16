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
				request.body.correo
		);
		expect(response.status).toHaveBeenCalledWith(201);
		expect(response.json).toHaveBeenCalledWith(result);
	});

	test('actualiza un jugador', async () => {
		const response = createResponse();
		const request = {
			params: { id: 1 },
			body: {
				nombre: 'José Roberto Fuentes Salinas',
				alias: 'purefootsoldier',
				correo: 'jrofunsal@gmail.com'
			}
		};
		const result = { mensaje: 'Jugador actualizado exitosamente.' };
		JugadoresModel.update = jest.fn().mockResolvedValue([result]);

		await JugadoresController.update(request, response);

		expect(JugadoresModel.update).toHaveBeenCalledWith(
			1,
			request.body.nombre,
			request.body.alias,
			request.body.correo
		);
		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.json).toHaveBeenCalledWith(result);
	});
});
