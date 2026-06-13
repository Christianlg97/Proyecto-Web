const fs = require('fs');
const path = require('path');

function readSecret(name) {
    // Intentar leer de /run/secrets/ (Docker Secrets)
    try {
        const dockerSecretPath = `/run/secrets/${name}`;
        if (fs.existsSync(dockerSecretPath)) {
            return fs.readFileSync(dockerSecretPath, 'utf8').trim();
        }
    } catch (err) {
        // Continuar al siguiente intento
    }

    // Intentar leer de ./secrets/ (Desarrollo local)
    try {
        const localSecretPath = path.join(__dirname, '..', 'secrets', name);
        if (fs.existsSync(localSecretPath)) {
            return fs.readFileSync(localSecretPath, 'utf8').trim();
        }
    } catch (err) {
        // Continuar al siguiente intento
    }

    // Valores por defecto para desarrollo
    const defaults = {
        'mysql_host': 'mysql',
        'mysql_user': 'user',
        'mysql_password': 'user',
        'mysql_database': 'appweb',
        'admin_password': 'admin'
    };

    if (defaults[name]) {
        console.warn(`⚠️  Usando valor por defecto para secreto '${name}' (no se encontró en /run/secrets ni en ./secrets/)`);
        return defaults[name];
    }

    // Si no hay default, lanzar error
    throw new Error(`Secreto no encontrado: ${name}. Intenta en /run/secrets/${name}, ./secrets/${name}, o define un default.`);
}

module.exports = { readSecret };