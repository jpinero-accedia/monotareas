// vim: ft=javascript: ts=3: sw=3: noet:

import express from 'express';
import DB      from './db.js';

const app=express();
const PORT=3000;


// middleware de JSON
app.use(express.json());


// RUTAS
// app.get('/', (req,res) => {
// 	res.send("HOLA!!");
// });

app.get('/tareas', async (req,res) => {
	res.json(await DB.getAll());
} );


app.listen(PORT, '0.0.0.0', () => {
	console.log(`Servidor express arrancado en el puerto ${PORT}.`);
});
