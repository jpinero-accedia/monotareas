// vim: ft=javascript: ts=3: sw=3: noet:


import express from 'express';
import DB      from './db.js';
import _dp     from './debug-print.js';


// Configura si imprimimos información de debug o no
_dp.disable();


// ===> MIDDLEWARE

const app=express();


// middleware para poder devolver JSON
app.use(express.json());


// middleware para transformar bigInt en string al convertir a JSON
app.set('json replacer', (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
);


// ===> RUTAS


// GET /tareas => GET ALL TASKS
//
app.get('/tareas', async (req,res) => {
	res.json(
		await DB.getAllTasks()
	);
});


// GET /tareas/id => GET ONE TASKS
//
app.get('/tareas/:tid', async (req,res) => {
	res.json(
		await DB.getOneTask( req.params.tid )
	);
});


// POST /tareas => CREATE A TASK
//
app.post('/tareas', async (req,res) => {
	let ret;

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


// POST /reset => DELETE ALL TASKS AND RECREATE THE INITIAL DATA
//
app.post('/reset', async (req,res) => {
	res.json(
		await DB.resetTasks()
	);
});


// Ponemos la app a escuchar por el puerto 3000 en cualquier ip
app.listen(3000, '0.0.0.0', () => {
	_dp("Servidor express arrancado en el puerto 3000.");
});

