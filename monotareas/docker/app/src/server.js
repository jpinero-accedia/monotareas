import express from 'express';

import { initDb } from './db.js';

const app=express();

const PORT=3000;

app.get('/', (req,res) => {
	res.send("HOLA!!");
});

app.listen(PORT, '0.0.0.0', () => {
	console.log(`Servidor express arrancado en el puerto ${PORT}.`);
});
