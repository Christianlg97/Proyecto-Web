/**
 * WAIT-FOR-MYSQL.JS - Bloqueo de arranque del backend
 *
 * Se usa al iniciar el contenedor para asegurarse de que MySQL está aceptando conexiones
 * antes de continuar con la creación/verificación de tablas y el arranque del servidor.
 */

const mysql = require('mysql2/promise');

/**
 * Función de espera
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Secretos
const { readSecret } = require('./secrets.js');

/**
 * Espera a que MySQL esté disponible antes de continuar
 * Intenta conectar hasta 30 veces con intervalos de 2 segundos
 */
async function waitForMySQL() {
    console.log('Esperando a que MySQL esté listo...');
    
    const connectionConfig = {
        host: 'mysql',
        user: readSecret('mysql_user'),
        password: readSecret('mysql_password'),
        database: readSecret('mysql_database'),
        connectTimeout: 2000
    };

    let connected = false;
    let attempts = 0;
    const maxAttempts = 30;

    while (!connected && attempts < maxAttempts) {
        try {
            const connection = await mysql.createConnection(connectionConfig);
            await connection.ping();
            await connection.end();
            connected = true;
            console.log('MySQL está listo!');
        } catch (error) {
            attempts++;
            console.log(`Intento ${attempts}/${maxAttempts}: MySQL no está listo, esperando 2 segundos...`);
            await sleep(2000);
        }
    }

    if (!connected) {
        console.error('No se pudo conectar a MySQL después de varios intentos');
        process.exit(1);
    }
}

module.exports = waitForMySQL;
