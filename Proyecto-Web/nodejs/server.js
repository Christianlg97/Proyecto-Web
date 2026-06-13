/**
 * SERVER.JS - Backend (API) del Sistema de Gestión de Archivos
 *
 * Responsabilidades principales:
 * - Autenticación (registro/login) con tokens temporales
 * - Gestión de archivos por usuario (subida, listado, descarga, previsualización, mover, borrar)
 * - Funciones de administración (navegar archivos de otros usuarios, cambiar contraseña, borrar usuarios)
 * - Enlaces compartidos (tokens públicos con expiración opcional)
 *
 * Notas de despliegue:
 * - Se ejecuta detrás de Nginx, que proxya /api/* hacia este servidor
 * - El directorio /home dentro del contenedor se monta desde ./users (docker-compose.yml)
 */

const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');
const archiver = require('archiver');
const Throttle = require('throttle');

// Importar scripts auxiliares
const waitForMySQL = require('./wait-for-mysql');
const syncBDtoSQL = require('./sync_bd_to_sql');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Secretos
const { readSecret } = require('./secrets.js');

// ========== NUEVA DEFINICIÓN DE PERMISOS (granular) ==========
// Permisos basados en bitmask en formato hexadecimal para combinar privilegios mediante operaciones bitwise (&, |)
const PERMISSIONS = {
    // Permisos base (bits bajos)
    LOGIN:              0x00000001, // 1      - Permite iniciar sesión
    ADMIN:              0x00000002, // 2      - Permite ver archivos de otros usuarios (listar, previsualizar, descargar)
    SUPERADMIN:         0x00000004, // 4      - Permite acceder al panel de administración (listado de usuarios, etc.)
    FILE_MANAGER:       0x00000008, // 8      - Permite acceder al Gestor de Archivos (básico)

    // Nuevos permisos granulares (administración)
    MANAGE_USERS_STATUS:    0x00000010, // 16   - Activar/desactivar/bannear usuarios
    MANAGE_USER_LIMITS:     0x00000020, // 32   - Modificar cuotas, límites de archivo, ancho de banda
    KICK_USERS:             0x00000040, // 64   - Invalidar sesión de otros usuarios
    CHANGE_ANY_PASSWORD:    0x00000080, // 128  - Cambiar contraseña de cualquier usuario (excepto superadmin)
    DELETE_USERS:           0x00000100, // 256  - Eliminar usuarios
    MANAGE_IPS:             0x00000200, // 512  - Banear/desbanear direcciones IP
    MANAGE_GLOBAL_SETTINGS: 0x00000400  // 1024 - Modificar configuración global
};

// Máscara con TODOS los permisos (para el usuario admin inicial)
const ALL_PERMISSIONS = Object.values(PERMISSIONS).reduce((a, b) => a | b, 0);

// Compatibilidad con el modelo de roles antiguo (para no romper código)
const ROLE = {
    USER: PERMISSIONS.LOGIN,
    ADMIN: PERMISSIONS.ADMIN,
    SUPERADMIN: PERMISSIONS.SUPERADMIN
};

const ROLE_NAME = {
    [ROLE.USER]: 'user',
    [ROLE.USER | ROLE.ADMIN]: 'admin',
    [ROLE.USER | ROLE.ADMIN | ROLE.SUPERADMIN]: 'superadmin'
};

function normalizeRoleMask(mask) {
    const parsed = parseInt(mask, 10);
    const normalized = Number.isNaN(parsed) ? PERMISSIONS.LOGIN : parsed;
    return normalized | PERMISSIONS.LOGIN;
}

function hasRole(mask, role) {
    return (normalizeRoleMask(mask) & role) !== 0;
}

function roleMaskFromBooleans(isAdmin, isSuperadmin) {
    let mask = PERMISSIONS.LOGIN;
    if (isAdmin) mask |= PERMISSIONS.ADMIN;
    if (isSuperadmin) mask |= PERMISSIONS.SUPERADMIN;
    return mask;
}

function roleFlagsFromMask(mask) {
    const normalized = normalizeRoleMask(mask);
    return {
        role_mask: normalized,
        is_admin: hasRole(normalized, PERMISSIONS.ADMIN),
        is_superadmin: hasRole(normalized, PERMISSIONS.SUPERADMIN),
        role_name: ROLE_NAME[normalized] || 'custom'
    };
}

function normalizeClientIp(ip) {
    if (!ip) return null;
    const cleaned = ip.split(',')[0].trim();
    if (!cleaned) return null;
    if (cleaned === '127.0.0.1' || cleaned === '::1' || cleaned === '::ffff:127.0.0.1') {
        return null;
    }
    return cleaned.startsWith('::ffff:') ? cleaned.replace('::ffff:', '') : cleaned;
}

/**
 * Función principal que inicia el servidor después de conectar con MySQL
 */
