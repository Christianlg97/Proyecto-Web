/**
 * SYNC_BD_TO_SQL.JS - Sincronización BD -> SQL (usuarios)
 *
 * Lee la tabla users desde MySQL y regenera el archivo /mysql/02-insertar.sql.
 * Este archivo SQL se usa como snapshot (por ejemplo, para inicialización/backup).
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Secretos
const { readSecret } = require('./secrets.js');

/**
 * Sincroniza la base de datos con un archivo SQL
 * Lee todos los usuarios de la BD y genera un archivo INSERT
 * @returns {Promise<boolean>} - True si la operación fue exitosa
 */
async function syncBDtoSQL() {
    console.log('='.repeat(60));
    console.log('SINCRONIZANDO BD A ARCHIVO SQL');
    console.log('='.repeat(60));
    
    try {
        // Conectar a MySQL
        const connection = await mysql.createConnection({
            host: readSecret('mysql_host'),
            user: readSecret('mysql_user'),
            password: readSecret('mysql_password'),
            database: readSecret('mysql_database'),
        });

        const databaseName = readSecret('mysql_database');

        // Obtener todos los nombres de columna de la tabla users
        const [columnsRows] = await connection.query(
            'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION',
            [databaseName, 'users']
        );

        const excludedColumns = ['token', 'token_expires'];
        const columns = columnsRows
            .map(row => row.COLUMN_NAME)
            .filter(column => !excludedColumns.includes(column));

        if (columns.length === 0) {
            throw new Error('No se encontraron columnas válidas en la tabla users');
        }

        const columnList = columns.map(name => `\`${name}\``).join(', ');

        // Obtener todos los usuarios de la BD ordenados por ID
        const [users] = await connection.query(
            `SELECT ${columns.map(name => `\`${name}\``).join(', ')} FROM users ORDER BY id`
        );

        console.log(`Usuarios en BD: ${users.length}`);

        // Ruta del archivo SQL (montada desde ./mysql o carpeta local de repositorio)
        const sqlPath = fs.existsSync('/mysql')
            ? '/mysql/02-insertar.sql'
            : path.join(__dirname, '..', 'mysql', '02-insertar.sql');

        // Generar contenido SQL
        let contenido = '-- Insertar usuarios (generado automáticamente desde BD)\n';
        contenido += `-- Fecha: ${new Date().toLocaleString()}\n`;
        contenido += `-- Total usuarios: ${users.length}\n\n`;
        contenido += 'USE appweb;\n\n';
        contenido += `INSERT INTO users (${columnList}) VALUES\n`;

        users.forEach((user, index) => {
            const coma = index < users.length - 1 ? ',' : ';';
            const values = columns.map(column => {
                const value = user[column];
                if (value === null || value === undefined) {
                    return 'NULL';
                }
                return connection.escape(value);
            }).join(', ');
            contenido += `(${values})${coma}\n`;
        });

        // Guardar archivo
        fs.writeFileSync(sqlPath, contenido);
        console.log(`Archivo SQL actualizado: ${sqlPath}`);
        console.log(`Usuarios guardados: ${users.length}`);

        // Mostrar preview de los primeros 3 usuarios
        console.log('\nPrimeros 3 usuarios:');
        users.slice(0, 3).forEach(u => {
            console.log(`   - ${u.username} (${columns.map(c => `${c}=${u[c]}`).join(', ')})`);
        });

        await connection.end();
        console.log('='.repeat(60));
        return true;
        
    } catch (error) {
        console.error('Error sincronizando:', error);
        return false;
    }
}

// Si se ejecuta directamente
if (require.main === module) {
    syncBDtoSQL().then(() => process.exit());
}

module.exports = syncBDtoSQL;
