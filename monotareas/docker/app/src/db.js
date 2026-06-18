// vim: ft=javascript: ts=3: sw=3: noet:

import mariadb     from 'mariadb';
import _dp         from './debug-print.js';
import initialData from './initial-data.json' with { type: 'json'};


//
// Clase que controla mi instancia de MariaDB
//
class Driver {

	// ==> EL CONSTRUCTOR GUARDA LA CONFIGRACIÓN DE CONEXIÓN QUE SE PASA POR PARÁMETROS
	//         Y LANZA UNA LLAMADA PARA COMPROBAR EL ESQUEMA
	//
	constructor ({

		       password,
		       database,
		           host = 'localhost',
		           user = 'root',
		connectionLimit = 5,
		 bigIntAsNumber = false,
		...rest

	}){

		// guarda la configuración
		this.config={ password, database, host, user, connectionLimit, bigIntAsNumber, ...rest };

		_dp("La config en el constructor:", this.config);

		// comprobamos el esquema
		this.#checkSchema();
	}


	// ==> HELPERS PARA SIMPLIFICAR LA EJECUCIÓN DE CONSULTAS SQL
	//        (VER MÁS ADELANTE #query Y #execute) 

	// Función que devuelve un generador de conexiones (pool)
	// Es un singleton, así que una vez generado siempre devuelve la
	//     misma instancia
	#getPool () {
		return this.pool ?? (
			this.pool = mariadb.createPool(this.config)
		); 
	}


	async #getConnection () {
		return await (this.#getPool()).getConnection();
	}


	async #conn (handler) {
		let conn;
		let ret = undefined;

		try {
			conn = await this.#getConnection();
			ret  = await handler(conn);
		}
		catch (err) {
			console.error(`Error en la operación con la conexión: ${err}`);
		}
		finally {
			if (conn) {
				conn.end();
			}
		}

		return ret;
	}


	// ==> PARA HACER
	//        *   #query(sql)
	//               -> principal uso: SELECT
	//               -> devuelve rowset
	//
	//        * #execute(sql,param1,param2...)
	//               -> admite parametros que se escapan y sustityen los símbolos '?'
	//               -> principal use: INSERT INTO, UPDATE, DELETE FROM
	//               -> develve info sobre lo modificado
	//

	async query (sql) {
		return await this.#conn( async conn => await conn.query(sql) );
	}


	async execute (sql, ...params) {
		return await this.#conn( async conn => await conn.execute(sql, params) );
	}


	// ==> PARA CREAR UNA TAREA
	//
	
	async create (titulo) {
		return await this.execute('INSERT INTO tareas (titulo) VALUES (?);', titulo);
	}


	// ==> PARA CARGAR LOS DATOS INICIALES
	//

	async loadInitialData () {
		const ret = await Promise.all(
			initialData
				.map( x => x.titulo )
				.map( async t => await this.create(t) )
		);

		_dp("loadInitialData:", ret);

		return ret;
	}


	// ==> PARA COMPROBAR EL ESQUEMA Y CREARLO SI HICIERA FALTA
	//

	async #doCheckSchema () {
		const tablas = await this.query("SHOW TABLES LIKE 'tareas'");
		return ( tablas.length !== 0 );
	}


	async #createSchema () {
		await this.execute(`
   		CREATE TABLE tareas (
   		    id     INT          AUTO_INCREMENT PRIMARY KEY,
   		    titulo VARCHAR(255) NOT NULL
   		)    
   	`);
	}


	async #checkSchema () {
		if ( ! await this.#doCheckSchema() ) {
			await this.#createSchema();
			await this.loadInitialData();
		}
	}
}


// VAMOS A EXPORTAR UNA SERIE DE FUNCIONES QUE UTILIZAN UNA INSTANCIA
//     DE 'Driver' en CLOUSURE
	
// getAllTasks / getOneTask / createTask / resetTasks
//

export default ( function () {

	// CREAMOS UN OBJETO DRIVER QUE PASARÁ A SER EL QUE SIEMPRE USAREMOS PARA
	//      INTERACTUAR CON LA BASE DE DATOS MEDIANTE CLOUSURES.
	//
	// COMO PARÁMETROS AL CONSTRUCTOR LE PASAMOS LA CONFIGURACIÓN DE LA CONEXIÓN
	//      A LA BD, COGIENDO LOS DATOS DE VARIABLES DE ENTORNO
	//

	const theDriver = new Driver({
		database: process.env.MARIADB_DATABASE  ?? 'dbname',
		    user: process.env.MARIADB_USER      ?? 'root',
		password: process.env.MARIADB_PASSWORD  ?? 'secret',
		    host: process.env.DB_HOST           ?? 'localhost',
	});
	
	
	// DEVOLVEMOS UN OBJETO COMPESTO DE LAS FUNCIONES QUE QUEREMOS EXPORTAR
	//

	return {
		getAllTasks: async () => {
			return await theDriver.query("SELECT id, titulo FROM tareas;");
		},
	
		getOneTask: async (id) => {
			return await theDriver.execute("SELECT id, titulo FROM tareas WHERE id=?;", id);
		},
	
		createTask: async (titulo) => {
			return await theDriver.create(titulo);
		},
	
		resetTasks: async () => {
			const retDelete = await theDriver.execute("DELETE FROM tareas;");
			_dp("resetTasks:retDelete:", retDelete);

			const retLoad   = await theDriver.loadInitialData();
			_dp("resetTasks:retLoad:", retLoad);
	
			return [ retDelete, ...retLoad ];
		},
	};

}) ();


