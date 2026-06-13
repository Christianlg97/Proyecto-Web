# DOCUMENTACIÓN TÉCNICA

## ÍNDICE

- [DOCUMENTACIÓN TÉCNICA](#documentación-técnica)
  - [ÍNDICE](#índice)
  - [1. INTRODUCCIÓN (ÍNDICE)](#1-introducción-índice)
    - [1.1. INTRODUCCIÓN AL PROYECTO (ÍNDICE)](#11-introducción-al-proyecto-índice)
  - [1.2. STACK TECNOLÓGICO (ÍNDICE)](#12-stack-tecnológico-índice)
  - [1.3. CONFIGURACIÓN INICIAL (ÍNDICE)](#13-configuración-inicial-índice)
    - [Instalación de Tailscale en Linux (ÍNDICE)](#instalación-de-tailscale-en-linux-índice)
    - [Comandos de operación comunes (ÍNDICE)](#comandos-de-operación-comunes-índice)
    - [Uso básico de Docker Compose (ÍNDICE)](#uso-básico-de-docker-compose-índice)
  - [2. ESTRUCTURA (ÍNDICE)](#2-estructura-índice)
    - [2.1. ESTRUCTURA GENERAL (ÍNDICE)](#21-estructura-general-índice)
    - [El servicio Nginx (ÍNDICE)](#el-servicio-nginx-índice)
    - [El servicio Nodejs (ÍNDICE)](#el-servicio-nodejs-índice)
    - [El servicio MYSQL (ÍNDICE)](#el-servicio-mysql-índice)
  - [2.2. VOLÚMENES Y ORGANIZACIÓN DE ARCHIVOS (ÍNDICE)](#22-volúmenes-y-organización-de-archivos-índice)
    - [Volúmenes Frontend (ÍNDICE)](#volúmenes-frontend-índice)
    - [Volúmenes Backend (ÍNDICE)](#volúmenes-backend-índice)
    - [Volúmenes Base de Datos (ÍNDICE)](#volúmenes-base-de-datos-índice)
  - [2.3. VPN (ÍNDICE)](#23-vpn-índice)
  - [3. COMUNICACIÓN Y ACCESO (ÍNDICE)](#3-comunicación-y-acceso-índice)
  - [Diagrama de flujo de petición (ÍNDICE)](#diagrama-de-flujo-de-petición-índice)
  - [Funcionamiento interno (ÍNDICE)](#funcionamiento-interno-índice)
  - [Recomendaciones de acceso (ÍNDICE)](#recomendaciones-de-acceso-índice)
  - [4. INFRAESTRUCTURA (ÍNDICE)](#4-infraestructura-índice)
  - [Detalles de orquestación (ÍNDICE)](#detalles-de-orquestación-índice)
  - [Comandos útiles de mantenimiento (ÍNDICE)](#comandos-útiles-de-mantenimiento-índice)
  - [Expansión del entorno (ÍNDICE)](#expansión-del-entorno-índice)
  - [5. FRONTEND (ÍNDICE)](#5-frontend-índice)
    - [5.1. ARCHIVOS (ÍNDICE)](#51-archivos-índice)
    - [5.2. NGINX.CONF (ÍNDICE)](#52-nginxconf-índice)
    - [5.3. PÁGINAS (ÍNDICE)](#53-páginas-índice)
    - [5.3.1. HTML (ÍNDICE)](#531-html-índice)
    - [5.3.2. CSS (ÍNDICE)](#532-css-índice)
    - [5.3.3. JS (ÍNDICE)](#533-js-índice)
  - [6. BACKEND (ÍNDICE)](#6-backend-índice)
    - [6.1. ARCHIVOS (ÍNDICE)](#61-archivos-índice)
    - [6.2. DOCKERFILE (ÍNDICE)](#62-dockerfile-índice)
    - [6.3. PACKAGE.JSON (ÍNDICE)](#63-packagejson-índice)
    - [6.4. SERVER.JS (ÍNDICE)](#64-serverjs-índice)
    - [Lógica inicial (ÍNDICE)](#lógica-inicial-índice)
    - [Funcionamiento interno de `server.js` (ÍNDICE)](#funcionamiento-interno-de-serverjs-índice)
    - [Middleware y utilidades clave (ÍNDICE)](#middleware-y-utilidades-clave-índice)
    - [Flujo interno de arranque de backend (ÍNDICE)](#flujo-interno-de-arranque-de-backend-índice)
    - [Control de seguridad en rutas de archivos (ÍNDICE)](#control-de-seguridad-en-rutas-de-archivos-índice)
    - [Autenticación y sesiones (ÍNDICE)](#autenticación-y-sesiones-índice)
    - [Rutas principales y estructura de datos (ÍNDICE)](#rutas-principales-y-estructura-de-datos-índice)
    - [Rutas administrativas (ÍNDICE)](#rutas-administrativas-índice)
  - [6.4.1. Cómo depurar y ampliar `server.js` (ÍNDICE)](#641-cómo-depurar-y-ampliar-serverjs-índice)
    - [Depuración (ÍNDICE)](#depuración-índice)
    - [Extender rutas (ÍNDICE)](#extender-rutas-índice)
    - [Mejora de seguridad (ÍNDICE)](#mejora-de-seguridad-índice)
    - [Ejemplo de migración de contraseña (ÍNDICE)](#ejemplo-de-migración-de-contraseña-índice)
    - [Patrones de ampliación (ÍNDICE)](#patrones-de-ampliación-índice)
    - [Estructura recomendada al escalar (ÍNDICE)](#estructura-recomendada-al-escalar-índice)
  - [6.4.2. Flujo de ejemplo de una petición de subida (ÍNDICE)](#642-flujo-de-ejemplo-de-una-petición-de-subida-índice)
    - [6.5. SCRIPTS (ÍNDICE)](#65-scripts-índice)
    - [6.5.1. SYNC\_BD (ÍNDICE)](#651-sync_bd-índice)
    - [6.5.2. WAIT\_MYSQL (ÍNDICE)](#652-wait_mysql-índice)
  - [7. BASE DE DATOS (ÍNDICE)](#7-base-de-datos-índice)
    - [7.1. ESTRUCTURA (ÍNDICE)](#71-estructura-índice)
    - [7.2. ARCHIVOS (ÍNDICE)](#72-archivos-índice)
    - [7.3. INICIO (ÍNDICE)](#73-inicio-índice)
  - [8. SEGURIDAD (ÍNDICE)](#8-seguridad-índice)

---

## 1. INTRODUCCIÓN ([ÍNDICE](#índice))

### 1.1. INTRODUCCIÓN AL PROYECTO ([ÍNDICE](#índice))

Este proyecto es un sistema de gestión de archivos basado en contenedores Docker. Permite a los usuarios registrarse, iniciar sesión, subir archivos, crear carpetas, renombrar, mover, eliminar, compartir y descargar contenido. Además cuenta con un panel de administración para gestionar usuarios y sus archivos.

## 1.2. STACK TECNOLÓGICO ([ÍNDICE](#índice))

- Docker y Docker Compose
- Node.js con Express
- MySQL 8 (contenedor oficial)
- Nginx como servidor web y proxy inverso
- Frontend estático basado en HTML, CSS y JavaScript
- Librerías Node.js: express, mysql2, multer, cors, archiver, crypto

## 1.3. CONFIGURACIÓN INICIAL ([ÍNDICE](#índice))

Antes de lanzar el proyecto se requiere instalar:

- Docker
- Docker Compose
- Tailscale (para acceso VPN remoto)

Para Linux:

```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl enable --now docker
```

Instalar Tailscale según la distribución y enlazar el servidor a la red privada para acceso remoto.

### Instalación de Tailscale en Linux ([ÍNDICE](#índice))

Una instalación típica en Debian/Ubuntu puede hacerse con:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

Para sistemas con `apt`, también se puede usar:

```bash
sudo apt install tailscale
sudo tailscale up
```

Después de ejecutar `tailscale up`, el servidor quedará registrado en la red privada de Tailscale. El proyecto no incluye archivos de configuración de Tailscale; solo usa la VPN para acceder al entorno Docker desde fuera de la LAN.

### Comandos de operación comunes ([ÍNDICE](#índice))

```bash
docker-compose up -d --build
```

Arranca todos los contenedores en segundo plano y fuerza la reconstrucción de la imagen de Node.js.

```bash
docker-compose down -v
```

Detiene y elimina los contenedores, redes y volúmenes anónimos asociados. Usa esto cuando quieras reiniciar el entorno desde cero.

```bash
docker exec -it nodejs_app sh
```

Accede al contenedor Node.js. En la imagen `node:18-alpine` se recomienda `sh`; si necesitas bash en otro servicio, prueba `bash`.

```bash
docker exec -it mysql_db bash
```

Accede al contenedor de MySQL para inspeccionar datos o ejecutar comandos SQL.

### Uso básico de Docker Compose ([ÍNDICE](#índice))

- `docker-compose up -d --build`: reconstruye y arranca todos los servicios.
- `docker-compose logs -f`: muestra logs en tiempo real.
- `docker-compose ps`: lista los contenedores activos.
- `docker-compose stop`: detiene los contenedores sin eliminar volúmenes.
- `docker-compose down -v`: elimina contenedores, redes y volúmenes.

---

## 2. ESTRUCTURA ([ÍNDICE](#índice))

### 2.1. ESTRUCTURA GENERAL ([ÍNDICE](#índice))

El proyecto se basa en una infraestructura Docker, compuesta por 3 servicios:

- MYSQL
- Nginx
- Nodejs

### El servicio Nginx ([ÍNDICE](#índice))

Actúa como frontend y punto de entrada único para usuarios. Recibe todas las peticiones HTTP y proxya las rutas API a Node.js. Los archivos estáticos (HTML, CSS, JS) se sirven desde un volumen montado.

Para su correcto funcionamiento, se almacena la configuración de Nginx en un volumen Docker con `./nginx/nginx.conf`.

Las páginas web que sirven los clientes se almacenan en el volumen Docker `./paginas/`.

### El servicio Nodejs ([ÍNDICE](#índice))

Actúa como backend. Gestiona las solicitudes del frontend, maneja la lógica de usuarios, archivos, sesiones y enlaces compartidos. Interactúa con volúmenes Docker y con el servicio MySQL.

### El servicio MYSQL ([ÍNDICE](#índice))

Actúa como gestor de base de datos. Almacena los usuarios, contraseñas, tokens y metadatos de archivos.

---

## 2.2. VOLÚMENES Y ORGANIZACIÓN DE ARCHIVOS ([ÍNDICE](#índice))

El proyecto usa varios volúmenes Docker para mantener persistencia y separación de responsabilidades.

### Volúmenes Frontend ([ÍNDICE](#índice))

- `/etc/nginx/nginx.conf:ro`
  - Volumen de configuración de Nginx. En local se encuentra en `./nginx/nginx.conf`.
- `/usr/share/nginx/html:ro`
  - Volumen que almacena archivos estáticos servidos por Nginx (`html`, `css`, `js`). En local está en `./paginas/`.

### Volúmenes Backend ([ÍNDICE](#índice))

- `/app`
  - Carga todos los scripts y el contenido de `./nodejs/`.
- `/app/node_modules`
  - Exclusión para evitar que los `node_modules` locales sobrescriban los del contenedor.
- `/home`
  - Directorio donde se almacenan los archivos de usuario dentro del contenedor. En local se sincroniza con `./users`.
- `/mysql`
  - Acceso a los scripts SQL desde el contenedor Node.js, montado desde `./mysql`.

### Volúmenes Base de Datos ([ÍNDICE](#índice))

- `/var/lib/mysql`
  - Volumen persistente que almacena los datos de MySQL.
  - Referencia al volumen definido en `docker-compose.yml` como `mysql_data`.
- `/docker-entrypoint-initdb.d`
  - Volumen donde se montan los archivos `.sql` iniciales para inicializar la base de datos.
  - Referencia local a `./mysql/`.

---

## 2.3. VPN ([ÍNDICE](#índice))

Actualmente la infraestructura es inaccesible desde el exterior de la red LAN. Se utiliza Tailscale como solución VPN para conectarse de forma remota al servidor.

Para acceder al equipo mediante Tailscale, un administrador debe generar un enlace de acceso y compartirlo. Al abrir el enlace, el usuario deberá iniciar sesión en Tailscale y acceder al servidor.

Si el servidor cambia de equipo, debe generarse un enlace nuevo.

Actualmente ya existe un enlace generado:

[Tailscale invite](https://login.tailscale.com/admin/invite/QZ236QwqQX3P9AYgW8e621)

> Nota: El repositorio no contiene configuración o secretos de Tailscale. La VPN se usa únicamente como capa de acceso remoto al servidor donde corre Docker.

---

## 3. COMUNICACIÓN Y ACCESO ([ÍNDICE](#índice))

La comunicación entre servicios se define en `docker-compose.yml` y se estructura en una red Docker interna llamada `app_network`.

- `nginx` se expone en el puerto `80` y actúa como entrada pública.
- `nginx` proxya las rutas `/api/` hacia `nodejs:3000`.
- `nodejs` se comunica con `mysql` usando el nombre de servicio `mysql` en la red interna.
- `mysql` expone el puerto `3306` para administración o conexión externa opcional.

El acceso del frontend al backend se realiza por medio de llamadas AJAX a `API_URL = '/api'`, que Nginx redirige internamente.

## Diagrama de flujo de petición ([ÍNDICE](#índice))

Navegador cliente
      |
      | HTTP 80
      v
   Nginx (nginx_web)
      |
      | proxy /api/ -> `http://nodejs:3000/api/`
      v
   Node.js (nodejs_app)
      |
      | conexión MySQL
      v
   MySQL (mysql_db)

## Funcionamiento interno ([ÍNDICE](#índice))

1. El cliente inicia sesión en `login.html`.
2. Tras autenticarse, es redirigido a `apps.html` donde selecciona la aplicación.
3. El usuario accede a `gestorarchivos.html` o `admin.html` según su rol.
4. Nginx devuelve los recursos estáticos desde `/usr/share/nginx/html`.
5. Cuando la app realiza una llamada a `/api/...`, Nginx la envía al backend Node.js.
6. Node.js valida el token de sesión y realiza operaciones de lectura/escritura.
7. Node.js guarda metadatos en MySQL y archivos en el volumen `/home`.
8. MySQL devuelve resultados al backend, que los transforma en JSON.
9. Node.js responde al navegador con los datos solicitados.
  
## Recomendaciones de acceso ([ÍNDICE](#índice))

Para inspeccionar el contenedor de Node.js y depurar el backend:

```bash
docker exec -it nodejs_app sh
cd /app
```

Para ver los datos de MySQL desde un shell dentro del contenedor:

```bash
docker exec -it mysql_db bash
mysql -u user -puser trabajofinal
```

Para ver el tráfico y la salud de los servicios:

```bash
docker-compose logs -f
docker inspect app_network
```

---

## 4. INFRAESTRUCTURA ([ÍNDICE](#índice))

El proyecto usa Docker Compose para orquestar tres contenedores:

- `mysql_db` con MySQL: persistencia en `mysql_data`, scripts iniciales en `./mysql`.
- `nodejs_app` con Node.js: monta `./nodejs` y `./users`, y depende de MySQL saludable.
- `nginx_web` con Nginx: monta `./nginx/nginx.conf` y `./paginas`, expone HTTP en el puerto `80`.

El backend se construye a partir de `nodejs/Dockerfile` y se arranca con `npm install && node server.js`.

## Detalles de orquestación ([ÍNDICE](#índice))

- `depends_on` en `docker-compose.yml` asegura el orden de arranque, pero no la disponibilidad total de MySQL.
- Por eso el backend usa `wait-for-mysql.js` para comprobar que MySQL está listo antes de iniciar.
- El tráfico entre servicios circula por una red bridge llamada `app_network`.
- Los volúmenes aseguran que los datos persisten aunque se destruya el contenedor.

## Comandos útiles de mantenimiento ([ÍNDICE](#índice))

- Reconstruir e iniciar el entorno:

```bash
docker-compose up -d --build
```

- Detener y eliminar contenedores, redes y volúmenes anónimos:

```bash
docker-compose down -v
```

- Inspeccionar las variables de entorno dentro de Node.js:

```bash
docker exec -it nodejs_app sh -c 'env | sort'
```

- Reiniciar solo un servicio:

```bash
docker-compose restart nodejs
```

- Entrar al contenedor de Nginx para revisar configuración:

```bash
docker exec -it nginx_web bash
cat /etc/nginx/nginx.conf
```

## Expansión del entorno ([ÍNDICE](#índice))

Para ampliar el proyecto:

- Añade un nuevo servicio en `docker-compose.yml` si necesitas Redis, RabbitMQ, un proxy HTTPS o un servicio de monitoreo.
- Mantén las variables de entorno en `docker-compose.yml` para reproducibilidad.
- Si agregas un nuevo volumen, define claramente su propósito (por ejemplo, logs, certificados TLS, backups).

---

## 5. FRONTEND ([ÍNDICE](#índice))

El frontend es una aplicación estática servida por Nginx. Proporciona la interfaz de usuario para login, registro, gestión de archivos y administración.

El foco del frontend es:

- Ofrecer login y registro de usuarios.
- Mostrar el explorador de archivos con carpetas, descarga, previsualización, renombrado y eliminación.
- Permitir compartir archivos mediante enlaces públicos.
- Exponer un panel de administración para usuarios con permisos elevados.

---

### 5.1. ARCHIVOS ([ÍNDICE](#índice))

Los archivos del frontend están en `./paginas/`:

- `apps.html`: página de selección de aplicación post-login.
- `apps.js`: lógica del menú de selección.
- `gestorarchivos.html` (antes trabajofinal.html): página principal de la aplicación.
- `gestorarchivos.css`: estilos globales y diseño visual.
- `gestorarchivos.js`: lógica de la aplicación, peticiones API y controles de interfaz.
- `admin.html`: panel de administración para usuarios con permisos de administrador.
- `admin.css`: estilos específicos del panel de administración.
- `admin.js`: lógica del panel de administración con protección por `sessionStorage`.

---

### 5.2. NGINX.CONF ([ÍNDICE](#índice))

`./nginx/nginx.conf` define la configuración de Nginx:

- `listen 80` para HTTP.
- `root /usr/share/nginx/html` donde se sirven los archivos estáticos.
- Redirecciona `/` hacia `/trabajofinal.html`.
- `location /api/` proxya hacia `http://nodejs:3000/api/`.
- Ajustes de headers de seguridad básicos: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`.
- Compresión Gzip habilitada para recursos de texto.
- Configuración específica de `proxy_set_header` y buffering para manejar subida de archivos grandes.
- Políticas de caché para archivos estáticos con `expires 1h`.

---

### 5.3. PÁGINAS ([ÍNDICE](#índice))

El frontend cuenta con las siguientes páginas principales:

- `apps.html`: menú de selección intermedio post-login.
- `gestorarchivos.html`: aplicación de usuario final.
- `admin.html`: panel de administración.

Ambas usan el mismo estilo base y librerías de iconos externas.

### 5.3.1. HTML ([ÍNDICE](#índice))

`trabajofinal.html` incluye:

- Formulario de login y registro.
- Contenedor principal de la app que se muestra tras autenticar.
- Múltiples modales para renombrar, compartir, mover, crear carpeta y enviar archivos.
- Controles de configuración con selector de tema e idioma.
- Scripts para evitar parpadeo al cargar la página.

`admin.html` incluye:

- Barra de navegación con acceso de retorno.
- Listado de usuarios y tarjetas de usuario.
- Panel de archivos del usuario seleccionado.
- Modal para cambiar contraseñas.
- Modal para editar temas.
- Flujo de selección y acciones administrativas.

### 5.3.2. CSS ([ÍNDICE](#índice))

`trabajofinal.css` contiene:

- Estilos globales para layout, tipografía y fondo.
- Definición de componentes visuales: botones, dropdowns, formularios, tarjetas.
- Variables de tema y estilos responsivos.
- Animaciones ligeras y diseño adaptativo.

`admin.css` contiene:

- Layout de panel administrativo.
- Estilos para tarjetas de usuario y listados.
- Clases para botones de acción, badges y tarjetas con hover.
- Ajustes responsive para mostrar el panel correctamente en mobile/tablet.

### 5.3.3. JS ([ÍNDICE](#índice))

`trabajofinal.js` contiene la lógica completa del frontend:

- Manejo de login, registro y persistencia de token.
- Consulta de archivos y navegación de carpetas.
- Subida de archivos con `FormData`.
- Descargar, renombrar, eliminar, previsualizar y mover archivos.
- Generación de enlaces compartidos y listado de enlaces.
- Control de temas e idioma.
- Interacción con rutas API definidas en el backend.

`admin.js` contiene:

- Autenticación y validación de sesión de administrador.
- Listado y selección de usuarios.
- Visualización de archivos de usuarios ajenos.
- Envío de comandos administrativos: cambiar contraseña, borrar usuarios.
- Integración con el mismo sistema de temas e interfaz.

---

## 6. BACKEND ([ÍNDICE](#índice))

El backend usa Node.js y Express para exponer una API REST que el frontend consume.

El servicio se ejecuta dentro del contenedor `nodejs_app` y se habilita en `localhost:3000` dentro de la red Docker.

### 6.1. ARCHIVOS ([ÍNDICE](#índice))

Carpeta `./nodejs/`:

- `Dockerfile`: define la imagen del backend.
- `package.json`: dependencias y scripts.
- `server.js`: servidor principal con las rutas API.
- `wait-for-mysql.js`: espera hasta que MySQL acepte conexiones.
- `sync_bd_to_sql.js`: sincroniza la tabla de usuarios con el archivo SQL de snapshot.

### 6.2. DOCKERFILE ([ÍNDICE](#índice))

`nodejs/Dockerfile` realiza:

- Uso de `node:18-alpine` como base.
- `WORKDIR /app`.
- Copia `package*.json` e instala dependencias con `npm install`.
- Copia el resto del código fuente.
- Crea el directorio `uploads` dentro de la imagen.
- Expone el puerto `3000`.
- Ejecuta `npm start`.

El contenedor permite que el código fuente local sea montado sobre `/app` y preserva los `node_modules` internos.

### 6.3. PACKAGE.JSON ([ÍNDICE](#índice))

`package.json` define:

- `name`: sistema-archivos
- `version`: 2.0.0
- `main`: server.js
- `scripts`:
  - `start`: `node server.js`
  - `dev`: `nodemon server.js`
- `dependencies`:
  - `archiver`: creación de archivos ZIP para descargas de carpetas.
  - `cors`: habilita acceso CORS entre frontend y backend.
  - `crypto`: generación de tokens y hashes.
  - `express`: framework HTTP.
  - `multer`: manejo de subida de archivos multipart.
  - `mysql2`: conexión con MySQL.
- `devDependencies`:
  - `nodemon`: reinicio automático en desarrollo.

### 6.4. SERVER.JS ([ÍNDICE](#índice))

`server.js` contiene la lógica de negocio y las rutas API.

### Lógica inicial ([ÍNDICE](#índice))

- Espera a MySQL con `waitForMySQL()`.
- Crea un pool de conexiones MySQL.
- Asegura existencia de `shared_links`.
- Verifica y crea la columna `is_admin` si falta.
- Crea un usuario administrador por defecto `admin` con contraseña `admin` si no existe.
- Crea carpetas de usuario en `/home/<username>`.
- Sincroniza la base de datos de usuarios con `syncBDtoSQL()`.
- Configura `multer` para almacenar archivos en `/home/<username>`.

### Funcionamiento interno de `server.js` ([ÍNDICE](#índice))

1. `waitForMySQL()` se ejecuta antes de que el servidor escuche peticiones. Reintenta hasta 30 veces si MySQL no responde.
2. Se crea una conexión pool con `mysql2` para manejar múltiples peticiones concurrentes.
3. Se valida que la tabla `users` existe; si no, el backend confía en los scripts de inicialización de MySQL.
4. Se asegura la existencia de la tabla `shared_links` directamente desde el backend para compatibilidad.
5. Se comprueba y crea la columna `is_admin` si la tabla `users` la necesita.
6. Se comprueba que exista el usuario administrador y se actualiza su rol si es necesario.
7. Se crean carpetas físicas en `/home/<username>` para cada usuario.
8. Se ejecuta `syncBDtoSQL()` para mantener un snapshot SQL de los usuarios.

### Middleware y utilidades clave ([ÍNDICE](#índice))

- `cors()`: permite que el frontend acceda a la API desde el mismo host y puerto mediante proxy Nginx.
- `express.json()` y `express.urlencoded()`: parsean JSON y formularios multipart.
- `multer`: configura el almacenamiento de archivos para escribirlos en la ruta del usuario.
- Funciones internas:
  - `getFolderSize(folderPath)`: calcula recursivamente el tamaño de carpetas.
  - `formatBytes(bytes)`: formatea bytes en KB/MB/GB.
  - `zipFolder(folderPath, zipPath)`: crea ZIP para descargas de carpetas.
  - `deleteFolderRecursive(folderPath)`: elimina carpetas recursivamente.

### Flujo interno de arranque de backend ([ÍNDICE](#índice))

Docker Compose arranca nodejs_app
        |
        v
wait-for-mysql.js intenta conectar a MySQL
        |
        v
MySQL responde listo -> nodejs_app inicia servidor
        |
        v
server.js verifica tablas y columnas
        |
        v
server.js crea admin por defecto y carpetas de usuario
        |
        v
server.js llama a syncBDtoSQL() para regenerar mysql/02-insertar.sql

### Control de seguridad en rutas de archivos ([ÍNDICE](#índice))

Cada ruta de operación de archivos usa `path.resolve()` para validar que la ruta final esté dentro de `/home/<username>`.

Esto evita:

- Traversal con `../`
- Acceso a directorios fuera del área de usuario
- Manipulación de carpetas críticas del contenedor

### Autenticación y sesiones ([ÍNDICE](#índice))

- El login valida `username` y `password` contra `users`.
- Si la credencial es correcta, se genera un token con `crypto.randomBytes(32)`.
- El token expira en 1 hora y se guarda en `users.token` y `users.token_expires`.
- Cada petición protegida valida el token y el tiempo de expiración.

### Rutas principales y estructura de datos ([ÍNDICE](#índice))

- `POST /api/register`: inserta usuario y crea carpeta. El password se almacena tal cual en una columna de 32 caracteres.
- `POST /api/login`: compara contraseña, genera token y devuelve `isAdmin`.
- `GET /api/users`: devuelve usuarios disponibles excluyendo al solicitante.
- `POST /api/upload/:username`: guarda archivo con nombre único y metadatos en `files`.
- `GET /api/files/:username`: lista archivos y carpetas con metadatos y tamaños.
- `PUT /api/rename/:username`: renombra recurso y actualiza registros de archivo cuando aplica.
- `GET /api/download/:username`: descarga archivos o comprime carpetas en ZIP.
- `DELETE /api/delete/:username`: borra archivo o carpeta y mantiene sincronía con la base de datos.
- `GET /api/preview/:username`: envía el archivo con un tipo MIME apropiado para vista en línea.
- `POST /api/mkdir/:username`: crea carpetas en el directorio de usuario.
- `POST /api/move/:username`: mueve archivos entre carpetas de usuario.
- `POST /api/share/:username`: genera enlaces públicos y registra caducidad.
- `GET /api/share/:shareToken`: sirve el archivo compartido y aumenta el contador de descargas.
- `GET /api/share/list/:username`: lista enlaces públicos creados.

### Rutas administrativas ([ÍNDICE](#índice))

- `GET /api/admin/users`: lista todos los usuarios con roles y fechas.
- `GET /api/admin/users/:targetUsername/files`: lista archivos de un usuario específico.
- `DELETE /api/admin/users/:targetUsername`: elimina un usuario y respalda su carpeta.
- `PUT /api/admin/users/:targetUsername/password`: actualiza la contraseña con hash MD5.
- `GET /api/admin/preview/:targetUsername`: previsualiza archivos de otro usuario.
- `GET /api/admin/download/:targetUsername`: descarga archivos de otro usuario.

## 6.4.1. Cómo depurar y ampliar `server.js` ([ÍNDICE](#índice))

### Depuración ([ÍNDICE](#índice))

- Usa `docker-compose logs -f nodejs` para ver errores en tiempo real.
- Revisa los mensajes de `console.log` en la salida del contenedor.
- Dentro del contenedor:

```bash
docker exec -it nodejs_app sh
cd /app
node server.js
```

### Extender rutas ([ÍNDICE](#índice))

Para agregar una nueva API, sigue el patrón existente:

```js
app.post('/api/example/:username', async (req, res) => {
  const { username } = req.params;
  const { token } = req.body;

  const [users] = await promisePool.query(
    'SELECT id FROM users WHERE username = ? AND token = ? AND token_expires > NOW()',
    [username, token]
  );
  if (users.length === 0) {
    return res.status(401).json({ success: false, message: 'Sesión inválida' });
  }

  // lógica de negocio aquí
  res.json({ success: true, message: 'Ejemplo OK' });
});
```

### Mejora de seguridad ([ÍNDICE](#índice))

- Reemplaza MD5 por `bcrypt` para almacenar contraseñas de forma segura.
- Valida entradas con librerías como `joi` o `express-validator`.
- Usa HTTPS y certificados TLS en la capa Nginx.
- Implementa un sistema de refresh token si se requiere sesión prolongada.

### Ejemplo de migración de contraseña ([ÍNDICE](#índice))

```js
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 10);
```

### Patrones de ampliación ([ÍNDICE](#índice))

- Añade nuevas funciones en módulos separados y `require()` en `server.js`.
- Mantén las operaciones de base de datos en funciones reutilizables.
- Separa lógica de rutas de lógica de negocio cuando el proyecto crezca.

### Estructura recomendada al escalar ([ÍNDICE](#índice))

- `./nodejs/routes/`
- `./nodejs/controllers/`
- `./nodejs/models/`
- `./nodejs/utils/`

## 6.4.2. Flujo de ejemplo de una petición de subida ([ÍNDICE](#índice))

Cliente -> POST /api/upload/:username
    Datos: token, archivo multipart
        |
        v
Node.js valida token -> seleccione usuario
        |
        v
Multer guarda archivo en `/home/<username>`
        |
        v
Inserta metadatos en tabla files
        |
        v
Devuelve JSON de éxito al cliente

### 6.5. SCRIPTS ([ÍNDICE](#índice))

`nodejs/` incluye dos scripts de soporte importantes.

### 6.5.1. SYNC_BD ([ÍNDICE](#índice))

`sync_bd_to_sql.js` sincroniza la tabla `users` de MySQL con el archivo `mysql/02-insertar.sql`.

- Conecta a MySQL.
- Lee `username`, `password` e `is_admin` de la tabla `users`.
- Regenera un `INSERT INTO users ...` ordenado por `id`.
- Se ejecuta en el arranque del backend y tras registros o eliminaciones.

Este script es útil como snapshot y respaldo. Si no se necesita persistir un archivo SQL actualizado, se podría eliminar, pero entonces no habrá sincronización automática del estado de usuarios en `02-insertar.sql`.

### 6.5.2. WAIT_MYSQL ([ÍNDICE](#índice))

`wait-for-mysql.js` garantiza que MySQL acepte conexiones antes de iniciar el servidor Node.js.

- Intenta conectar hasta 30 veces con intervalos de 2 segundos.
- Evita que Node.js falle por arrancar antes de que MySQL esté listo.
- Es recomendable mantenerlo porque `depends_on` no garantiza que MySQL esté completamente operativo.

---

## 7. BASE DE DATOS ([ÍNDICE](#índice))

La base de datos se encuentra en el contenedor MySQL y se inicializa con scripts almacenados en `./mysql/`.

### 7.1. ESTRUCTURA ([ÍNDICE](#índice))

El modelo principal incluye tres tablas:

- `users`
  - `id`, `username`, `password`, `is_admin`, `token`, `token_expires`, `created_at`
  - Guarda credenciales y estado de sesión.
- `files`
  - `id`, `user_id`, `filename`, `original_name`, `filepath`, `filesize`, `uploaded_at`
  - Guarda metadatos de los archivos subidos por cada usuario.
- `shared_links`
  - `id`, `token`, `user_id`, `file_path`, `original_name`, `expires_at`, `created_at`, `downloads`
  - Administra los enlaces públicos generados.

### 7.2. ARCHIVOS ([ÍNDICE](#índice))

Los archivos que componen el servicio de base de datos son:

- `docker-compose.yml`
  - Define el servicio MySQL y los volúmenes.
- `mysql/01-inicio.sql`
  - Script de inicialización de la base de datos y tablas.
- `mysql/02-insertar.sql`
  - Snapshot de usuarios generado por `sync_bd_to_sql.js`.

### 7.3. INICIO ([ÍNDICE](#índice))

`mysql/01-inicio.sql` crea las tablas necesarias:

- `users` con datos de credenciales y token.
- `files` con relación a `users` y metadatos de archivos.
- `shared_links` con relación a `users` y enlaces públicos.

`docker-compose.yml` monta `./mysql` en `/docker-entrypoint-initdb.d` para ejecutar estos scripts al inicializar el contenedor.

---

## 8. SEGURIDAD ([ÍNDICE](#índice))

El proyecto incluye varias capas de seguridad:

- Autenticación basada en `username` / `password` con token de sesión.
- Tokens temporales válidos 1 hora.
- Verificación de token en casi todas las rutas API.
- Validación de rutas de archivos usando `path.resolve()` para prevenir acceso fuera del directorio del usuario.
- Roles de administrador con rutas `api/admin/*` restringidas.
- Restricción de acceso directo por URL a `admin.html` mediante validación vía `sessionStorage` desde `apps.html`.
- Nginx agrega cabeceras de seguridad básicas y maneja contenidos estáticos.
- El backend crea un admin por defecto si falta y mantiene la columna `is_admin`.
- El acceso público a archivos compartidos se controla mediante tokens únicos y expiración opcional.
