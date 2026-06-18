// vim: ft=javascript: ts=3: sw=3: noet:

import mariadb from 'mariadb';

import initialData from './initial-data.json' with { type: 'json' };


export const fxs = {};


class Driver {
	constructor (indata) {
		const defdata = {
			host:            'localhost',
			user:            'root',
			password:        undefined,
			database:        undefined,
			connectionLimit: 5
		};

		this.config = Object.fromEntries(
			Object.entries({ ...defdata, ...indata })
				.filter( ( [k] ) => k in defdata )
		);
	}


	#getPool () {
		return this.pool ?? (
			this.pool = mariadb.createPool(this.config)
		);
	}


	async #getConnection () {
		return await this.#getPool().getConnection();
	}


	async #conn ( handler ) {
		let conn;
		let ret = undefined;
		
		try {
			ret = await handler(conn);
		}
		catch (err) {
			console.error(`La operación con la conexión falló: ${err}`);
		}
		finally {
			if (conn) {
				conn.end();
			}
		}

		return ret;
	}


	async query (sql) {
		return await this.#conn(
			async conn => await conn.query(sql)
		);
	}

	async execute (sql, params=[]) {
		return await this.#conn(
			async conn => await conn.execute(sql, params)
		);
	}


	async #createSchema () {
		await this.query(`
			CREATE TABLE tareas (
				id     INT          AUTO_INCREMENT PRIMARY KEY,
				titulo VARCHAR(255) NOT NULL
			);
		`);
	}


	async initialiseData () {
		await this.#conn(
			async conn => {
				await initialData
					.map( e => e.titulo )
					.forEach( async titulo => await fxs.dbInsertData(titulo) )
			}
		);
	}


	async #doCheckSchema () {
		const tablas = await this.query("SHOW TABLES LIKE 'tareas';");
		return ( tablas.length !== 0 );
	}


	async checkSchema () {
		if ( ! await this.#doCheckSchema() ) {
			console.log("No existe el esquema de la base de datos.");

			// Lo creamos
			await this.#createSchema();

			// Añadimos los datos de inicio
			await this.initialiseData();
		}
	}


	async deleteAll () {
		return await this.execute('DELETE FROM tareas;');
	}
}


// Creamos un driver global
const theDriver = new Driver({
	host:     process.env.DB_HOST               || 'localhost',
	user:     process.env.MARIADB_USER          || 'root',
	password: process.env.MARIADB_USER_PASSWORD || 'secret',
	database: process.env.MARIADB_DATABASE      || 'tareasdb',
});


// Funciones que el modulo exporta
fxs.dbGetAll = async function () {
	return await this.query('SELECT id, titulo FROM tareas;');
}


fxs.dbGetOne = async function (id) {
	return await this.query(`SELECT id, titulo FROM tareas WHERE id=${id};`);
}


fxs.dbInsertData = async function (titulo) {
	return await this.execute(`INSERT INTO tareas (titulo) VALUES ("${titulo}")`);
}


fxs.dbReset = async function () {
	const ret = await this.deleteAll();

	await this.initialiseData();

	return ret;
}


// con el driver global, comprobamos si hay esquema o tenemos que recrearlo
(function () {
	await theDriver.checkSchema();
}) ();


// Exportamos nuestro objeto por defecto
export default fxs;
