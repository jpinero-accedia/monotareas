import mariadb     from 'mariadb';
import initialData from './initial-data.json' with { type: 'json'};

const POOL = mariadb.createPool({
    host:            process.env.DB_HOST     || 'localhost',
    user:            process.env.DB_USER     || 'root',
    password:        process.env.DB_PASSWORD || 'secret',
    database:        process.env.DB_NAME     || 'tareasdb',
    connectionLimit: 5
});

async function getConnection () {
    return await POOL.getConnection();
}

async function initData () {
    let conn;

    console.log("====> Cargando datos iniciales.");

    try {
        conn = await getConnection();

        const xformData = initialData
            .map( x => x.titulo )
            .forEach( async titulo => {
                await conn.query(`INSERT INTO tareas (titulo) VALUES ("${titulo}")`);
            });
    }
    catch (err) {
        console.err(`Error al insertar datos de inicio: ${err}`);
    }
    finally {
        if (conn) {
            conn.end();
        }
    }
}

export async function initDb () {
    let conn;

    console.log('===> Comprobando si el esquema de la DB existe.');

    try {
                conn = await getConnection();
        const tablas = await conn.query("SHOW TABLES LIKE 'tareas'");

        if (tablas.length === 0) {
            console.log('No existe el esquema de la DB!!! --> A CREARLO');

            await conn.query(`
                CREATE TABLE tareas (
                    id     INT          AUTO_INCREMENT PRIMARY KEY,
                    titulo VARCHAR(255) NOT NULL
                )    
            `);

            await initData();
        }
        else {
            console.log('Esquema de la DB ya estaba creado.');
        }
    }
    catch (err) {
        console.err(`Error al verificar o crear esquema: ${err}`);
    }
    finally {
        if (conn) {
            conn.end();
        }
    }
}