async function startServer() {
    // Esperar a que MySQL esté listo
    await waitForMySQL();

    // Configuración de MySQL con pool de conexiones
    const pool = mysql.createPool({
        host: readSecret('mysql_host'),
        user: readSecret('mysql_user'),
        password: readSecret('mysql_password'),
        database: readSecret('mysql_database'),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    const promisePool = pool.promise();
    // Helpers para estandarizar verificaciones/creaciones
    async function ensureTable(sql, name) {
        try {
            await promisePool.query(sql);
            console.log(`Tabla ${name} verificada/creada`);
        } catch (err) {
            console.error(`Error creando/verificando tabla ${name}:`, err);
        }
    }

    // Función para verificar si un token tiene un permiso específico
// Además, el bit SUPERADMIN otorga todos los permisos (hereda)
async function hasPermission(token, requiredBit) {
    if (!token) return false;
    const [rows] = await promisePool.query(
        'SELECT role_mask FROM users WHERE token = ? AND token_expires > NOW()',
        [token]
    );
    if (rows.length === 0) return false;
    const mask = normalizeRoleMask(rows[0].role_mask);
    // SUPERADMIN tiene todos los permisos
    }

    // Función auxiliar para obtener el usuario completo a partir de un token (sin verificar permisos)
    async function getUserByToken(token) {
        if (!token) return null;
        const [rows] = await promisePool.query(
            'SELECT id, username, role_mask FROM users WHERE token = ? AND token_expires > NOW()',
            [token]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    // Para compatibilidad con código antiguo (isAdminToken sigue siendo útil para rutas que requieren ADMIN)
    async function isAdminToken(token) {
        return hasPermission(token, PERMISSIONS.ADMIN);
    }

    async function ensureColumn(table, colDef) {
        const colName = colDef.split(' ')[0];
        try {
            await promisePool.query(`SELECT ${colName} FROM ${table} LIMIT 1`);
            console.log(`Columna ${colName} ya existe en ${table}`);
        } catch (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                try {
                    await promisePool.query(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
                    console.log(`Columna ${colName} creada correctamente en ${table}`);
                } catch (alterErr) {
                    console.error(`Error creando columna ${colName} en ${table}:`, alterErr);
                    process.exit(1);
                }
            } else {
                console.error(`Error inesperado al verificar columna ${colName} en ${table}:`, err);
                process.exit(1);
            }
        }
    }

    async function ensureColumns(table, colDefs) {
        for (const d of colDefs) {
            await ensureColumn(table, d);
        }
    }

    // Verificar si la tabla users existe
    try {
        await promisePool.query('SELECT 1 FROM users LIMIT 1');
        console.log('Tabla users verificada');
    } catch (error) {
        console.log('Las tablas se crearán con los scripts de init de MySQL');
    }

    // Crear tabla shared_links si no existe (usando helper)
    const sharedLinksSQL = `
        CREATE TABLE IF NOT EXISTS shared_links (
            id INT AUTO_INCREMENT PRIMARY KEY,
            token VARCHAR(64) NOT NULL UNIQUE,
            user_id INT NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            expires_at DATETIME NULL,
            downloads INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_token (token)
        )
    `;
    await ensureTable(sharedLinksSQL, 'shared_links');
    // Asegurar columna 'downloads' en shared_links (por si la tabla existía sin ese campo)
    await ensureColumn('shared_links', 'downloads INT DEFAULT 0');

    // Asegurar columnas comunes en `users`
    await ensureColumn('users', 'is_admin BOOLEAN DEFAULT FALSE');
    await ensureColumn('users', 'is_superadmin BOOLEAN DEFAULT FALSE');
    await ensureColumn('users', `role_mask INT DEFAULT ${PERMISSIONS.LOGIN}`);

    // Normalizar usuarios existentes que todavía no tienen role_mask.
    // Se asigna el rol antiguo basado en is_admin/is_superadmin, pero ahora los bits granulares no se asignan automáticamente.
    // Los usuarios existentes conservarán solo los bits LOGIN, ADMIN, SUPERADMIN según corresponda.
    await promisePool.query(
        `UPDATE users SET role_mask = CASE
            WHEN is_superadmin = TRUE THEN ?
            WHEN is_admin = TRUE THEN ?
            ELSE ?
         END
         WHERE role_mask IS NULL OR role_mask = 0`,
        [PERMISSIONS.LOGIN | PERMISSIONS.ADMIN | PERMISSIONS.SUPERADMIN,
         PERMISSIONS.LOGIN | PERMISSIONS.ADMIN,
         PERMISSIONS.LOGIN]
    );

    // Tablas avanzadas (banned_ips, admin_logs, global_settings)
    const bannedIpsSQL = `CREATE TABLE IF NOT EXISTS banned_ips (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip_address VARCHAR(45) UNIQUE NOT NULL,
            reason VARCHAR(255) DEFAULT NULL,
            banned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            banned_by INT DEFAULT NULL,
            FOREIGN KEY (banned_by) REFERENCES users(id) ON DELETE SET NULL
        )`;
    const adminLogsSQL = `CREATE TABLE IF NOT EXISTS admin_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT DEFAULT NULL,
            action VARCHAR(50) NOT NULL,
            target_user_id INT DEFAULT NULL,
            target_ip VARCHAR(45) DEFAULT NULL,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
        )`;
    const globalSettingsSQL = `CREATE TABLE IF NOT EXISTS global_settings (
            setting_key VARCHAR(50) PRIMARY KEY,
            setting_value VARCHAR(255) NOT NULL
        )`;

    await ensureTable(bannedIpsSQL, 'banned_ips');
    await ensureTable(adminLogsSQL, 'admin_logs');
    await ensureTable(globalSettingsSQL, 'global_settings');

    // Columnas adicionales para users (estandarizadas)
    const newColumns = [
        "status ENUM('active', 'disabled', 'banned') DEFAULT 'active'",
        "ban_reason VARCHAR(255) DEFAULT NULL",
        "banned_at DATETIME DEFAULT NULL",
        "banned_by INT DEFAULT NULL",
        "quota_bytes BIGINT DEFAULT NULL",
        "max_file_size_bytes BIGINT DEFAULT NULL",
        "bandwidth_kbps INT DEFAULT NULL",
        "last_access DATETIME DEFAULT NULL",
        "last_ip VARCHAR(45) DEFAULT NULL",
        "registration_ip VARCHAR(45) DEFAULT NULL"
    ];

    await ensureColumns('users', newColumns);

    // ===== MODIFICAR COLUMNA filesize A BIGINT PARA ARCHIVOS >2GB =====
    try {
        await promisePool.query('ALTER TABLE files MODIFY COLUMN filesize BIGINT');
        console.log('Columna filesize verificada como BIGINT');
    } catch (err) {
        console.error('Error al modificar columna filesize:', err);
    }

    const defaultSettings = {
        'default_quota_bytes': (5 * 1024 * 1024 * 1024).toString(), // 5 GB default
        'default_max_file_size_bytes': (5 * 1024 * 1024 * 1024).toString(), // 5 GB default
        'default_bandwidth_kbps': '0' // 0 = sin límite
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
        try {
            await promisePool.query(
                'INSERT IGNORE INTO global_settings (setting_key, setting_value) VALUES (?, ?)',
                [key, value]
            );
        } catch (err) {
            console.error('Error insertando setting default:', err);
        }
    }

    // ===== CREAR USUARIO ADMIN POR DEFECTO CON TODOS LOS PERMISOS =====
    const adminUsername = 'admin';
    const adminPassword = readSecret('admin_password');
    const adminHash = crypto.createHash('md5').update(adminPassword).digest('hex');

    const [adminRows] = await promisePool.query('SELECT id FROM users WHERE username = ?', [adminUsername]);
    if (adminRows.length === 0) {
        // Insertar nuevo superadmin con todos los permisos (bitmask completo)
        await promisePool.query(
            'INSERT INTO users (username, password, is_admin, is_superadmin, role_mask) VALUES (?, ?, ?, ?, ?)',
            [adminUsername, adminHash, true, true, ALL_PERMISSIONS]
        );
        console.log('Usuario admin creado con todos los permisos');
    } else {
        // Asegurar que tenga is_admin = true, is_superadmin = true y role_mask con todos los bits
        await promisePool.query('UPDATE users SET is_admin = true, is_superadmin = true, role_mask = ? WHERE username = ?', [ALL_PERMISSIONS, adminUsername]);
        console.log('Usuario admin verificado y actualizado con todos los permisos');
    }

    // ===== ASEGURAR CARPETAS PARA TODOS LOS USUARIOS =====
    const [allUsers] = await promisePool.query('SELECT username FROM users');
    console.log(`Verificando carpetas para ${allUsers.length} usuarios...`);
    for (const user of allUsers) {
        const userDir = path.join('/home', user.username);
        if (!fs.existsSync(userDir)) {
            try {
                fs.mkdirSync(userDir, { recursive: true, mode: 0o755 });
                console.log(`Carpeta creada para usuario: ${user.username}`);
            } catch (err) {
                console.error(`Error creando carpeta para ${user.username}:`, err);
            }
        }
    }

    // Sincronizar BD con archivo SQL al iniciar
    console.log('Sincronizando BD con archivo SQL...');
    await syncBDtoSQL();

    async function hasPermission(token, requiredBit) {
        console.log(`[hasPermission] Token recibido: ${token}`);
        console.log(`[hasPermission] Bit requerido: ${requiredBit} (${requiredBit.toString(16)})`);
        if (!token) return false;
        const [rows] = await promisePool.query(
            'SELECT role_mask FROM users WHERE token = ? AND token_expires > NOW()',
            [token]
        );
        if (rows.length === 0) {
            console.log('[hasPermission] No se encontró usuario con ese token o token expirado');
            return false;
        }
        const mask = rows[0].role_mask;
        console.log(`[hasPermission] role_mask del usuario: ${mask} (hex: ${mask.toString(16)})`);
        const hasBit = (mask & requiredBit) !== 0;
        console.log(`[hasPermission] ¿Tiene el bit? ${hasBit}`);
        return hasBit;
    }

    // Configuración de multer para subida de archivos
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const username = req.params.username;
            const userDir = path.join('/home', username);
            const relativePath = req.query.path || '';

            let targetDir = userDir;
            if (relativePath) {
                targetDir = path.join(userDir, relativePath);
            }

            const resolvedTarget = path.resolve(targetDir);
            const resolvedUserDir = path.resolve(userDir);

            if (!resolvedTarget.startsWith(resolvedUserDir)) {
                return cb(new Error('Acceso denegado'));
            }

            if (!fs.existsSync(resolvedTarget)) {
                fs.mkdirSync(resolvedTarget, { recursive: true, mode: 0o755 });
            }

            cb(null, resolvedTarget);
        },
        filename: (req, file, cb) => {
            const username = req.params.username;
            const userDir = path.join('/home', username);
            const relativePath = req.query.path || '';

            let targetDir = userDir;
            if (relativePath) {
                targetDir = path.join(userDir, relativePath);
            }

            const resolvedTarget = path.resolve(targetDir);
            const resolvedUserDir = path.resolve(userDir);

            if (!resolvedTarget.startsWith(resolvedUserDir)) {
                return cb(new Error('Acceso denegado'));
            }

            // 1. Sanitizar el nombre original quitando caracteres inválidos
            const originalBaseName = path.basename(file.originalname).replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');

            // 2. Extraer el nombre base y la extensión por separado
            const parsedName = path.parse(originalBaseName || 'archivo');
            const baseName = parsedName.name || 'archivo';
            const ext = parsedName.ext;

            let candidate = baseName + ext;
            let counter = 1;

            // 3. Comprobar si existe el archivo y añadir prefijo (_1, _2...) si es necesario
            while (fs.existsSync(path.join(resolvedTarget, candidate))) {
                candidate = `${baseName}_${counter}${ext}`;
                counter++;
            }

            // 4. Se aprueba y asigna el candidato final seguro
            cb(null, candidate);
        }
    });

    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 50000 * 1024 * 1024 // 50GB máximo
        }
    });

    /**
     * Actualiza el archivo SQL después de un registro
     */
    async function actualizarArchivoSQL(username, password) {
        try {
            console.log(`Usuario ${username} registrado, sincronizando BD a SQL...`);
            await syncBDtoSQL();
            console.log('Sincronización completada');
            return true;
        } catch (error) {
            console.error('Error en sincronización:', error);
            return false;
        }
    }

    /**
     * Calcula el tamaño de una carpeta recursivamente
     * @param {string} folderPath - Ruta de la carpeta
     * @returns {number} - Tamaño en bytes
     */
    function getFolderSize(folderPath) {
        let totalSize = 0;

        if (!fs.existsSync(folderPath)) return 0;

        const items = fs.readdirSync(folderPath);

        for (const item of items) {
            const itemPath = path.join(folderPath, item);
            const stats = fs.statSync(itemPath);

            if (stats.isDirectory()) {
                totalSize += getFolderSize(itemPath);
            } else {
                totalSize += stats.size;
            }
        }

        return totalSize;
    }

    /**
     * Formatea bytes a formato legible
     * @param {number} bytes - Tamaño en bytes
     * @returns {string} - Tamaño formateado
     */
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        if (!bytes) return '--';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Comprime una carpeta en un archivo ZIP
     */
    function zipFolder(folderPath, zipPath) {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => resolve());
            archive.on('error', (err) => reject(err));

            archive.pipe(output);
            archive.directory(folderPath, path.basename(folderPath));
            archive.finalize();
        });
    }

    function zipSelectedItems(items, zipPath) {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => resolve());
            archive.on('error', (err) => reject(err));

            archive.pipe(output);
            items.forEach(item => {
                if (item.stats.isDirectory()) {
                    archive.directory(item.fullPath, item.archiveName);
                } else {
                    archive.file(item.fullPath, { name: item.archiveName });
                }
            });
            archive.finalize();
        });
    }

    /**
     * Elimina una carpeta recursivamente
     */
    function deleteFolderRecursive(folderPath) {
        if (fs.existsSync(folderPath)) {
            fs.readdirSync(folderPath).forEach((file) => {
                const curPath = path.join(folderPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(folderPath);
        }
    }

    // ===== MIDDLEWARE DE SEGURIDAD (IP Banning y Seguimiento) =====
    app.use(async (req, res, next) => {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (ip) {
            try {
                // Check if IP is banned
                const [banned] = await promisePool.query('SELECT id FROM banned_ips WHERE ip_address = ?', [ip]);
                if (banned.length > 0) {
                    return res.status(403).json({ success: false, message: 'Tu IP ha sido bloqueada del sistema.' });
                }
            } catch (e) {
                console.error('Error verificando IP:', e);
            }
        }

        // Seguimiento de última sesión
        const token = req.body.token || req.query.token;
        if (token && ip) {
            promisePool.query('UPDATE users SET last_access = NOW(), last_ip = ? WHERE token = ?', [ip, token]).catch(() => { });
        }

        next();
    });

    // ===== RUTAS DE LA API =====

    /**
     * Ruta de registro de usuarios
     */
    app.post('/api/register', async (req, res) => {
        console.log('Registro iniciado');

        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuario y contraseña requeridos'
                });
            }

            if (username.length < 3) {
                return res.status(400).json({
                    success: false,
                    message: 'El usuario debe tener al menos 3 caracteres'
                });
            }

            const [existingUser] = await promisePool.query(
                'SELECT id FROM users WHERE username = ?',
                [username]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de usuario ya está registrado'
                });
            }

            const ipCandidate = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
            const registrationIp = normalizeClientIp(ipCandidate);

            if (registrationIp) {
                const [duplicate] = await promisePool.query(
                    'SELECT id FROM users WHERE registration_ip = ? LIMIT 1',
                    [registrationIp]
                );
                if (duplicate.length > 0) {
                    return res.status(403).json({
                        success: false,
                        message: 'Ya existe una cuenta creada desde esta IP. Si crees que es un error, contacta al administrador.'
                    });
                }
            }

            const roleMask = PERMISSIONS.LOGIN; // Solo LOGIN por defecto
            const [result] = await promisePool.query(
                'INSERT INTO users (username, password, role_mask, registration_ip) VALUES (?, ?, ?, ?)',
                [username, password, roleMask, registrationIp]
            );

            if (result.affectedRows > 0) {
                console.log(`Usuario ${username} registrado en BD`);

                const userDir = path.join('/home', username);
                try {
                    if (!fs.existsSync(userDir)) {
                        fs.mkdirSync(userDir, { recursive: true, mode: 0o755 });
                        console.log(`Carpeta creada: ${userDir}`);
                    }
                } catch (folderError) {
                    console.error('Error con carpeta:', folderError);
                }

                await actualizarArchivoSQL(username, password);

                res.json({
                    success: true,
                    message: 'Usuario registrado exitosamente'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al registrar usuario'
                });
            }

        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                message: 'Error del servidor: ' + error.message
            });
        }
    });

    /**
     * Ruta de login
     */
    app.post('/api/login', async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.json({ success: false, message: 'Usuario y contraseña requeridos' });
            }

            const [rows] = await promisePool.query(
                'SELECT id, password, is_admin, is_superadmin, role_mask, status, ban_reason FROM users WHERE username = ?',
                [username]
            );

            if (rows.length === 0) {
                return res.json({ success: false, message: 'Credenciales inválidas' });
            }

            if (rows[0].status === 'banned') {
                return res.status(403).json({ success: false, message: 'Tu cuenta ha sido baneada. Motivo: ' + (rows[0].ban_reason || 'Sin especificar') });
            }
            if (rows[0].status === 'disabled') {
                return res.status(403).json({ success: false, message: 'Tu cuenta se encuentra desactivada.' });
            }

            if (rows[0].password === password) {
                const token = crypto.randomBytes(32).toString('hex');
                const expires = new Date(Date.now() + 3600000); // 1 hora

                await promisePool.query(
                    'UPDATE users SET token = ?, token_expires = ? WHERE id = ?',
                    [token, expires, rows[0].id]
                );

                const userDir = path.join('/home', username);
                if (!fs.existsSync(userDir)) {
                    fs.mkdirSync(userDir, { recursive: true, mode: 0o755 });
                }

                const normalizedMask = normalizeRoleMask(rows[0].role_mask);
                res.json({
                    success: true,
                    token: token,
                    // Flags para el frontend (basados en los nuevos bits)
                    isAdmin: (normalizedMask & PERMISSIONS.ADMIN) !== 0,
                    isSuperadmin: (normalizedMask & PERMISSIONS.SUPERADMIN) !== 0,
                    canViewOthersFiles: (normalizedMask & PERMISSIONS.ADMIN) !== 0,
                    canAccessAdminPanel: (normalizedMask & PERMISSIONS.SUPERADMIN) !== 0,
                    role_mask: normalizedMask,
                    message: 'Login exitoso'
                });
            } else {
                res.json({ success: false, message: 'Credenciales inválidas' });
            }
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Logout de sesión
     */
    app.post('/api/logout', async (req, res) => {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token requerido' });
            }

            const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;

            const [result] = await promisePool.query(
                'UPDATE users SET last_access = NOW(), last_ip = ?, token = NULL, token_expires = NULL WHERE token = ?',
                [ip, token]
            );

            if (result.affectedRows === 0) {
                return res.status(401).json({ success: false, message: 'Token inválido o sesión ya cerrada' });
            }

            res.json({ success: true, message: 'Logout exitoso' });
        } catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Ruta para obtener lista de usuarios (solo para compartir, no admin)
     */
    app.get('/api/users', async (req, res) => {
        try {
            const { token } = req.query;

            if (!token) {
                return res.status(400).json({ success: false, message: 'Token requerido' });
            }

            const [sessionRows] = await promisePool.query(
                'SELECT id, username FROM users WHERE token = ? AND token_expires > NOW()',
                [token]
            );
            if (sessionRows.length === 0) {
                return res.status(401).json({ success: false, message: 'Sesión inválida o expirada' });
            }

            const requestingUsername = sessionRows[0].username;
            const [users] = await promisePool.query(
                'SELECT username FROM users'
            );

            res.json({
                success: true,
                users: users.map(u => u.username).filter(u => u && u !== requestingUsername)
            });
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Obtener estadísticas del usuario actual (cuotas, ancho de banda, uso)
     */
    app.get('/api/user/stats', async (req, res) => {
        try {
            const { token } = req.query;

            if (!token) {
                return res.status(400).json({ success: false, message: 'Token requerido' });
            }

            const [users] = await promisePool.query(
                     `SELECT u.id, u.quota_bytes, u.max_file_size_bytes, u.bandwidth_kbps,
                           (SELECT COALESCE(SUM(filesize), 0) FROM files WHERE user_id = u.id) AS used_bytes,
                           (SELECT COALESCE(SUM(downloads), 0) FROM shared_links WHERE user_id = u.id) AS downloads
                       FROM users u 
                       WHERE u.token = ? AND u.token_expires > NOW()`,
                [token]
            );

            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
            }

            const user = users[0];
            const [settings] = await promisePool.query(
                "SELECT setting_key, setting_value FROM global_settings WHERE setting_key IN ('default_quota_bytes', 'default_max_file_size_bytes', 'default_bandwidth_kbps')"
            );
            
            const globalSettings = {};
            settings.forEach(s => globalSettings[s.setting_key] = s.setting_value);

            const stats = {
                quota_bytes: user.quota_bytes || parseInt(globalSettings['default_quota_bytes'] || '5368709120'), // 5GB default
                max_file_size_bytes: user.max_file_size_bytes || parseInt(globalSettings['default_max_file_size_bytes'] || '104857600'), // 100MB default
                bandwidth_kbps: user.bandwidth_kbps || parseInt(globalSettings['default_bandwidth_kbps'] || '0'), // 0 = sin límite
                used_bytes: parseInt(user.used_bytes || 0),
                downloads: parseInt(user.downloads || 0)
            };

            res.json({ 
                success: true, 
                stats 
            });
        } catch (error) {
            console.error('Error obteniendo estadísticas del usuario:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Middleware de validación de cuota
     */
    const checkUploadQuota = async (req, res, next) => {
        try {
            const username = req.params.username;
            const token = req.query.token || req.body.token;
            // Content-Length includes multipart boundaries, so it's slightly larger than the actual file size, providing a safe upper bound.
            const fileSizeBytes = parseInt(req.headers['content-length'] || 0);

            if (!username || !token) {
                return res.status(401).json({ success: false, message: 'Datos incompletos o sesión no válida' });
            }

            const [users] = await promisePool.query(
                `SELECT id, quota_bytes, max_file_size_bytes, 
                (SELECT SUM(filesize) FROM files WHERE user_id = users.id) AS used_bytes 
                FROM users WHERE username = ? AND token = ? AND token_expires > NOW()`,
                [username, token]
            );

            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Sesión inválida o expirada' });
            }

            const user = users[0];
            const [settings] = await promisePool.query("SELECT setting_key, setting_value FROM global_settings WHERE setting_key IN ('default_max_file_size_bytes', 'default_quota_bytes')");
            const globalSettings = {};
            settings.forEach(s => globalSettings[s.setting_key] = s.setting_value);

            const maxFileSize = user.max_file_size_bytes || parseInt(globalSettings['default_max_file_size_bytes'] || '104857600');
            const maxQuota = user.quota_bytes || parseInt(globalSettings['default_quota_bytes'] || '5368709120');

            if (fileSizeBytes > maxFileSize) {
                return res.status(413).json({ success: false, message: `El archivo supera el tamaño máximo permitido de ${formatBytes(maxFileSize)}.` });
            }

            const currentUsed = parseInt(user.used_bytes || 0);
            if ((currentUsed + fileSizeBytes) > maxQuota) {
                return res.status(413).json({ success: false, message: `No hay suficiente espacio. Cuota máxima: ${formatBytes(maxQuota)}.` });
            }

            req.userContext = user;
            next();
        } catch (error) {
            console.error('Error pre-validando cuota:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    };

    /**
     * Subir archivo a la carpeta del usuario
     */
    app.post('/api/upload/:username', checkUploadQuota, upload.single('file'), async (req, res) => {
        try {
            const user = req.userContext;
            const file = req.file;

            if (!file) {
                return res.json({ success: false, message: 'No se recibió ningún archivo' });
            }

            // Realizar una validación final precisa con el tamaño exacto del archivo subido
            const [settings] = await promisePool.query("SELECT setting_key, setting_value FROM global_settings WHERE setting_key IN ('default_max_file_size_bytes', 'default_quota_bytes')");
            const globalSettings = {};
            settings.forEach(s => globalSettings[s.setting_key] = s.setting_value);
            const maxQuota = user.quota_bytes || parseInt(globalSettings['default_quota_bytes'] || '5368709120');
            const currentUsed = parseInt(user.used_bytes || 0);

            if ((currentUsed + file.size) > maxQuota) {
                fs.unlinkSync(file.path);
                return res.status(413).json({ success: false, message: `No hay suficiente espacio. Archivo eliminado.` });
            }

            await promisePool.query(
                'INSERT INTO files (user_id, filename, original_name, filepath, filesize) VALUES (?, ?, ?, ?, ?)',
                [user.id, file.filename, file.originalname, file.path, file.size]
            );

            res.json({
                success: true,
                message: 'Archivo subido exitosamente',
                filename: file.filename
            });
        } catch (error) {
            console.error('Error subiendo archivo:', error);
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({ success: false, message: 'Error en el servidor al guardar archivo' });
        }
    });

    /**
     * Listar archivos de un usuario
     */
    app.get('/api/files/:username', async (req, res) => {
        try {
            const { username } = req.params;
            const { token, path: relativePath } = req.query;

            // Verificar sesión
            const [users] = await promisePool.query(
                'SELECT id FROM users WHERE username = ? AND token = ? AND token_expires > NOW()',
                [username, token]
            );

            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Sesión inválida' });
            }

            const userDir = path.join('/home', username);

            // Asegurar que el directorio existe
            if (!fs.existsSync(userDir)) {
                try {
                    fs.mkdirSync(userDir, { recursive: true, mode: 0o777 });
                } catch (err) {
                    console.error('Error creando carpeta en GET /api/files:', err);
                }
            }

            let targetDir = userDir;
            if (relativePath) {
                targetDir = path.join(userDir, relativePath);
            }

            const resolvedTarget = path.resolve(targetDir);
            const resolvedUserDir = path.resolve(userDir);
            if (!resolvedTarget.startsWith(resolvedUserDir)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            if (!fs.existsSync(resolvedTarget)) {
                return res.status(404).json({ success: false, message: 'Ruta no encontrada' });
            }

            let items = fs.readdirSync(resolvedTarget);
            let entries = [];

            for (const item of items) {
                const itemPath = path.join(resolvedTarget, item);
                const stats = fs.statSync(itemPath);
                const isDir = stats.isDirectory();

                let itemRelativePath = item;
                if (relativePath) {
                    itemRelativePath = path.join(relativePath, item);
                }

                if (isDir) {
                    const folderSize = getFolderSize(itemPath);
                    const folderSizeFormatted = formatBytes(folderSize);

                    entries.push({
                        name: item,
                        path: itemRelativePath,
                        isDirectory: true,
                        size: folderSize,
                        sizeFormatted: folderSizeFormatted,
                        mtime: stats.mtime
                    });
                } else {
                    let originalName = item;
                    const [fileRows] = await promisePool.query(
                        'SELECT original_name FROM files WHERE user_id = ? AND filepath = ?',
                        [users[0].id, itemPath]
                    );
                    if (fileRows.length > 0) {
                        originalName = fileRows[0].original_name;
                    }

                    entries.push({
                        filename: item,
                        original_name: originalName,
                        name: originalName,
                        path: itemRelativePath,
                        isDirectory: false,
                        size: stats.size,
                        sizeFormatted: formatBytes(stats.size),
                        uploaded_at: stats.mtime,
                        mtime: stats.mtime
                    });
                }
            }

            // Ordenar: carpetas primero, luego archivos por fecha descendente
            entries.sort((a, b) => {
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return new Date(b.mtime) - new Date(a.mtime);
            });

            res.json({
                success: true,
                files: entries,
                currentPath: relativePath || ''
            });

        } catch (error) {
            console.error('Error obteniendo archivos:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Ruta para renombrar archivos o carpetas
     */
    app.put('/api/rename/:username', async (req, res) => {
        try {
            const { username } = req.params;
            const { path: itemPath } = req.query;
            const { token, newName } = req.body;

            if (!token || !newName || !itemPath) {
                return res.status(400).json({ success: false, message: 'Token, ruta y nuevo nombre requeridos' });
            }

            const [users] = await promisePool.query(
                'SELECT id FROM users WHERE username = ? AND token = ? AND token_expires > NOW()',
                [username, token]
            );
            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Sesión inválida' });
            }

            const userId = users[0].id;
            const oldPath = path.join('/home', username, itemPath);
            const dirName = path.dirname(oldPath);
            const baseName = path.basename(itemPath);
            const ext = path.extname(baseName);

            let newFilename;
            if (fs.statSync(oldPath).isFile() && ext) {
                newFilename = newName.endsWith(ext) ? newName : newName + ext;
            } else {
                newFilename = newName;
            }

            const newPath = path.join(dirName, newFilename);

            const resolvedOld = path.resolve(oldPath);
            const resolvedNew = path.resolve(newPath);
            const userDir = path.resolve('/home', username);

            if (!resolvedOld.startsWith(userDir) || !resolvedNew.startsWith(userDir)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            if (!fs.existsSync(resolvedOld)) {
                return res.status(404).json({ success: false, message: 'Elemento no encontrado' });
            }
            if (fs.existsSync(resolvedNew)) {
                return res.status(400).json({ success: false, message: 'Ya existe un elemento con ese nombre' });
            }

            fs.renameSync(resolvedOld, resolvedNew);

            if (!fs.statSync(resolvedNew).isDirectory()) {
                await promisePool.query(
                    'UPDATE files SET filename = ?, original_name = ?, filepath = ? WHERE user_id = ? AND filepath = ?',
                    [newFilename, newFilename, resolvedNew, userId, resolvedOld]
                );
            }

            res.json({ success: true, message: 'Elemento renombrado exitosamente' });
        } catch (error) {
            console.error('Error renombrando:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Ruta para descargar una selección mixta de archivos/carpetas como ZIP.
     */
    app.post('/api/download-selected/:username', async (req, res) => {
        try {
            const { username } = req.params;
            const { token, paths } = req.body;

            if (!token || !Array.isArray(paths) || paths.length === 0) {
                return res.status(400).json({ success: false, message: 'Token y selección requeridos' });
            }

            const [users] = await promisePool.query(
                'SELECT id, bandwidth_kbps FROM users WHERE username = ? AND token = ? AND token_expires > NOW()',
                [username, token]
            );
            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Sesión inválida' });
            }

            const user = users[0];
            const [settings] = await promisePool.query("SELECT setting_value FROM global_settings WHERE setting_key = 'default_bandwidth_kbps'");
            const bandwidthLimitKbps = user.bandwidth_kbps !== null
                ? user.bandwidth_kbps
                : parseInt(settings.length > 0 ? settings[0].setting_value : '0');

            const userDir = path.resolve('/home', username);
            const selectedItems = [];

            for (const itemPath of paths) {
                if (typeof itemPath !== 'string' || itemPath.trim() === '') {
                    return res.status(400).json({ success: false, message: 'Ruta inválida en la selección' });
                }

                const fullPath = path.join(userDir, itemPath);
                const resolvedPath = path.resolve(fullPath);

                if (!resolvedPath.startsWith(userDir)) {
                    return res.status(403).json({ success: false, message: 'Acceso denegado' });
                }
                if (!fs.existsSync(resolvedPath)) {
                    return res.status(404).json({ success: false, message: `No existe: ${itemPath}` });
                }

                selectedItems.push({
                    fullPath: resolvedPath,
                    archiveName: path.basename(itemPath),
                    stats: fs.statSync(resolvedPath)
                });
            }

            const zipPath = path.join('/tmp', `seleccion_${Date.now()}.zip`);
            await zipSelectedItems(selectedItems, zipPath);

            const zipStats = fs.statSync(zipPath);
            res.setHeader('Content-Disposition', 'attachment; filename="seleccion.zip"');
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Length', zipStats.size);

            const stream = fs.createReadStream(zipPath);
            if (bandwidthLimitKbps > 0) {
                stream.pipe(new Throttle({ bps: bandwidthLimitKbps * 1024 })).pipe(res);
            } else {
                stream.pipe(res);
            }

            stream.on('end', () => { if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath); });
            stream.on('error', () => { if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath); });
            req.on('close', () => { if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath); });
        } catch (error) {
            console.error('Error descargando selección:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Ruta para descargar archivos o carpetas
     */
    app.get('/api/download/:username', async (req, res) => {
        try {
            const { username } = req.params;
            const { path: itemPath, token } = req.query;

            const [users] = await promisePool.query(
                'SELECT id, bandwidth_kbps FROM users WHERE username = ? AND token = ? AND token_expires > NOW()',
                [username, token]
            );
            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Sesión inválida' });
            }

            const user = users[0];
            const [settings] = await promisePool.query("SELECT setting_value FROM global_settings WHERE setting_key = 'default_bandwidth_kbps'");
            let bandwidthLimitKbps = user.bandwidth_kbps !== null ? user.bandwidth_kbps : parseInt(settings.length > 0 ? settings[0].setting_value : '0');

            const fullPath = path.join('/home', username, itemPath);
            const resolvedPath = path.resolve(fullPath);
            const userDir = path.resolve('/home', username);

            if (!resolvedPath.startsWith(userDir)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            if (!fs.existsSync(resolvedPath)) {
                return res.status(404).json({ success: false, message: 'Archivo/Carpeta no encontrado' });
            }

            const stats = fs.statSync(resolvedPath);

            if (stats.isDirectory()) {
                const zipPath = path.join('/tmp', `${path.basename(itemPath)}_${Date.now()}.zip`);
                await zipFolder(resolvedPath, zipPath);

                const zipStats = fs.statSync(zipPath);
                res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(path.basename(itemPath))}.zip"`);
                res.setHeader('Content-Type', 'application/zip');
                res.setHeader('Content-Length', zipStats.size);

                const stream = fs.createReadStream(zipPath);
                if (bandwidthLimitKbps > 0) {
                    stream.pipe(new Throttle({ bps: bandwidthLimitKbps * 1024 })).pipe(res);
                } else {
                    stream.pipe(res);
                }

                stream.on('end', () => { if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath); });
                stream.on('error', () => { if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath); });
                req.on('close', () => { if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath); });
            } else {
                res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(path.basename(itemPath))}"`);
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Length', stats.size);

                const stream = fs.createReadStream(resolvedPath);
                if (bandwidthLimitKbps > 0) {
                    stream.pipe(new Throttle({ bps: bandwidthLimitKbps * 1024 })).pipe(res);
                } else {
                    stream.pipe(res);
                }
            }
        } catch (error) {
            console.error('Error en descarga:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Ruta para eliminar archivos o carpetas
     */
    app.delete('/api/delete/:username', async (req, res) => {
        try {
            const { username } = req.params;
            const { path: itemPath, token } = req.query;

            const [users] = await promisePool.query(
                'SELECT id FROM users WHERE username = ? AND token = ? AND token_expires > NOW()',
                [username, token]
            );
            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Sesión inválida' });
            }

            const fullPath = path.join('/home', username, itemPath);
            const resolvedPath = path.resolve(fullPath);
            const userDir = path.resolve('/home', username);

            if (!resolvedPath.startsWith(userDir)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            if (!fs.existsSync(resolvedPath)) {
                return res.status(404).json({ success: false, message: 'Archivo/Carpeta no encontrado' });
            }

            const stats = fs.statSync(resolvedPath);

            if (stats.isDirectory()) {
                deleteFolderRecursive(resolvedPath);
                await promisePool.query('DELETE FROM files WHERE user_id = ? AND (filepath = ? OR filepath LIKE ?)',
                    [users[0].id, resolvedPath, resolvedPath + '/%']);
            } else {
                fs.unlinkSync(resolvedPath);
                await promisePool.query('DELETE FROM files WHERE user_id = ? AND filepath = ?',
                    [users[0].id, resolvedPath]);
            }

            res.json({ success: true, message: 'Elemento eliminado' });
        } catch (error) {
            console.error('Error en delete:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Ruta para previsualizar archivos
     */
    app.get('/api/preview/:username', async (req, res) => {
        try {
            const { username } = req.params;
            const { path: filePath, token } = req.query;

            const [users] = await promisePool.query(
                'SELECT id FROM users WHERE username = ? AND token = ? AND token_expires > NOW()',
                [username, token]
            );
            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Sesión inválida' });
            }

            const fullPath = path.join('/home', username, filePath);
            const resolvedPath = path.resolve(fullPath);
            const userDir = path.resolve('/home', username);

            if (!resolvedPath.startsWith(userDir)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            if (!fs.existsSync(resolvedPath)) {
                return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
            }

            if (fs.statSync(resolvedPath).isDirectory()) {
                return res.status(400).json({ success: false, message: 'No se puede previsualizar una carpeta' });
            }

            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.bmp': 'image/bmp',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogg': 'video/ogg',
                '.mov': 'video/quicktime',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.pdf': 'application/pdf',
                '.txt': 'text/plain',
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json'
            };
            const mime = mimeTypes[ext] || 'application/octet-stream';
            res.setHeader('Content-Type', mime);
            res.setHeader('Content-Disposition', 'inline');
            res.sendFile(resolvedPath);
        } catch (error) {
            console.error('Error en preview:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Ruta para crear una carpeta
     */
    app.post('/api/admin/mkdir/:targetUsername', async (req, res) => {
        try {
            const { targetUsername } = req.params;
            const { token, folderPath } = req.body; // folderPath puede ser "fotos/2026"

            if (!token || !folderPath) {
                return res.status(400).json({ success: false, message: 'Token y ruta de carpeta requeridos' });
            }

            if (!await hasPermission(token, PERMISSIONS.ADMIN)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const [userRows] = await promisePool.query('SELECT id FROM users WHERE username = ?', [targetUsername]);
            if (userRows.length === 0) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            const userDir = path.join('/home', targetUsername);
            const targetDir = path.join(userDir, folderPath);
            const resolvedTarget = path.resolve(targetDir);
            const resolvedUserDir = path.resolve(userDir);

            if (!resolvedTarget.startsWith(resolvedUserDir)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            // Crear toda la jerarquía de carpetas necesaria
            fs.mkdirSync(resolvedTarget, { recursive: true, mode: 0o755 });

            res.json({ success: true, message: 'Carpeta(s) creada(s) exitosamente' });
        } catch (error) {
            console.error('Error creando carpeta (admin):', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Ruta para mover un archivo
     */
    app.post('/api/move/:username', async (req, res) => {
        try {
            const { username } = req.params;
            const { token, sourcePath, destinationFolder } = req.body;

            if (!token || !sourcePath || destinationFolder === undefined) {
                return res.status(400).json({ success: false, message: 'Token, ruta de origen y carpeta destino requeridos' });
            }

            const [users] = await promisePool.query(
                'SELECT id FROM users WHERE username = ? AND token = ? AND token_expires > NOW()',
                [username, token]
            );
            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Sesión inválida' });
            }

            const userDir = path.join('/home', username);
            const sourceFull = path.join(userDir, sourcePath);
            const baseName = path.basename(sourcePath);

            let destFull;
            if (destinationFolder.trim() === '') {
                destFull = path.join(userDir, baseName);
            } else {
                destFull = path.join(userDir, destinationFolder, baseName);
            }

            const resolvedSource = path.resolve(sourceFull);
            const resolvedDest = path.resolve(destFull);
            const resolvedUserDir = path.resolve(userDir);

            if (!resolvedSource.startsWith(resolvedUserDir) || !resolvedDest.startsWith(resolvedUserDir)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            if (!fs.existsSync(resolvedSource)) {
                return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
            }

            if (resolvedSource === resolvedDest) {
                return res.json({ success: true, message: 'El archivo ya está en esa ubicación' });
            }

            if (fs.existsSync(resolvedDest)) {
                return res.status(400).json({ success: false, message: 'Ya existe un archivo con ese nombre en el destino' });
            }

            const destDir = path.dirname(resolvedDest);
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true, mode: 0o755 });
            }

            fs.renameSync(resolvedSource, resolvedDest);

            await promisePool.query(
                'UPDATE files SET filepath = ? WHERE user_id = ? AND filepath = ?',
                [resolvedDest, users[0].id, resolvedSource]
            );

            res.json({ success: true, message: 'Archivo movido exitosamente' });
        } catch (error) {
            console.error('Error moviendo archivo:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    // ===== RUTAS PARA COMPARTIR ARCHIVOS =====

    /**
     * Generar un enlace compartido para un archivo
     */
    app.post('/api/share/:username', async (req, res) => {
        try {
            const { username } = req.params;
            const { token, filePath, expiresIn } = req.body;

            const [users] = await promisePool.query(
                'SELECT id FROM users WHERE username = ? AND token = ? AND token_expires > NOW()',
                [username, token]
            );
            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Sesión inválida' });
            }
            const userId = users[0].id;

            const fullPath = path.join('/home', username, filePath);
            const resolvedPath = path.resolve(fullPath);
            const userDir = path.resolve('/home', username);
            if (!resolvedPath.startsWith(userDir)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
                return res.status(404).json({ success: false, message: 'Archivo no válido o es una carpeta' });
            }

            const [existingLinks] = await promisePool.query(
                `SELECT token, expires_at FROM shared_links WHERE user_id = ? AND file_path = ? AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC LIMIT 1`,
                [userId, filePath]
            );
            if (existingLinks.length > 0) {
                const existingLink = existingLinks[0];
                const baseUrl = req.protocol + '://' + req.get('host');
                return res.json({
                    success: true,
                    shareToken: existingLink.token,
                    shareUrl: `${baseUrl}/api/share/${existingLink.token}`,
                    expiresAt: existingLink.expires_at ? new Date(existingLink.expires_at).toISOString() : null,
                    reused: true
                });
            }

            const shareToken = crypto.randomBytes(32).toString('hex');

            let expiresAt = null;
            if (expiresIn && expiresIn !== 'never') {
                const now = new Date();
                if (expiresIn === '1h') expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
                else if (expiresIn === '1d') expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                else if (expiresIn === '7d') expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            }

            await promisePool.query(
                'INSERT INTO shared_links (token, user_id, file_path, original_name, expires_at) VALUES (?, ?, ?, ?, ?)',
                [shareToken, userId, filePath, path.basename(filePath), expiresAt]
            );

            const baseUrl = req.protocol + '://' + req.get('host');
            const shareUrl = `${baseUrl}/api/share/${shareToken}`;

            res.json({
                success: true,
                shareToken,
                shareUrl,
                expiresAt: expiresAt ? expiresAt.toISOString() : null
            });
        } catch (error) {
            console.error('Error generando enlace:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Acceder a un archivo compartido (público)
     */
    app.get('/api/share/:shareToken', async (req, res) => {
        try {
            const { shareToken } = req.params;

            const [rows] = await promisePool.query(
                'SELECT * FROM shared_links WHERE token = ?',
                [shareToken]
            );
            if (rows.length === 0) {
                return res.status(404).send('Enlace no válido');
            }
            const link = rows[0];

            if (link.expires_at && new Date(link.expires_at) < new Date()) {
                return res.status(410).send('El enlace ha expirado');
            }

            const [userRows] = await promisePool.query(
                'SELECT username FROM users WHERE id = ?',
                [link.user_id]
            );
            if (userRows.length === 0) {
                return res.status(500).send('Error interno');
            }
            const username = userRows[0].username;

            const filePath = path.join('/home', username, link.file_path);
            const resolvedPath = path.resolve(filePath);
            const userDir = path.resolve('/home', username);
            if (!resolvedPath.startsWith(userDir) || !fs.existsSync(resolvedPath)) {
                return res.status(404).send('Archivo no encontrado');
            }

            await promisePool.query(
                'UPDATE shared_links SET downloads = downloads + 1 WHERE id = ?',
                [link.id]
            );

            const ext = path.extname(link.file_path).toLowerCase();
            const mimeTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.bmp': 'image/bmp',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogg': 'video/ogg',
                '.mov': 'video/quicktime',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.pdf': 'application/pdf',
                '.txt': 'text/plain',
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json'
            };
            const mime = mimeTypes[ext] || 'application/octet-stream';
            res.setHeader('Content-Type', mime);
            res.setHeader('Content-Disposition', 'inline; filename="' + path.basename(link.file_path) + '"');
            res.sendFile(resolvedPath);
        } catch (error) {
            console.error('Error sirviendo archivo compartido:', error);
            res.status(500).send('Error del servidor');
        }
    });

    /**
     * Listar enlaces generados por el usuario
     */
    app.get('/api/share/list/:username', async (req, res) => {
        try {
            const { username } = req.params;
            const { token } = req.query;

            const [users] = await promisePool.query(
                'SELECT id FROM users WHERE username = ? AND token = ? AND token_expires > NOW()',
                [username, token]
            );
            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Sesión inválida' });
            }

            const [links] = await promisePool.query(
                'SELECT token, file_path, original_name, expires_at, created_at, downloads FROM shared_links WHERE user_id = ? ORDER BY created_at DESC',
                [users[0].id]
            );

            const baseUrl = req.protocol + '://' + req.get('host');
            const result = links.map(link => ({
                ...link,
                shareUrl: `${baseUrl}/api/share/${link.token}`
            }));

            res.json({ success: true, links: result });
        } catch (error) {
            console.error('Error listando enlaces:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    // ===== RUTAS DE ADMINISTRACIÓN (con verificación granular de permisos) =====

    /**
     * Obtener lista de todos los usuarios (requiere SUPERADMIN: acceso al panel)
     */
    app.get('/api/admin/users', async (req, res) => {
        try {
            const { token } = req.query;
            if (!await hasPermission(token, PERMISSIONS.SUPERADMIN)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const [rows] = await promisePool.query(
                `SELECT u.id, u.username, u.created_at, u.role_mask, u.status, u.last_access, u.last_ip, u.registration_ip, u.quota_bytes, u.max_file_size_bytes, u.bandwidth_kbps, u.ban_reason, u.banned_at,
                (SELECT SUM(filesize) FROM files WHERE user_id = u.id) AS used_bytes,
                COALESCE(u.quota_bytes, CAST((SELECT setting_value FROM global_settings WHERE setting_key = 'default_quota_bytes') AS UNSIGNED), 5368709120) AS effective_quota_bytes,
                COALESCE(u.max_file_size_bytes, CAST((SELECT setting_value FROM global_settings WHERE setting_key = 'default_max_file_size_bytes') AS UNSIGNED), 104857600) AS effective_max_file_size_bytes,
                COALESCE(u.bandwidth_kbps, CAST((SELECT setting_value FROM global_settings WHERE setting_key = 'default_bandwidth_kbps') AS UNSIGNED), 0) AS effective_bandwidth_kbps
                FROM users u ORDER BY u.created_at DESC`
            );

            const users = rows.map(u => ({
                ...u,
                role_mask: normalizeRoleMask(u.role_mask),
                is_admin: (u.role_mask & PERMISSIONS.ADMIN) !== 0,
                is_superadmin: (u.role_mask & PERMISSIONS.SUPERADMIN) !== 0,
                role_name: ROLE_NAME[normalizeRoleMask(u.role_mask)] || 'custom'
            }));

            res.json({ success: true, users });
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Actualizar estado del usuario (Banear, desactivar, activar)
     * Requiere MANAGE_USERS_STATUS
     */
    app.put('/api/admin/users/:id/status', async (req, res) => {
        try {
            const { token, status, ban_reason } = req.body;
            const targetId = req.params.id;

            if (!await hasPermission(token, PERMISSIONS.MANAGE_USERS_STATUS)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            // Obtener el admin que realiza la acción
            const admin = await getUserByToken(token);
            if (!admin) return res.status(401).json({ success: false, message: 'Sesión inválida' });
            const adminId = admin.id;
            const requesterIsSuper = (admin.role_mask & PERMISSIONS.SUPERADMIN) !== 0;

            if (targetId == adminId) return res.status(400).json({ success: false, message: 'No puedes cambiar tu propio estado.' });

            const [targetRows] = await promisePool.query('SELECT id, role_mask FROM users WHERE id = ?', [targetId]);
            if (targetRows.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            const target = targetRows[0];
            const targetIsSuper = (target.role_mask & PERMISSIONS.SUPERADMIN) !== 0;
            const targetIsAdmin = (target.role_mask & PERMISSIONS.ADMIN) !== 0;

            // Solo superadmin puede modificar admins o superadmins
            if (!requesterIsSuper && (targetIsSuper || targetIsAdmin)) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para cambiar el estado de este usuario.' });
            }

            let query = 'UPDATE users SET status = ?';
            let params = [status];

            if (status === 'banned') {
                query += ', ban_reason = ?, banned_at = NOW(), banned_by = ?, token = NULL, token_expires = NULL';
                params.push(ban_reason || 'Sin especificar', adminId);
            } else if (status === 'disabled') {
                query += ', token = NULL, token_expires = NULL, ban_reason = NULL, banned_at = NULL, banned_by = NULL';
            } else {
                query += ', ban_reason = NULL, banned_at = NULL, banned_by = NULL';
            }
            query += ' WHERE id = ?';
            params.push(targetId);

            await promisePool.query(query, params);
            await promisePool.query('INSERT INTO admin_logs (admin_id, action, target_user_id, details) VALUES (?, ?, ?, ?)', [adminId, 'CHANGE_STATUS', targetId, `Status changed to ${status}`]);

            res.json({ success: true, message: 'Estado actualizado correctamente' });
        } catch (error) {
            console.error('Error actualizando estado:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Actualizar límites del usuario (Quota, bandwidth, max file size, roles)
     * Requiere MANAGE_USER_LIMITS
     */
    app.put('/api/admin/users/:id/limits', async (req, res) => {
        try {
            const { token, quota_bytes, max_file_size_bytes, bandwidth_kbps, is_admin, is_superadmin, role_mask } = req.body;
            const targetId = req.params.id;

            if (!await hasPermission(token, PERMISSIONS.MANAGE_USER_LIMITS)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const admin = await getUserByToken(token);
            if (!admin) return res.status(401).json({ success: false, message: 'Sesión inválida' });
            const adminId = admin.id;
            const requesterIsSuper = (admin.role_mask & PERMISSIONS.SUPERADMIN) !== 0;

            const [targetRows] = await promisePool.query('SELECT role_mask FROM users WHERE id = ?', [targetId]);
            if (targetRows.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            const currentRoleMask = normalizeRoleMask(targetRows[0].role_mask);

            let newRoleMask = currentRoleMask;
            if (typeof role_mask !== 'undefined') {
                newRoleMask = normalizeRoleMask(role_mask);
            } else if (typeof is_admin !== 'undefined' || typeof is_superadmin !== 'undefined') {
                const currentIsAdmin = (currentRoleMask & PERMISSIONS.ADMIN) !== 0;
                const currentIsSuper = (currentRoleMask & PERMISSIONS.SUPERADMIN) !== 0;
                const newIsAdmin = (typeof is_admin !== 'undefined') ? is_admin : currentIsAdmin;
                const newIsSuper = (typeof is_superadmin !== 'undefined') ? is_superadmin : currentIsSuper;
                newRoleMask = PERMISSIONS.LOGIN;
                if (newIsAdmin) newRoleMask |= PERMISSIONS.ADMIN;
                if (newIsSuper) newRoleMask |= PERMISSIONS.SUPERADMIN;
                // Conservar otros bits granulares que ya tuviera
                newRoleMask |= (currentRoleMask & ~(PERMISSIONS.ADMIN | PERMISSIONS.SUPERADMIN));
            }

            const isChangingSuperadmin = ((currentRoleMask & PERMISSIONS.SUPERADMIN) !== 0) !== ((newRoleMask & PERMISSIONS.SUPERADMIN) !== 0);
            if (isChangingSuperadmin && !requesterIsSuper) {
                return res.status(403).json({ success: false, message: 'Solo un superadmin puede cambiar el rol de superadmin.' });
            }

            if (targetId == adminId && !(newRoleMask & PERMISSIONS.ADMIN)) {
                return res.status(400).json({ success: false, message: 'No puedes quitarte tus propios permisos de administrador.' });
            }

            if (targetId == adminId && (currentRoleMask & PERMISSIONS.SUPERADMIN) && !(newRoleMask & PERMISSIONS.SUPERADMIN)) {
                return res.status(400).json({ success: false, message: 'No puedes revocar tu propio estatus de superadmin.' });
            }

            const updateFields = ['quota_bytes = ?', 'max_file_size_bytes = ?', 'bandwidth_kbps = ?', 'role_mask = ?', 'is_admin = ?', 'is_superadmin = ?'];
            const params = [
                quota_bytes !== null ? quota_bytes : null,
                max_file_size_bytes !== null ? max_file_size_bytes : null,
                bandwidth_kbps !== null ? bandwidth_kbps : null,
                newRoleMask,
                (newRoleMask & PERMISSIONS.ADMIN) !== 0,
                (newRoleMask & PERMISSIONS.SUPERADMIN) !== 0
            ];

            const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
            params.push(targetId);

            await promisePool.query(query, params);

            await promisePool.query('INSERT INTO admin_logs (admin_id, action, target_user_id, details) VALUES (?, ?, ?, ?)', [adminId, 'UPDATE_LIMITS', targetId, 'Limits and roles updated']);

            res.json({ success: true, message: 'Límites y permisos actualizados correctamente' });
        } catch (error) {
            console.error('Error actualizando límites:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Kickear usuario (Invalidar sesión)
     * Requiere KICK_USERS
     */
    app.post('/api/admin/users/:id/kick', async (req, res) => {
        try {
            const { token } = req.body;
            const targetId = req.params.id;

            if (!await hasPermission(token, PERMISSIONS.KICK_USERS)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const admin = await getUserByToken(token);
            if (!admin) return res.status(401).json({ success: false, message: 'Sesión inválida' });
            const requesterIsSuper = (admin.role_mask & PERMISSIONS.SUPERADMIN) !== 0;

            if (targetId == admin.id) return res.status(400).json({ success: false, message: 'No puedes invalidar tu propia sesión.' });

            const [targetRows] = await promisePool.query('SELECT id, role_mask FROM users WHERE id = ?', [targetId]);
            if (targetRows.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            const target = targetRows[0];
            const targetIsSuper = (target.role_mask & PERMISSIONS.SUPERADMIN) !== 0;
            const targetIsAdmin = (target.role_mask & PERMISSIONS.ADMIN) !== 0;

            if (!requesterIsSuper && (targetIsSuper || targetIsAdmin)) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para kickear a este usuario.' });
            }

            await promisePool.query('UPDATE users SET token = NULL, token_expires = NULL WHERE id = ?', [targetId]);
            await promisePool.query('INSERT INTO admin_logs (admin_id, action, target_user_id) VALUES (?, ?, ?)', [admin.id, 'KICK_USER', targetId]);

            res.json({ success: true, message: 'Sesión invalidada correctamente' });
        } catch (error) {
            console.error('Error expulsando usuario:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Gestión de IPs (banear/desbanear)
     * Requiere MANAGE_IPS
     */
    app.get('/api/admin/ips', async (req, res) => {
        try {
            const { token } = req.query;
            if (!await hasPermission(token, PERMISSIONS.MANAGE_IPS)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const [ips] = await promisePool.query('SELECT b.*, u.username as banner_name FROM banned_ips b LEFT JOIN users u ON b.banned_by = u.id ORDER BY b.banned_at DESC');
            res.json({ success: true, ips });
        } catch (error) {
            console.error('Error obteniendo IPs:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    app.post('/api/admin/ips', async (req, res) => {
        try {
            const { token, ip_address, reason } = req.body;
            if (!await hasPermission(token, PERMISSIONS.MANAGE_IPS)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const admin = await getUserByToken(token);
            if (!admin) return res.status(401).json({ success: false, message: 'Sesión inválida' });

            await promisePool.query('INSERT INTO banned_ips (ip_address, reason, banned_by) VALUES (?, ?, ?)', [ip_address, reason || '', admin.id]);
            res.json({ success: true, message: 'IP baneada' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'La IP ya está baneada' });
            console.error('Error baneando IP:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    app.delete('/api/admin/ips/:ip', async (req, res) => {
        try {
            const { token } = req.query;
            const ip = req.params.ip;
            if (!await hasPermission(token, PERMISSIONS.MANAGE_IPS)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            await promisePool.query('DELETE FROM banned_ips WHERE ip_address = ?', [ip]);
            res.json({ success: true, message: 'IP desbaneada' });
        } catch (error) {
            console.error('Error desbaneando IP:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Configuraciones globales
     * Requiere MANAGE_GLOBAL_SETTINGS
     */
    app.get('/api/admin/settings', async (req, res) => {
        try {
            const { token } = req.query;
            if (!await hasPermission(token, PERMISSIONS.MANAGE_GLOBAL_SETTINGS)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const [settings] = await promisePool.query('SELECT setting_key, setting_value FROM global_settings');
            const result = {};
            settings.forEach(s => result[s.setting_key] = s.setting_value);
            res.json({ success: true, settings: result });
        } catch (error) {
            console.error('Error obteniendo settings:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    app.put('/api/admin/settings', async (req, res) => {
        try {
            const { token, settings } = req.body;
            if (!await hasPermission(token, PERMISSIONS.MANAGE_GLOBAL_SETTINGS)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            for (const [key, value] of Object.entries(settings)) {
                await promisePool.query('UPDATE global_settings SET setting_value = ? WHERE setting_key = ?', [value, key]);
            }
            res.json({ success: true, message: 'Configuraciones actualizadas' });
        } catch (error) {
            console.error('Error actualizando settings:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Obtener archivos de un usuario específico (requiere ADMIN: ver archivos de otros)
     */
    app.get('/api/admin/users/:targetUsername/files', async (req, res) => {
        try {
            const { targetUsername } = req.params;
            const { token, path: relativePath } = req.query;

            if (!await hasPermission(token, PERMISSIONS.ADMIN)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const [userRows] = await promisePool.query('SELECT id FROM users WHERE username = ?', [targetUsername]);
            if (userRows.length === 0) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            const userDir = path.join('/home', targetUsername);

            if (!fs.existsSync(userDir)) {
                try {
                    fs.mkdirSync(userDir, { recursive: true, mode: 0o777 });
                    console.log(`Directorio creado bajo demanda para admin: ${userDir}`);
                } catch (mkdirErr) {
                    console.error(`Error creando directorio para ${targetUsername}:`, mkdirErr);
                }
            }

            let targetDir = userDir;
            if (relativePath) {
                targetDir = path.join(userDir, relativePath);
            }

            const resolvedTarget = path.resolve(targetDir);
            const resolvedUserDir = path.resolve(userDir);
            if (!resolvedTarget.startsWith(resolvedUserDir)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            if (!fs.existsSync(resolvedTarget)) {
                return res.status(404).json({ success: false, message: 'Ruta no encontrada' });
            }

            let items = fs.readdirSync(resolvedTarget);
            let entries = [];

            for (const item of items) {
                const itemPath = path.join(resolvedTarget, item);
                const stats = fs.statSync(itemPath);
                const isDir = stats.isDirectory();

                let itemRelativePath = item;
                if (relativePath) {
                    itemRelativePath = path.join(relativePath, item);
                }

                if (isDir) {
                    const folderSize = getFolderSize(itemPath);
                    entries.push({
                        name: item,
                        path: itemRelativePath,
                        isDirectory: true,
                        size: folderSize,
                        sizeFormatted: formatBytes(folderSize),
                        mtime: stats.mtime
                    });
                } else {
                    let originalName = item;
                    const [fileRows] = await promisePool.query(
                        'SELECT original_name FROM files WHERE user_id = ? AND filepath = ?',
                        [userRows[0].id, itemPath]
                    );
                    if (fileRows.length > 0) {
                        originalName = fileRows[0].original_name;
                    }

                    entries.push({
                        filename: item,
                        original_name: originalName,
                        name: originalName,
                        path: itemRelativePath,
                        isDirectory: false,
                        size: stats.size,
                        sizeFormatted: formatBytes(stats.size),
                        mtime: stats.mtime
                    });
                }
            }

            entries.sort((a, b) => {
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return new Date(b.mtime) - new Date(a.mtime);
            });

            res.json({
                success: true,
                files: entries,
                currentPath: relativePath || ''
            });

        } catch (error) {
            console.error('Error obteniendo archivos del usuario:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Eliminar un usuario y todos sus archivos (requiere DELETE_USERS)
     */
    app.delete('/api/admin/users/:targetUsername', async (req, res) => {
        let conn;
        try {
            const { targetUsername } = req.params;
            const { token } = req.query;

            if (!await hasPermission(token, PERMISSIONS.DELETE_USERS)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            if (targetUsername === 'admin') {
                return res.status(400).json({ success: false, message: 'No se puede eliminar al administrador principal' });
            }

            conn = await promisePool.getConnection();
            await conn.beginTransaction();

            const [userRows] = await conn.query(
                'SELECT id FROM users WHERE username = ? LIMIT 1',
                [targetUsername]
            );
            if (userRows.length === 0) {
                await conn.rollback();
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            await conn.query('DELETE FROM users WHERE username = ?', [targetUsername]);

            const userDir = path.join('/home', targetUsername);
            const adminDir = path.join('/home', 'admin');
            const deleteUsersDir = path.join(adminDir, 'delete_users');

            if (fs.existsSync(userDir)) {
                if (!fs.existsSync(deleteUsersDir)) {
                    fs.mkdirSync(deleteUsersDir, { recursive: true, mode: 0o777 });
                }

                const targetBackupDir = path.join(deleteUsersDir, `${targetUsername}_${Date.now()}`);
                try {
                    fs.renameSync(userDir, targetBackupDir);
                    console.log(`Carpeta de ${targetUsername} movida a backup: ${targetBackupDir}`);
                } catch (moveErr) {
                    console.error(`Error moviendo carpeta a backup, intentando borrado directo:`, moveErr);
                    deleteFolderRecursive(userDir);
                }
            }

            await conn.commit();
            const sqlSynced = await syncBDtoSQL();

            res.json({
                success: true,
                message: sqlSynced
                    ? 'Usuario eliminado correctamente'
                    : 'Usuario eliminado correctamente (advertencia: no se pudo actualizar 02-insertar.sql)',
                sqlSynced
            });
        } catch (error) {
            try {
                if (conn) await conn.rollback();
            } catch (rollbackError) {
                console.error('Error haciendo rollback:', rollbackError);
            }
            console.error('Error eliminando usuario:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        } finally {
            try {
                if (conn) conn.release();
            } catch { /* ignore */ }
        }
    });

    /**
     * Cambiar contraseña de un usuario (requiere CHANGE_ANY_PASSWORD)
     */
    app.put('/api/admin/users/:targetUsername/password', async (req, res) => {
        try {
            const { targetUsername } = req.params;
            const { token, newPassword } = req.body;

            if (!await hasPermission(token, PERMISSIONS.CHANGE_ANY_PASSWORD)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const requester = await getUserByToken(token);
            if (!requester) return res.status(401).json({ success: false, message: 'Sesión inválida' });
            const requesterIsSuper = (requester.role_mask & PERMISSIONS.SUPERADMIN) !== 0;

            const [targetRows] = await promisePool.query(
                'SELECT role_mask FROM users WHERE username = ?',
                [targetUsername]
            );
            if (targetRows.length === 0) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            const targetRoleMask = normalizeRoleMask(targetRows[0].role_mask);
            const targetIsSuperadmin = (targetRoleMask & PERMISSIONS.SUPERADMIN) !== 0;
            const targetIsAdmin = (targetRoleMask & PERMISSIONS.ADMIN) !== 0;

            // Nunca permitir cambiar la contraseña de un superadmin
            if (targetIsSuperadmin) {
                return res.status(403).json({ success: false, message: 'No está permitido cambiar la contraseña de un superadmin' });
            }

            // Si el objetivo es un admin, solo permitir si el solicitante es superadmin
            if (targetIsAdmin && !requesterIsSuper) {
                return res.status(403).json({ success: false, message: 'No está permitido cambiar la contraseña de otro admin' });
            }

            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
            }

            const hashed = crypto.createHash('md5').update(newPassword).digest('hex');
            await promisePool.query('UPDATE users SET password = ? WHERE username = ?', [hashed, targetUsername]);

            res.json({ success: true, message: 'Contraseña actualizada' });
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Previsualizar archivo de cualquier usuario (requiere ADMIN)
     */
    app.get('/api/admin/preview/:targetUsername', async (req, res) => {
        try {
            const { targetUsername } = req.params;
            const { path: filePath, token } = req.query;

            if (!await hasPermission(token, PERMISSIONS.ADMIN)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const fullPath = path.join('/home', targetUsername, filePath);
            const resolvedPath = path.resolve(fullPath);
            const userDir = path.resolve('/home', targetUsername);

            if (!resolvedPath.startsWith(userDir)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
                return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
            }

            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.bmp': 'image/bmp',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogg': 'video/ogg',
                '.mov': 'video/quicktime',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.pdf': 'application/pdf',
                '.txt': 'text/plain',
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json'
            };
            const mime = mimeTypes[ext] || 'application/octet-stream';
            res.setHeader('Content-Type', mime);
            res.setHeader('Content-Disposition', 'inline');
            res.sendFile(resolvedPath);
        } catch (error) {
            console.error('Error en preview admin:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Descargar archivo de cualquier usuario (requiere ADMIN)
     */
    app.get('/api/admin/download/:targetUsername', async (req, res) => {
        try {
            const { targetUsername } = req.params;
            const { path: itemPath, token } = req.query;

            if (!await hasPermission(token, PERMISSIONS.ADMIN)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const fullPath = path.join('/home', targetUsername, itemPath);
            const resolvedPath = path.resolve(fullPath);
            const userDir = path.resolve('/home', targetUsername);

            if (!resolvedPath.startsWith(userDir)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            if (!fs.existsSync(resolvedPath)) {
                return res.status(404).json({ success: false, message: 'Archivo/Carpeta no encontrado' });
            }

            const stats = fs.statSync(resolvedPath);

            if (stats.isDirectory()) {
                const zipPath = path.join('/tmp', `${path.basename(itemPath)}_${Date.now()}.zip`);
                await zipFolder(resolvedPath, zipPath);
                res.download(zipPath, `${path.basename(itemPath)}.zip`, (err) => {
                    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
                });
            } else {
                res.download(resolvedPath, path.basename(itemPath));
            }
        } catch (error) {
            console.error('Error en descarga admin:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    /**
     * Ruta para enviar archivos a otro usuario
     */
    app.post('/api/send/:username', async (req, res) => {
        try {
            const { username: sourceUsername } = req.params;
            const { token, files, targetUsername, targetFolder = 'Recibidos' } = req.body;

            if (!token || !files || !Array.isArray(files) || files.length === 0 || !targetUsername) {
                return res.status(400).json({
                    success: false,
                    message: 'Token, lista de archivos y usuario destino requeridos'
                });
            }

            const [sourceUsers] = await promisePool.query(
                'SELECT id FROM users WHERE username = ? AND token = ? AND token_expires > NOW()',
                [sourceUsername, token]
            );
            if (sourceUsers.length === 0) {
                return res.status(401).json({ success: false, message: 'Sesión inválida' });
            }

            const [targetUsers] = await promisePool.query(
                'SELECT id FROM users WHERE username = ?',
                [targetUsername]
            );
            if (targetUsers.length === 0) {
                return res.status(404).json({ success: false, message: 'Usuario destino no encontrado' });
            }

            const sourceDir = path.join('/home', sourceUsername);
            const targetDir = path.join('/home', targetUsername);

            const finalTargetDir = path.join(targetDir, targetFolder);
            if (!fs.existsSync(finalTargetDir)) {
                fs.mkdirSync(finalTargetDir, { recursive: true, mode: 0o755 });
            }

            const results = [];
            const errors = [];

            for (const filePath of files) {
                try {
                    const sourceFilePath = path.join(sourceDir, filePath);
                    const resolvedSource = path.resolve(sourceFilePath);

                    if (!resolvedSource.startsWith(sourceDir)) {
                        errors.push({ file: filePath, error: 'Acceso denegado' });
                        continue;
                    }

                    if (!fs.existsSync(resolvedSource)) {
                        errors.push({ file: filePath, error: 'Archivo no encontrado' });
                        continue;
                    }

                    let destFileName = path.basename(filePath);
                    let destFilePath = path.join(finalTargetDir, destFileName);
                    let counter = 1;

                    while (fs.existsSync(destFilePath)) {
                        const ext = path.extname(destFileName);
                        const baseName = path.basename(destFileName, ext);
                        destFileName = `${baseName}_${counter}${ext}`;
                        destFilePath = path.join(finalTargetDir, destFileName);
                        counter++;
                    }

                    const isDir = fs.statSync(resolvedSource).isDirectory();
                    if (isDir) {
                        fs.cpSync(resolvedSource, destFilePath, { recursive: true });
                    } else {
                        fs.copyFileSync(resolvedSource, destFilePath);

                        const [targetUserRows] = await promisePool.query(
                            'SELECT id FROM users WHERE username = ?',
                            [targetUsername]
                        );

                        await promisePool.query(
                            'INSERT INTO files (user_id, filename, original_name, filepath, filesize) VALUES (?, ?, ?, ?, ?)',
                            [targetUserRows[0].id, destFileName, path.basename(filePath), destFilePath, fs.statSync(destFilePath).size]
                        );
                    }

                    results.push({
                        original: filePath,
                        destination: path.join(targetFolder, destFileName)
                    });
                } catch (err) {
                    console.error(`Error copiando archivo ${filePath}:`, err);
                    errors.push({ file: filePath, error: err.message });
                }
            }

            res.json({
                success: true,
                message: `Procesados ${results.length} archivos, ${errors.length} errores`,
                results,
                errors
            });

        } catch (error) {
            console.error('Error enviando archivos:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    });

    // Iniciar servidor
    const server = app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });

    // Configurar timeouts muy altos en el servidor HTTP de Node.js para permitir
    // la subida de archivos gigantescos (como ISOs de varios gigabytes) sin que se corte la conexión
    server.timeout = 3600000;          // 1 hora de timeout de inactividad
    server.requestTimeout = 3600000;   // 1 hora de timeout de petición (Node 18+)
    server.keepAliveTimeout = 120000;  // 2 minutos de keep-alive
    server.headersTimeout = 125000;    // 2 minutos y 5 segundos (debe ser mayor que keepAliveTimeout)
}

// Iniciar todo
startServer().catch(error => {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
});