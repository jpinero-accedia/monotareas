// vim: ft=typescript: ts=3: sw=3: noet:

import mariadb, { type Pool, type PoolConnection, type UpsertResult } from 'mariadb';
import _dp         from './debug-print.js';
import initialData from './initial-data.json' with { type: 'json' };


export interface Tarea {
	id:         number;
	titulo:     string;
	completada: boolean;
}

interface DriverConfig {
	password:         string;
	database:         string;
	host?:            string;
	user?:            string;
	connectionLimit?: number;
	bigIntAsNumber?:  boolean;
	[key: string]:    unknown;
}


//
// Clase que controla mi instancia de MariaDB
//
class Driver {

	private config: DriverConfig;
	private pool?:  Pool;

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

	}: DriverConfig) {

		// guarda la configuración
		this.config = { password, database, host, user, connectionLimit, bigIntAsNumber, ...rest };

		_dp("La config en el constructor:", this.config);

		// comprobamos el esquema
		this._checkSchema();
	}


	// ==> HELPERS PARA SIMPLIFICAR LA EJECUCIÓN DE CONSULTAS SQL
	//        (VER MÁS ADELANTE #query Y #execute)

	// Función que devuelve un generador de conexiones (pool)
	// Es un singleton, así que una vez generado siempre devuelve la
	//     misma instancia
	private _getPool (): Pool {
		return this.pool ?? (
			this.pool = mariadb.createPool(this.config)
		);
	}


	private async _getConnection (): Promise<PoolConnection> {
		return await (this._getPool()).getConnection();
	}


	private async _conn<T> (handler: (conn: PoolConnection) => Promise<T>): Promise<T | undefined> {
		let conn: PoolConnection | undefined;
		let ret: T | undefined = undefined;

		try {
			conn = await this._getConnection();
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

	async query<T = unknown> (sql: string, ...params: unknown[]): Promise<T[] | undefined> {
		return await this._conn<T[]>( async conn => await conn.query(sql, params) );
	}


	async execute (sql: string, ...params: unknown[]): Promise<UpsertResult[] | undefined> {
		const result: UpsertResult | undefined = await this._conn<UpsertResult>( async conn => await conn.execute(sql, params) );
		return result !== undefined ? [result] : undefined;
	}


	// ==> PARA CREAR UNA TAREA
	//

	async create (titulo: string): Promise<UpsertResult[] | undefined> {
		return await this.execute('INSERT INTO tareas (titulo) VALUES (?);', titulo);
	}


	// ==> PARA BORRAR UNA TAREA
	//

	async remove (id: string | number): Promise<UpsertResult[] | undefined> {
		return await this.execute('DELETE FROM tareas WHERE id=?;', id);
	}


	// ==> PARA MARCAR UNA TAREA COMO COMPLETADA O PENDIENTE
	//

	async setCompletada (id: string | number, completada: boolean): Promise<UpsertResult[] | undefined> {
		return await this.execute('UPDATE tareas SET completada=? WHERE id=?;', completada, id);
	}


	// ==> PARA CARGAR LOS DATOS INICIALES
	//

	async loadInitialData (): Promise<(UpsertResult[] | undefined)[]> {
		const ret: (UpsertResult[] | undefined)[] = await Promise.all(
			(initialData as Array<Omit<Tarea, 'id'>>)
				.map( x => x.titulo )
				.map( async t => await this.create(t) )
		);

		_dp("loadInitialData:", ret);

		return ret;
	}


	// ==> PARA COMPROBAR EL ESQUEMA Y CREARLO SI HICIERA FALTA
	//

	private async _doCheckSchema (): Promise<boolean> {
		const tablas = await this.query<string>("SHOW TABLES LIKE 'tareas'");
		return Array.isArray(tablas) && tablas.length > 0;
	}


	private async _createSchema (): Promise<void> {
		await this.execute(`
   		CREATE TABLE tareas (
   		    id         INT          AUTO_INCREMENT PRIMARY KEY,
   		    titulo     VARCHAR(255) NOT NULL,
   		    completada BOOLEAN      NOT NULL DEFAULT FALSE
   		)
   	`);
	}


	private async _checkSchema (): Promise<void> {
		if ( ! await this._doCheckSchema() ) {
			await this._createSchema();
			await this.loadInitialData();
		}
	}
}


// VAMOS A EXPORTAR UNA SERIE DE FUNCIONES QUE UTILIZAN UNA INSTANCIA
//     DE 'Driver' en CLOUSURE

// getAllTasks / getOneTask / createTask / deleteTask / setTaskCompletada / resetTasks
//

export interface DbApi {
	getAllTasks:      ()                                    => Promise<Tarea[]        | undefined>;
	getOneTask:       (id: string)                          => Promise<Tarea[]        | undefined>;
	createTask:       (titulo: string)                      => Promise<UpsertResult[] | undefined>;
	deleteTask:       (id: string)                          => Promise<UpsertResult[] | undefined>;
	setTaskCompletada:(id: string, completada: boolean)     => Promise<UpsertResult[] | undefined>;
	resetTasks:       ()                                    => Promise<UpsertResult[] | undefined>;
}

export default ( function (): DbApi {

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
		getAllTasks: async (): Promise<Tarea[] | undefined> => {
			return await theDriver.query<Tarea>("SELECT id, titulo, completada FROM tareas;");
		},

		getOneTask: async (id: string): Promise<Tarea[] | undefined> => {
			return await theDriver.query<Tarea>("SELECT id, titulo, completada FROM tareas WHERE id=?;", id);
		},

		createTask: async (titulo: string): Promise<UpsertResult[] | undefined> => {
			return await theDriver.create(titulo);
		},

		deleteTask: async (id: string): Promise<UpsertResult[] | undefined> => {
			return await theDriver.remove(id);
		},

		setTaskCompletada: async (id: string, completada: boolean): Promise<UpsertResult[] | undefined> => {
			return await theDriver.setCompletada(id, completada);
		},

		resetTasks: async (): Promise<UpsertResult[] | undefined> => {
			const retDelete: UpsertResult[] | undefined = await theDriver.execute("DELETE FROM tareas;");
			_dp("resetTasks:retDelete:", retDelete);

			if ( retDelete === undefined ) return undefined;

			const retLoad: (UpsertResult[] | undefined)[] = await theDriver.loadInitialData();
			_dp("resetTasks:retLoad:", retLoad);

			if ( retLoad.some(r => r === undefined) ) return undefined;

			return [ ...retDelete, ...retLoad.flatMap(r => r!) ];
		},
	};

}) ();
