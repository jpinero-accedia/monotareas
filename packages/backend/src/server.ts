// vim: ft=typescript: ts=3: sw=3: noet:


import express, { type Response } from 'express';
import cors                       from 'cors';
import DB                         from './db.js';
import _dp                        from './debug-print.js';


// Configura si imprimimos información de debug o no
_dp.enable();


// ===> MIDDLEWARE

const app = express();


// middleware para permitir peticiones desde otros orígenes (el cliente web)
app.use(cors());


// middleware para poder devolver JSON
app.use(express.json());


// middleware para transformar bigInt en string al convertir a JSON
app.set('json replacer', (key: string, value: unknown): string | unknown =>
	typeof value === 'bigint' ? value.toString() : value
);


// ===> RUTAS


// GET /tareas => GET ALL TASKS
//
app.get('/tareas', async (req, res): Promise<Response> => {
	const data = await DB.getAllTasks();

	if ( data === undefined ) {
		return res.status(500).json({
			status:   500,
			errorMsg: "Error al obtener las tareas",
		});
	}

	return res.json( data );
});


// GET /tareas/id => GET ONE TASKS
//
app.get('/tareas/:tid', async (req, res): Promise<Response> => {
	const data = await DB.getOneTask( req.params.tid );

	if ( data === undefined ) {
		return res.status(500).json({
			status:   500,
			errorMsg: "Error al obtener la tarea",
		});
	}
	if ( data.length === 0 ) {
		return res.status(404).json({
			status:   404,
			errorMsg: `Tarea con id '${req.params.tid}' no encontrada`,
		});
	}

	return res.json( data );
});


// POST /tareas => CREATE A TASK
//
app.post('/tareas', async (req, res): Promise<Response> => {
	let ret: Response;

	if (req.body.titulo) {
		_dp("Hay campo 'titulo' al intentar crear una nueva tarea => BIEN ");

		const data = await DB.createTask( req.body.titulo )

		_dp("Lo que devuelve 'createTask':", data);

		ret = res.json( data );
	}
	else {
		_dp("No hay campo 'titulo' al intentar crear una nueva tarea => MAL ");

		ret = res.status(500).json( {
			status: 500,
			errorMsg: "Se necesita un campo 'titulo' para poder insertar una tarea",
			request: req.body,
		} );
	}

	return ret;
});


// PATCH /tareas/:tid => MARK A TASK AS DONE/PENDING
//
app.patch('/tareas/:tid', async (req, res): Promise<Response> => {
	let ret: Response;

	if (typeof req.body.completada === 'boolean') {
		const data = await DB.setTaskCompletada( req.params.tid, req.body.completada );

		_dp("Lo que devuelve 'setTaskCompletada':", data);

		ret = res.json( data );
	}
	else {
		ret = res.status(500).json( {
			status: 500,
			errorMsg: "Se necesita un campo 'completada' (boolean) para actualizar la tarea",
			request: req.body,
		} );
	}

	return ret;
});


// DELETE /tareas/:tid => DELETE A TASK
//
app.delete('/tareas/:tid', async (req, res): Promise<Response> => {
	const data = await DB.deleteTask( req.params.tid );

	if ( data === undefined ) {
		return res.status(500).json({
			status:   500,
			errorMsg: "Error al borrar la tarea",
		});
	}

	return res.json( data );
});


// POST /reset => DELETE ALL TASKS AND RECREATE THE INITIAL DATA
//
app.post('/reset', async (req, res): Promise<Response> => {
	const data = await DB.resetTasks();

	if ( data === undefined ) {
		return res.status(500).json({
			status:   500,
			errorMsg: "Error al resetear las tareas",
		});
	}

	return res.json( data );
});


// Ponemos la app a escuchar por el puerto 3000 en cualquier ip
app.listen(3000, '0.0.0.0', (): void => {
	_dp("Servidor express arrancado en el puerto 3000.");
});
