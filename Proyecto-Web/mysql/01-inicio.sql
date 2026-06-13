-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
-- Este archivo define la estructura de tablas necesaria para el sistema de archivos.

CREATE DATABASE IF NOT EXISTS appweb;
USE appweb;

-- 1. TABLA DE USUARIOS
-- Almacena credenciales, roles y tokens de sesión.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,    -- Nombre de usuario único
    password VARCHAR(32) NOT NULL,           -- Hash MD5 de la contraseña
    permissions INT UNSIGNED DEFAULT 9,      -- Permisos del usuario (bitmask: Iniciar sesión + Gestor archivos)
    token VARCHAR(64),                       -- Token de sesión actual
    token_expires DATETIME,                  -- Fecha de caducidad del token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'disabled', 'banned') DEFAULT 'active',
    ban_reason VARCHAR(255) DEFAULT NULL,
    banned_at DATETIME DEFAULT NULL,
    banned_by INT DEFAULT NULL,
    quota_bytes BIGINT DEFAULT NULL,         -- NULL significa usar cuota global
    max_file_size_bytes BIGINT DEFAULT NULL, -- NULL significa usar límite global
    bandwidth_kbps INT DEFAULT NULL,         -- NULL significa sin límite o límite global
    last_access DATETIME DEFAULT NULL,
    last_ip VARCHAR(45) DEFAULT NULL
);

-- 1.5. TABLAS DE ADMINISTRACIÓN Y SEGURIDAD
CREATE TABLE IF NOT EXISTS banned_ips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    reason VARCHAR(255) DEFAULT NULL,
    banned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    banned_by INT DEFAULT NULL,
    FOREIGN KEY (banned_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT DEFAULT NULL,
    action VARCHAR(50) NOT NULL,
    target_user_id INT DEFAULT NULL,
    target_ip VARCHAR(45) DEFAULT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS global_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL
);

-- 2. TABLA DE ARCHIVOS
-- Registra los archivos subidos físicamente al servidor.
CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,                    -- Propietario del archivo
    filename VARCHAR(255) NOT NULL,          -- Nombre físico en el disco (único)
    original_name VARCHAR(255) NOT NULL,     -- Nombre original al subirlo
    filepath VARCHAR(500) NOT NULL,          -- Ruta absoluta en el servidor
    filesize BIGINT,                         -- Tamaño en bytes
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Borrado automático si el usuario se elimina
);

-- 3. TABLA DE ENLACES COMPARTIDOS
-- Gestiona los links públicos generados por los usuarios.
CREATE TABLE IF NOT EXISTS shared_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(64) NOT NULL UNIQUE,       -- Identificador único del link
    user_id INT NOT NULL,                    -- Usuario que generó el enlace
    file_path VARCHAR(512) NOT NULL,         -- Ruta del archivo compartido
    original_name VARCHAR(255),
    expires_at DATETIME NULL,                -- Fecha límite (opcional)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    downloads INT DEFAULT 0,                 -- Contador de descargas públicas
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
