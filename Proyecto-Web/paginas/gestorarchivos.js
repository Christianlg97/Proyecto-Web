/**
 * TRABAJO FINAL - SISTEMA DE GESTIÓN DE ARCHIVOS
 * Este archivo contiene toda la lógica del frontend para la gestión de archivos,
 * incluyendo autenticación, visualización, carga, renombrado y temas.
 */

const API_URL = '/api'; // URL base para las peticiones al backend (vía Nginx proxy)

/**
 * Sistema de traducciones español/inglés
 * Contiene todos los textos de la interfaz para soportar multi-idioma.
 */
const translations = {
    es: {
        title: 'Gestor de archivos',
        darkMode: 'Oscuro',
        lightMode: 'Claro',
        loginTitle: 'Iniciar Sesión',
        uploadTitle: 'Subir Archivo',
        username: 'Usuario:',
        password: 'Contraseña:',
        usernamePlaceholder: 'Ingresa tu usuario',
        passwordPlaceholder: 'Ingresa tu contraseña',
        login: 'Ingresar',
        register: 'Registrarse',
        registerTitle: 'Registrarse',
        confirmPassword: 'Confirmar Contraseña:',
        regUsernamePlaceholder: 'Elige un nombre de usuario',
        regPasswordPlaceholder: 'Crea una contraseña',
        regConfirmPlaceholder: 'Repite la contraseña',
        usernameHint: 'Mínimo 3 caracteres',
        passwordHint: 'Mínimo 6 caracteres',
        selectFile: 'Seleccionar archivo:',
        upload: 'Subir Archivo',
        logout: 'Cerrar Sesión',
        maxSize: 'Tamaño máximo permitido:',
        unlimited: 'Ilimitado',
        welcome: 'Bienvenido:',
        myFiles: 'Mis Archivos',
        noFiles: 'No hay archivos aún. Sube tu primer archivo!',
        fileName: 'Nombre',
        size: 'Tamaño',
        uploaded: 'Modificado',
        actions: 'Acciones',
        preview: 'Vista',
        download: 'Descargar',
        delete: 'Eliminar',
        rename: 'Renombrar',
        confirmDelete: '¿Estás seguro de eliminar este archivo?',
        confirmDeleteFolder: '¿Estás seguro de eliminar esta carpeta y TODO su contenido?',
        sessionExpired: 'Sesión expirada',
        sessionClosed: 'Sesión cerrada',
        loginSuccess: 'Login exitoso!',
        loginError: 'Usuario o contraseña incorrectos',
        connectionError: 'Error de conexión con el servidor',
        uploadSuccess: 'Archivo subido exitosamente',
        uploadError: 'Error al subir el archivo',
        deleteSuccess: 'Elemento eliminado',
        deleteError: 'Error al eliminar',
        renameTitle: 'Renombrar Elemento',
        newName: 'Nuevo nombre:',
        newNamePlaceholder: 'Ingresa el nuevo nombre',
        cancel: 'Cancelar',
        save: 'Guardar',
        renameSuccess: 'Elemento renombrado exitosamente',
        renameError: 'Error al renombrar',
        fileExists: 'Ya existe un elemento con ese nombre',
        loading: 'Cargando archivos...',
        verifying: 'Verificando credenciales...',
        uploading: 'Subiendo archivo...',
        selectFileError: 'Selecciona un archivo',
        fileTooBig: 'El archivo excede el tamaño máximo permitido',
        searchPlaceholder: 'Buscar archivos por nombre...',
        searchResults: 'Resultados de búsqueda',
        showingAll: 'Mostrando todos los archivos',
        showingResults: 'Mostrando {{count}} resultado(s) para "{{query}}"',
        clearSearch: 'Limpiar búsqueda',
        noResults: 'No se encontraron archivos que coincidan con "{{query}}"',
        searchSuggestion: 'Prueba con otros términos o limpia la búsqueda',
        search: 'Buscar',
        clear: 'Limpiar',
        registerSuccess: 'Registro exitoso! Ya puedes iniciar sesión',
        registerError: 'Error al registrar usuario',
        userExists: 'El nombre de usuario ya está registrado',
        passwordMismatch: 'Las contraseñas no coinciden',
        usernameTooShort: 'El usuario debe tener al menos 3 caracteres',
        passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
        allFieldsRequired: 'Todos los campos son obligatorios',
        registering: 'Registrando usuario...',
        weakPassword: 'Contraseña débil',
        mediumPassword: 'Contraseña media',
        strongPassword: 'Contraseña fuerte',
        // Funcionalidad mover
        moveTitle: 'Mover Archivo',
        move: 'Mover',
        moveSuccess: 'Archivo movido exitosamente',
        moveError: 'Error al mover el archivo',
        mkdirTitle: 'Crear Nueva Carpeta',
        folderName: 'Nombre de la carpeta:',
        folderNamePlaceholder: 'ej: Documentos',
        folderNameHint: 'Puedes usar rutas anidadas (ej: fotos/2025).',
        createFolder: 'Crear Carpeta',
        create: 'Crear',
        mkdirSuccess: 'Carpeta creada exitosamente',
        mkdirError: 'Error al crear la carpeta',
        folderExists: 'La carpeta ya existe',
        // Navigation
        openFolder: 'Abrir',
        parentFolder: 'Subir',
        emptyFolder: 'Carpeta vacía',
        emptyFolderHint: 'Arrastra archivos o haz clic en la zona superior para seleccionar',
        currentPath: 'Ruta',
        // Send functionality
        sendTitle: 'Enviar archivos',
        send: 'Enviar',
        sendSuccess: 'Archivos enviados exitosamente',
        sendError: 'Error al enviar archivos',
        selectDestinationUser: 'Seleccionar usuario destino:',
        destinationFolder: 'Carpeta destino (opcional):',
        destinationFolderPlaceholder: 'ej: Recibidos',
        destinationFolderHint: 'Si se deja vacío, se usará "Recibidos"',
        selectedFiles: 'Archivos seleccionados',
        noFilesSelected: 'No hay archivos seleccionados',
        selectAll: 'Seleccionar todo',
        unselectAll: 'Deseleccionar todo',
        // Filtros
        filterAll: 'Ninguno',
        filterFolders: 'Carpetas',
        filterFiles: 'Archivos',
        allExtensions: 'Todas las extensiones',
        images: 'Imágenes',
        videos: 'Videos',
        audio: 'Audio',
        documents: 'Documentos',
        archives: 'Comprimidos',
        code: 'Código',
        clearFilters: 'Limpiar filtros',
        folderSize: 'Tamaño de carpeta',
        shareTitle: 'Compartir archivo',
        expiration: 'Expiración:',
        never: 'Nunca',
        oneHour: '1 hora',
        oneDay: '1 día',
        sevenDays: '7 días',
        shareUrl: 'Enlace público:',
        generateLink: 'Generar enlace',
        close: 'Cerrar',
        copy: 'Copiar',
        viewFilesOf: 'Ver archivos de',
        meAdmin: 'Yo (admin)',
        adminPanel: 'Panel admin',
        backToApp: 'Volver',
        generatingLink: 'Generando enlace...',
        linkCopied: '¡Enlace copiado!',
        themeEditor: 'Temas',
        themeEditorTitle: 'Editor de Temas',
        primaryColor: 'Color Primario:',
        secondaryColor: 'Color Secundario:',
        backgroundColor: 'Fondo:',
        textColor: 'Texto:',
        accentColor: 'Acento:',
        successColor: 'Éxito:',
        dangerColor: 'Error:',
        warningColor: 'Advertencia:',
        themePresets: 'Temas Predefinidos:',
        resetTheme: 'Restablecer',
        saveTheme: 'Guardar Tema',
        themeSaved: '¡Tema guardado!',
        themeReset: 'Tema restablecido',
        settings: 'Ajustes',
        appearance: 'Apariencia',
        language: 'Idioma',
        folders: 'carpetas',
        files: 'archivos',
        showingFolders: 'Mostrando solo carpetas',
        showingFiles: 'Mostrando solo archivos',
        showingFilesCategory: 'Mostrando archivos: {{category}}',
        of: 'de',
        downloadZip: 'Descargar como ZIP',
        share: 'Compartir',
        deleting: 'Eliminando...',
        moving: 'Moviendo...',
        sending: 'Enviando archivos...',
        settings: 'Configuración',
        selectUser: 'Seleccionar usuario...',
        received: 'Recibidos',
        path: 'Ruta',
        browse: 'Examinar...',
        noFileSelected: 'No se ha seleccionado ningún archivo',
        fileType: 'Tipo',
        cancelUpload: 'Cancelar Subida'
    },
    en: {
        title: 'File Management System',
        darkMode: 'Dark',
        lightMode: 'Light',
        loginTitle: 'Login',
        uploadTitle: 'Upload File',
        username: 'Username:',
        password: 'Password:',
        usernamePlaceholder: 'Enter your username',
        passwordPlaceholder: 'Enter your password',
        login: 'Login',
        register: 'Register',
        registerTitle: 'Register',
        confirmPassword: 'Confirm Password:',
        regUsernamePlaceholder: 'Choose a username',
        regPasswordPlaceholder: 'Create a password',
        regConfirmPlaceholder: 'Repeat password',
        usernameHint: 'Minimum 3 characters',
        passwordHint: 'Minimum 6 characters',
        selectFile: 'Select file:',
        upload: 'Upload File',
        logout: 'Logout',
        maxSize: 'Maximum file size:',
        unlimited: 'Unlimited',
        welcome: 'Welcome:',
        myFiles: 'My Files',
        noFiles: 'No files yet. Upload your first file!',
        fileName: 'Name',
        size: 'Size',
        uploaded: 'Modified',
        actions: 'Actions',
        preview: 'Preview',
        download: 'Download',
        delete: 'Delete',
        rename: 'Rename',
        confirmDelete: 'Are you sure you want to delete this file?',
        confirmDeleteFolder: 'Are you sure you want to delete this folder and ALL its contents?',
        sessionExpired: 'Session expired',
        sessionClosed: 'Session closed',
        loginSuccess: 'Login successful!',
        loginError: 'Invalid username or password',
        connectionError: 'Connection error',
        uploadSuccess: 'File uploaded successfully',
        uploadError: 'Error uploading file',
        deleteSuccess: 'Item deleted',
        deleteError: 'Error deleting item',
        renameTitle: 'Rename Item',
        newName: 'New name:',
        newNamePlaceholder: 'Enter new name',
        cancel: 'Cancel',
        save: 'Save',
        renameSuccess: 'Item renamed successfully',
        renameError: 'Error renaming item',
        fileExists: 'An item with that name already exists',
        loading: 'Loading files...',
        verifying: 'Verifying credentials...',
        uploading: 'Uploading file...',
        selectFileError: 'Please select a file',
        fileTooBig: 'File exceeds the maximum allowed size',
        searchPlaceholder: 'Search files by name...',
        searchResults: 'Search results',
        showingAll: 'Showing all files',
        showingResults: 'Showing {{count}} result(s) for "{{query}}"',
        clearSearch: 'Clear search',
        noResults: 'No files found matching "{{query}}"',
        searchSuggestion: 'Try different terms or clear the search',
        search: 'Search',
        clear: 'Clear',
        registerSuccess: 'Registration successful! You can now login',
        registerError: 'Error registering user',
        userExists: 'Username already exists',
        passwordMismatch: 'Passwords do not match',
        usernameTooShort: 'Username must be at least 3 characters',
        passwordTooShort: 'Password must be at least 6 characters',
        allFieldsRequired: 'All fields are required',
        registering: 'Registering user...',
        weakPassword: 'Weak password',
        mediumPassword: 'Medium password',
        strongPassword: 'Strong password',
        // Move functionality
        moveTitle: 'Move File',
        move: 'Move',
        moveSuccess: 'File moved successfully',
        moveError: 'Error moving file',
        mkdirTitle: 'Create New Folder',
        folderName: 'Folder name:',
        folderNamePlaceholder: 'e.g., Documents',
        folderNameHint: 'You can use nested paths (e.g., photos/2025).',
        createFolder: 'Create Folder',
        create: 'Create',
        mkdirSuccess: 'Folder created successfully',
        mkdirError: 'Error creating folder',
        folderExists: 'Folder already exists',
        // Navigation
        openFolder: 'Open',
        parentFolder: 'Up',
        emptyFolder: 'Empty folder',
        emptyFolderHint: 'Drag files or click the zone above to select',
        currentPath: 'Path',
        // Send functionality
        sendTitle: 'Send Files',
        send: 'Send',
        sendSuccess: 'Files sent successfully',
        sendError: 'Error sending files',
        selectDestinationUser: 'Select destination user:',
        destinationFolder: 'Destination folder (optional):',
        destinationFolderPlaceholder: 'e.g., Received',
        destinationFolderHint: 'If empty, "Received" will be used',
        selectedFiles: 'Selected files',
        noFilesSelected: 'No files selected',
        selectAll: 'Select all',
        unselectAll: 'Unselect all',
        // Filters
        filterAll: 'None',
        filterFolders: 'Folders',
        filterFiles: 'Files',
        allExtensions: 'All extensions',
        images: 'Images',
        videos: 'Videos',
        audio: 'Audio',
        documents: 'Documents',
        archives: 'Archives',
        code: 'Code',
        clearFilters: 'Clear filters',
        folderSize: 'Folder size',
        shareTitle: 'Share',
        expiration: 'Expiration:',
        never: 'Never',
        oneHour: '1 hour',
        oneDay: '1 day',
        sevenDays: '7 days',
        shareUrl: 'Public link:',
        generateLink: 'Make link',
        close: 'Close',
        copy: 'Copy',
        viewFilesOf: 'View files of',
        meAdmin: 'Me (admin)',
        adminPanel: 'Admin panel',
        backToApp: 'Back',
        generatingLink: 'Generating link...',
        linkCopied: 'Link copied!',
        themeEditor: 'Themes',
        themeEditorTitle: 'Theme Editor',
        primaryColor: 'Primary Color:',
        secondaryColor: 'Secondary Color:',
        backgroundColor: 'Background:',
        textColor: 'Text:',
        accentColor: 'Accent:',
        successColor: 'Success:',
        dangerColor: 'Error:',
        warningColor: 'Warning:',
        themePresets: 'Preset Themes:',
        resetTheme: 'Reset',
        saveTheme: 'Save Theme',
        themeSaved: 'Theme saved!',
        themeReset: 'Theme reset',
        settings: 'Settings',
        appearance: 'Appearance',
        language: 'Language',
        folders: 'folders',
        files: 'files',
        showingFolders: 'Showing folders only',
        showingFiles: 'Showing files only',
        showingFilesCategory: 'Showing files: {{category}}',
        of: 'of',
        downloadZip: 'Download as ZIP',
        share: 'Share',
        deleting: 'Deleting...',
        moving: 'Moving...',
        sending: 'Sending files...',
        settings: 'Settings',
        selectUser: 'Select user...',
        received: 'Received',
        path: 'Path',
        browse: 'Browse...',
        noFileSelected: 'No file selected',
        fileType: 'Type',
        cancelUpload: 'Cancel Upload'
    }
};

// ============================================================
// Estado Global y Variables de Sesión
// ============================================================
let currentLanguage = localStorage.getItem('language') || 'es';
let currentFileToRename = null;
let allFiles = []; // Lista completa de archivos del usuario actual
let filteredFiles = []; // Lista filtrada según criterios de búsqueda/extensión
let searchTimeout = null;
let currentPath = ''; // Ruta actual en el sistema de archivos del usuario
let selectedFiles = new Set(); // Archivos seleccionados para acciones en lote

/**
 * Escapa caracteres especiales de HTML para prevenir ataques XSS.
 * @param {string} str - El texto a escapar.
 * @returns {string} - El texto escapado de forma segura.
 */
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Obtiene la sesión del usuario actual desde localStorage.
 * Valida la existencia y expiración del token.
 * @returns {Object|null} - Datos del usuario o null si no hay sesión válida.
 */
function getUserSession() {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        const user = JSON.parse(userStr);
        if (!user) return null;

        // Verificar si la sesión ha expirado (1 hora por defecto)
        if (Date.now() > user.expires) {
            logout();
            return null;
        }
        return user;
    } catch (e) {
        console.error('Error al parsear la sesión:', e);
        return null;
    }
}

/**
 * Almacena las cuotas del usuario actual para usarlas en la UI
 * @type {Object}
 */
let userQuotaInfo = {
    quota_bytes: 5 * 1024 * 1024 * 1024,          // 5GB por defecto
    max_file_size_bytes: 100 * 1024 * 1024,       // 100MB por defecto
    bandwidth_kbps: 0,                             // 0 = sin límite
    used_bytes: 0
};

/**
 * Carga las estadísticas de cuota del usuario desde el servidor
 * Se debe llamar después de iniciar sesión
 */
async function loadUserQuotaInfo() {
    const user = getUserSession();
    if (!user || !user.token) return;

    try {
        const response = await fetch(`${API_URL}/user/stats?token=${user.token}`);
        const data = await response.json();

        if (data.success && data.stats) {
            userQuotaInfo = data.stats;
            console.log('Cuotas cargadas:', {
                cuota_disco: `${formatBytesShort(userQuotaInfo.quota_bytes)}`,
                tamaño_máximo_archivo: `${formatBytesShort(userQuotaInfo.max_file_size_bytes)}`,
                usado: `${formatBytesShort(userQuotaInfo.used_bytes)}`
            });
        }
    } catch (error) {
        console.error('Error cargando cuotas del usuario:', error);
    }
}

/**
 * Obtiene el texto formateado de la cuota máxima de archivo
 * Usado en mensajes de validación y UI
 * @returns {string} - Texto formateado o "Ilimitado"
 */
function getFormattedMaxFileSize() {
    if (!userQuotaInfo.max_file_size_bytes || userQuotaInfo.max_file_size_bytes <= 0) {
        return translations[currentLanguage].unlimited || 'Unlimited';
    }
    return formatBytesShort(userQuotaInfo.max_file_size_bytes);
}

/**
 * Obtiene el texto formateado de la cuota de disco total
 * Usado en mensajes de validación y UI
 * @returns {string} - Texto formateado
 */
function getFormattedTotalQuota() {
    return formatBytesShort(userQuotaInfo.quota_bytes);
}

/**
 * Formatea bytes a formato corto (usado en la UI)
 * @param {number} bytes - Bytes a formatear
 * @returns {string} - Texto formateado (ej: "5 GB")
 */
function formatBytesShort(bytes) {
    if (bytes === 0) return '0 B';
    if (!bytes) return '--';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Admin: navegar archivos de otros usuarios desde la pantalla principal
let adminBrowsingUsername = null; // null => navegando archivos propios

/**
 * Detecta si el usuario logueado es administrador y habilita las opciones extra.
 * @param {Object} user - Objeto de usuario actual.
 */
async function detectAndEnableAdminUI(user) {
    if (!user?.token) return;

    if (user.isAdmin) {
        enableAdminUI(user);
        return;
    }

    const adminBar = document.getElementById('adminBrowseBar');
    if (adminBar) adminBar.style.display = 'none';

    try {
        const resp = await fetch(`${API_URL}/admin/users?token=${user.token}`);
        if (resp.status === 200) {
            const data = await resp.json();
            if (data?.success) {
                const updatedUser = { ...user, isAdmin: true };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                enableAdminUI(updatedUser, data.users);
            }
        }
    } catch {
        // ignore
    }
}

/**
 * Habilita los componentes de administrador en la interfaz.
 * @param {Object} user - Usuario administrador.
 * @param {Array} preloadedUsers - Opcional: lista de usuarios ya cargada.
 */
function enableAdminUI(user, preloadedUsers) {
    const adminBar = document.getElementById('adminBrowseBar');
    const select = document.getElementById('adminBrowseUserSelect');

    if (adminBar) adminBar.style.display = '';

    if (!select) return;

    const fillSelect = (users) => {
        const usernames = (users || [])
            .map(u => (typeof u === 'object' ? u.username : u))
            .filter(u => u && u !== user.username);

        select.innerHTML = '';
        const me = document.createElement('option');
        me.value = '';
        me.textContent = translations[currentLanguage].meAdmin || 'Yo (admin)';
        select.appendChild(me);

        usernames.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u;
            opt.textContent = u;
            select.appendChild(opt);
        });
    };

    if (Array.isArray(preloadedUsers)) {
        fillSelect(preloadedUsers);
    } else {
        fetch(`${API_URL}/admin/users?token=${user.token}`)
            .then(r => r.json())
            .then(data => {
                if (!data.success || !Array.isArray(data.users)) return;
                fillSelect(data.users);
            })
            .catch(() => { });
    }

    select.onchange = () => {
        adminBrowsingUsername = select.value || null;
        currentPath = '';
        selectedFiles.clear();
        loadFileList();
    };
}

// Variables para filtros
let currentFilterType = 'all';
let currentExtensionFilter = 'all';

// Variables para el modal de mover
let moveFileInfo = { filename: null, displayName: null };
let moveCurrentPath = '';
let bulkMoveMode = false;

// Variables para el modal de enviar
let availableUsers = [];

// ============================================================
// Funciones de utilidad
// ============================================================

/**
 * Implementación del algoritmo MD5 para hashing de cadenas.
 * Utilizado para procesar contraseñas antes del envío.
 * @param {string} string - La cadena a hashear.
 * @returns {string} - Hash MD5 en formato hexadecimal.
 */
function md5Hash(string) {
    function rotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function addUnsigned(lX, lY) {
        let lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        if (lX4 | lY4) {
            if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }

    function FF(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(string) {
        let lWordCount;
        const lMessageLength = string.length;
        const lNumberOfWords_temp1 = lMessageLength + 8;
        const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        const lWordArray = Array(lNumberOfWords - 1);
        let lBytePosition = 0;
        let lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    }

    function wordToHex(lValue) {
        let wordToHexValue = "",
            wordToHexValue_temp = "",
            lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValue_temp = "0" + lByte.toString(16);
            wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
        }
        return wordToHexValue;
    }

    function utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        let utftext = "";
        for (let n = 0; n < string.length; n++) {
            const c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }

    let x = [];
    let k, AA, BB, CC, DD, a, b, c, d;
    const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    string = utf8Encode(string);
    x = convertToWordArray(string);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }

    const temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
    return temp.toLowerCase();
}

// ============================================================
// Funciones de filtrado
// ============================================================

/**
 * Filtra los archivos según los criterios seleccionados (búsqueda, tipo, extensión).
 */
function applyFilters() {
    if (!allFiles || allFiles.length === 0) {
        filteredFiles = [];
        displayFiles([]);
        return;
    }

    let result = [...allFiles];

    if (currentFilterType === 'folders') {
        result = result.filter(item => item.isDirectory);
    } else if (currentFilterType === 'files') {
        result = result.filter(item => !item.isDirectory);
    }

    if (currentExtensionFilter !== 'all' && currentFilterType !== 'folders') {
        const extensionCategories = {
            images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'],
            videos: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv'],
            audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
            documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt'],
            archives: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
            code: ['js', 'html', 'css', 'json', 'py', 'java', 'cpp', 'c', 'php', 'xml', 'yaml']
        };

        const allowedExtensions = extensionCategories[currentExtensionFilter] || [];

        result = result.filter(item => {
            if (item.isDirectory) return false;
            const ext = item.name.split('.').pop().toLowerCase();
            return allowedExtensions.includes(ext);
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        const query = searchInput.value.toLowerCase().trim();
        result = result.filter(item =>
            item.name.toLowerCase().includes(query)
        );
    }

    filteredFiles = result;
    displayFiles(result);
    updateFilterStats();
}

/**
 * Actualiza los contadores y estadísticas de filtros en la UI.
 */
function updateFilterStats() {
    const statsDiv = document.getElementById('searchStats');
    if (!statsDiv) return;

    const totalItems = allFiles.length;
    const filteredCount = filteredFiles.length;
    const searchInput = document.getElementById('searchInput');
    const searchQuery = searchInput ? searchInput.value.trim() : '';

    let statsText = '';

    if (searchQuery) {
        statsText = translations[currentLanguage].showingResults
            .replace('{{count}}', filteredCount)
            .replace('{{query}}', searchQuery);
    } else if (currentFilterType !== 'all' || currentExtensionFilter !== 'all') {
        let filterDesc = '';
        if (currentFilterType === 'folders') {
            filterDesc = translations[currentLanguage].showingFolders;
        } else if (currentFilterType === 'files') {
            if (currentExtensionFilter !== 'all') {
                const label = translations[currentLanguage][currentExtensionFilter] || currentExtensionFilter;
                filterDesc = translations[currentLanguage].showingFilesCategory.replace('{{category}}', label.toLowerCase());
            } else {
                filterDesc = translations[currentLanguage].showingFiles;
            }
        }

        statsText = `${filterDesc} (${filteredCount} ${translations[currentLanguage].of} ${totalItems})`;
    } else {
        statsText = `${translations[currentLanguage].showingAll} (${totalItems})`;
    }

    statsDiv.innerHTML = `<span>${statsText}</span>`;

    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        if (currentFilterType !== 'all' || currentExtensionFilter !== 'all' || searchQuery) {
            clearFiltersBtn.style.display = 'inline-flex';
        } else {
            clearFiltersBtn.style.display = 'none';
        }
    }
}

function clearAllFilters() {
    const filterType = document.getElementById('filterType');
    const filterExtension = document.getElementById('filterExtension');
    const searchInput = document.getElementById('searchInput');

    if (filterType) filterType.value = 'all';
    if (filterExtension) {
        filterExtension.value = 'all';
        document.getElementById('extensionFilterGroup').style.display = 'none';
    }
    if (searchInput) {
        searchInput.value = '';
    }

    currentFilterType = 'all';
    currentExtensionFilter = 'all';
    syncFilterMenuState();

    applyFilters();
}

function syncFilterMenuState() {
    document.querySelectorAll('.filter-option').forEach(option => {
        option.classList.toggle('active', option.dataset.filterValue === currentFilterType);
    });
}

function placeManagerControls() {
    const pathBar = document.getElementById('currentPath');
    const fileList = document.getElementById('fileList');
    const fileListControls = document.getElementById('fileListControls');
    const searchContainer = document.getElementById('searchContainer');
    const actionBar = document.querySelector('.manager-toolbar');
    const toolbarLeft = actionBar ? actionBar.querySelector('.toolbar-left') : null;
    const toolbarRight = actionBar ? actionBar.querySelector('.toolbar-right') : null;
    const adminBrowseBar = document.getElementById('adminBrowseBar');
    const extensionGroup = document.getElementById('extensionFilterGroup');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    if (actionBar) {
        const targetLeft = toolbarLeft || actionBar;
        const targetRight = toolbarRight || actionBar;

        if (extensionGroup && extensionGroup.parentNode !== targetLeft) {
            targetLeft.appendChild(extensionGroup);
        }
        if (clearFiltersBtn && clearFiltersBtn.parentNode !== targetLeft) {
            targetLeft.appendChild(clearFiltersBtn);
        }
        if (adminBrowseBar && adminBrowseBar.parentNode !== targetRight) {
            adminBrowseBar.classList.add('admin-browse-inline');
            targetRight.appendChild(adminBrowseBar);
        }
    }

    if (!pathBar || !fileList) return;

    if (fileListControls) {
        if (searchContainer && searchContainer.parentNode !== fileListControls) {
            fileListControls.appendChild(searchContainer);
        }
        if (pathBar.parentNode !== fileListControls) {
            fileListControls.appendChild(pathBar);
        }
    }
}

function setupFilterMenu() {
    const menu = document.querySelector('.filter-menu');
    const toggle = document.getElementById('filterMenuBtn');
    const filterType = document.getElementById('filterType');
    if (!menu || !toggle || !filterType) return;

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        menu.classList.toggle('open');
    });

    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', () => {
            filterType.value = option.dataset.filterValue;
            filterType.dispatchEvent(new Event('change', { bubbles: true }));
            menu.classList.remove('open');
        });
    });

    document.addEventListener('click', (event) => {
        if (!menu.contains(event.target)) {
            menu.classList.remove('open');
        }
    });

    syncFilterMenuState();
}

// ============================================================
// Funciones de idioma y tema
// ============================================================

/**
 * Cambia el idioma de la interfaz y actualiza el DOM.
 * @param {string} lang - Código de idioma ('es' o 'en').
 */
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.getElementById('htmlTag').setAttribute('lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (translations[lang][key]) {
            element.title = translations[lang][key];
        }
    });

    const langBtn = document.getElementById('languageToggle').querySelector('span');
    langBtn.textContent = lang === 'es' ? 'English' : 'Español';

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = translations[lang].searchPlaceholder;
    }

    const filterType = document.getElementById('filterType');
    if (filterType) {
        const options = filterType.options;
        options[0].text = translations[lang].filterAll;
        options[1].text = translations[lang].filterFolders;
        options[2].text = translations[lang].filterFiles;
    }

    const filterExtension = document.getElementById('filterExtension');
    if (filterExtension) {
        const options = filterExtension.options;
        options[0].text = translations[lang].allExtensions;
        options[1].text = translations[lang].images;
        options[2].text = translations[lang].videos;
        options[3].text = translations[lang].audio;
        options[4].text = translations[lang].documents;
        options[5].text = translations[lang].archives;
        options[6].text = translations[lang].code;
    }

    const shareExpiration = document.getElementById('shareExpiration');
    if (shareExpiration) {
        const options = shareExpiration.options;
        options[0].text = translations[lang].never;
        options[1].text = translations[lang].oneHour;
        options[2].text = translations[lang].oneDay;
        options[3].text = translations[lang].sevenDays;
    }

    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        const span = clearFiltersBtn.querySelector('span');
        if (span) span.textContent = translations[lang].clearFilters;
    }

    const destFolder = document.getElementById('destinationFolderInput');
    if (destFolder) {
        destFolder.placeholder = translations[lang].received;
        if (destFolder.value === translations[lang === 'es' ? 'en' : 'es'].received) {
            destFolder.value = translations[lang].received;
        }
    }

    const destUser = document.getElementById('destinationUser');
    if (destUser && destUser.options[0]) {
        destUser.options[0].text = translations[lang].selectUser;
    }

    updateFilterStats();

    if (currentPath !== undefined) {
        updatePathDisplay(currentPath);
    }
}

// ============================================================
// Funciones de navegación de carpetas
// ============================================================

/**
 * Actualiza la visualización de la ruta actual (breadcrumb).
 * @param {string} path - Ruta relativa actual.
 */
function updatePathDisplay(path) {
    let pathBar = document.getElementById('currentPath');
    if (!pathBar) {
        const container = document.getElementById('fileList');
        pathBar = document.createElement('div');
        pathBar.id = 'currentPath';
        pathBar.className = 'path-bar';
        container.parentNode.insertBefore(pathBar, container);
    }

    let html = `<i class="fas fa-folder-open"></i> ${translations[currentLanguage].currentPath}: /${escapeHTML(path)}`;
    if (path) {
        html += ` <button onclick="goToParent()" class="path-btn" title="${translations[currentLanguage].parentFolder}"><i class="fas fa-level-up-alt"></i> ${translations[currentLanguage].parentFolder}</button>`;
    }
    pathBar.innerHTML = html;
    placeManagerControls();
}

/**
 * Navega hacia una carpeta específica.
 * @param {string} folderPath - Ruta de la carpeta a abrir.
 */
function openFolder(folderPath) {
    currentPath = folderPath;
    selectedFiles.clear();
    loadFileList();
}

/**
 * Navega hacia la carpeta padre de la ruta actual.
 */
function goToParent() {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    currentPath = parts.join('/');
    selectedFiles.clear();
    loadFileList();
}

// ============================================================
// Funciones de selección de archivos
// ============================================================

function toggleFileSelection(filePath) {
    if (selectedFiles.has(filePath)) {
        selectedFiles.delete(filePath);
    } else {
        selectedFiles.add(filePath);
    }
    updateSelectedCount();
    updateCheckboxState();
}

function selectAllFiles() {
    filteredFiles.forEach(item => {
        selectedFiles.add(item.path);
    });
    updateSelectedCount();
    updateCheckboxState();
}

function unselectAllFiles() {
    selectedFiles.clear();
    updateSelectedCount();
    updateCheckboxState();
}

function updateSelectedCount() {
    const countSpan = document.getElementById('selectedCount');
    if (countSpan) {
        countSpan.textContent = selectedFiles.size;
    }
    const selectedActions = document.getElementById('selectedActions');
    if (selectedActions) {
        selectedActions.style.display = selectedFiles.size > 0 ? 'inline-flex' : 'none';
    }
}

function updateCheckboxState() {
    const checkboxes = document.querySelectorAll('.file-checkbox[data-path]');
    checkboxes.forEach(cb => {
        const path = cb.getAttribute('data-path');
        cb.checked = selectedFiles.has(path);
    });

    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        const fileCheckboxes = document.querySelectorAll('.file-checkbox[data-path]');
        const checkedCheckboxes = document.querySelectorAll('.file-checkbox[data-path]:checked');
        selectAllCheckbox.checked = fileCheckboxes.length > 0 && fileCheckboxes.length === checkedCheckboxes.length;
        selectAllCheckbox.indeterminate = checkedCheckboxes.length > 0 && checkedCheckboxes.length < fileCheckboxes.length;
    }
}

function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const fileCheckboxes = document.querySelectorAll('.file-checkbox[data-path]');

    if (selectAllCheckbox.checked) {
        fileCheckboxes.forEach(cb => {
            const path = cb.getAttribute('data-path');
            if (path) selectedFiles.add(path);
        });
    } else {
        selectedFiles.clear();
    }

    updateSelectedCount();
    updateCheckboxState();
}

function getSelectedItems() {
    return Array.from(selectedFiles).map(itemPath => {
        const item = allFiles.find(file => file.path === itemPath);
        return {
            path: itemPath,
            name: item ? item.name : itemPath.split('/').pop(),
            isDirectory: item ? item.isDirectory : false
        };
    });
}

function ensureHasSelection() {
    if (selectedFiles.size > 0) return true;
    showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${translations[currentLanguage].noFilesSelected}`, 'error');
    return false;
}

// ============================================================
// Funciones para mover archivo con navegador de carpetas
// ============================================================

function openMoveBrowserModal(sourcePath, displayName) {
    bulkMoveMode = false;
    moveFileInfo = { sourcePath, displayName };
    moveCurrentPath = '';
    document.getElementById('moveBrowserFileNameDisplay').innerHTML = `<i class="fas fa-file"></i> ${displayName}`;
    document.getElementById('moveBrowserModal').style.display = 'block';
    loadMoveFolderList();
}

function openBulkMoveModal() {
    if (!ensureHasSelection()) return;
    bulkMoveMode = true;
    moveFileInfo = { sourcePath: null, displayName: null };
    moveCurrentPath = '';
    document.getElementById('moveBrowserFileNameDisplay').innerHTML =
        `<i class="fas fa-layer-group"></i> ${selectedFiles.size} ${translations[currentLanguage].selectedFiles}`;
    document.getElementById('moveBrowserModal').style.display = 'block';
    loadMoveFolderList();
}

function closeMoveBrowserModal() {
    document.getElementById('moveBrowserModal').style.display = 'none';
    moveFileInfo = { filename: null, displayName: null };
    bulkMoveMode = false;
}

async function loadMoveFolderList() {
    const user = getUserSession();
    if (!user) return;

    try {
        let url = `${API_URL}/files/${user.username}?token=${user.token}`;
        if (moveCurrentPath) {
            url += `&path=${encodeURIComponent(moveCurrentPath)}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
            const folders = data.files.filter(f => f.isDirectory);
            displayMoveFolderList(folders, data.currentPath);
        } else {
            showMessage('uploadMessage', translations[currentLanguage].errorLoadingFiles || 'Error cargando carpetas', 'error');
        }
    } catch (error) {
        console.error('Error cargando carpetas:', error);
    }
}

function displayMoveFolderList(folders, currentPath) {
    const container = document.getElementById('moveFolderList');
    if (!container) return;

    let html = `<div class="path-bar">${translations[currentLanguage].currentPath}: /${escapeHTML(currentPath)}</div>`;
    if (currentPath) {
        html += `<div><button onclick="moveGoToParent()" class="path-btn"><i class="fas fa-level-up-alt"></i> ${translations[currentLanguage].parentFolder}</button></div>`;
    }
    if (folders.length === 0) {
        html += `<p>${translations[currentLanguage].emptyFolder}</p>`;
    } else {
        html += '<ul style="list-style: none; padding: 0;">';
        folders.forEach(folder => {
            html += `<li style="padding: 8px; cursor: pointer; border-bottom: 1px solid var(--border-color);" onclick="moveEnterFolder('${folder.path.replace(/'/g, "\\'")}')">
                <i class="fas fa-folder" style="color: #ffc107;"></i> ${escapeHTML(folder.name)}
            </li>`;
        });
        html += '</ul>';
    }
    container.innerHTML = html;

    const movePathDisplay = document.getElementById('moveCurrentPath');
    if (movePathDisplay) {
        movePathDisplay.innerHTML = `${translations[currentLanguage].currentPath}: /${escapeHTML(currentPath)}`;
    }
}

function moveEnterFolder(path) {
    moveCurrentPath = path;
    loadMoveFolderList();
}

function moveGoToParent() {
    if (!moveCurrentPath) return;
    const parts = moveCurrentPath.split('/');
    parts.pop();
    moveCurrentPath = parts.join('/');
    loadMoveFolderList();
}

async function moveFileToCurrentFolder() {
    if (!bulkMoveMode && !moveFileInfo.sourcePath) return;
    const destinationFolder = moveCurrentPath;
    const user = getUserSession();
    if (!user) {
        closeMoveBrowserModal();
        return;
    }

    showMessage('uploadMessage', `<i class="fas fa-spinner fa-spin"></i> ${translations[currentLanguage].moving}`, 'info');

    try {
        if (bulkMoveMode) {
            for (const sourcePath of Array.from(selectedFiles)) {
                const response = await fetch(`${API_URL}/move/${user.username}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: user.token,
                        sourcePath,
                        destinationFolder: destinationFolder
                    })
                });
                const data = await response.json();
                if (!data.success) {
                    showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${escapeHTML(data.message || translations[currentLanguage].moveError)}`, 'error');
                    return;
                }
            }
            showMessage('uploadMessage', `<i class="fas fa-check-circle"></i> ${translations[currentLanguage].moveSuccess}`, 'success');
            selectedFiles.clear();
            updateSelectedCount();
            closeMoveBrowserModal();
            loadFileList();
            return;
        }

        const response = await fetch(`${API_URL}/move/${user.username}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: user.token,
                sourcePath: moveFileInfo.sourcePath,
                destinationFolder: destinationFolder
            })
        });

        const data = await response.json();
        if (data.success) {
            showMessage('uploadMessage', `<i class="fas fa-check-circle"></i> ${translations[currentLanguage].moveSuccess}`, 'success');
            closeMoveBrowserModal();
            loadFileList();
        } else {
            showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${escapeHTML(data.message || translations[currentLanguage].moveError)}`, 'error');
        }
    } catch (error) {
        console.error('Error moviendo:', error);
        showMessage('uploadMessage', `<i class="fas fa-exclamation-triangle"></i> ${translations[currentLanguage].connectionError}`, 'error');
    }
}

// ============================================================
// Funciones para enviar archivos
// ============================================================

async function loadAvailableUsers() {
    try {
        const user = getUserSession();
        if (!user) return;

        const response = await fetch(`${API_URL}/users?token=${user.token}`);
        const data = await response.json();
        if (data.success) {
            availableUsers = data.users
                .map(u => (typeof u === 'object' ? u.username : u))
                .filter(u => u);
            populateUserSelect();
        } else {
            availableUsers = [];
            populateUserSelect();
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        availableUsers = [];
        populateUserSelect();
    }
}

function populateUserSelect() {
    const select = document.getElementById('destinationUser');
    if (!select) return;

    select.innerHTML = `<option value="">${translations[currentLanguage].selectUser}</option>`;
    availableUsers.forEach(username => {
        const option = document.createElement('option');
        option.value = username;
        option.textContent = username;
        select.appendChild(option);
    });
}

function openSendModal() {
    if (selectedFiles.size === 0) {
        showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${translations[currentLanguage].noFilesSelected}`, 'error');
        return;
    }

    const fileList = document.getElementById('sendFileList');
    if (!fileList) return;

    let html = '<ul style="list-style: none; padding: 0;">';

    const selectedArray = Array.from(selectedFiles);
    selectedArray.forEach(filePath => {
        const fileName = filePath.split('/').pop();
        const fileItem = allFiles.find(f => f.path === filePath);
        const isDir = fileItem ? fileItem.isDirectory : false;
        const icon = isDir ? 'fa-folder' : 'fa-file';
        const iconColor = isDir ? '#ffd166' : '#4361ee';
        html += `<li style="padding: 4px 0;"><i class="fas ${icon}" style="margin-right: 8px; color: ${iconColor};"></i> ${escapeHTML(fileName)}</li>`;
    });
    html += '</ul>';

    fileList.innerHTML = html;

    loadAvailableUsers();

    document.getElementById('sendModal').style.display = 'block';
}

function closeSendModal() {
    document.getElementById('sendModal').style.display = 'none';
    const destUser = document.getElementById('destinationUser');
    if (destUser) destUser.value = '';
    const destFolder = document.getElementById('destinationFolderInput');
    if (destFolder) destFolder.value = translations[currentLanguage].received;
}

async function sendFiles() {
    const destUserEl = document.getElementById('destinationUser');
    const destinationUser = destUserEl ? destUserEl.value : '';

    if (!destinationUser) {
        showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${translations[currentLanguage].selectDestinationUser}`, 'error');
        return;
    }

    const destFolderEl = document.getElementById('destinationFolderInput');
    const destinationFolder = (destFolderEl ? destFolderEl.value.trim() : '') || translations[currentLanguage].received;

    const user = getUserSession();
    if (!user) {
        closeSendModal();
        return;
    }

    showMessage('uploadMessage', `<i class="fas fa-spinner fa-spin"></i> ${translations[currentLanguage].sending}`, 'info');

    try {
        const response = await fetch(`${API_URL}/send/${user.username}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: user.token,
                files: Array.from(selectedFiles),
                targetUsername: destinationUser,
                targetFolder: destinationFolder
            })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('uploadMessage', `<i class="fas fa-check-circle"></i> ${translations[currentLanguage].sendSuccess}`, 'success');
            selectedFiles.clear();
            updateSelectedCount();
            closeSendModal();
            loadFileList();
        } else {
            showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${escapeHTML(data.message || translations[currentLanguage].sendError)}`, 'error');
        }
    } catch (error) {
        console.error('Error enviando archivos:', error);
        showMessage('uploadMessage', `<i class="fas fa-exclamation-triangle"></i> ${translations[currentLanguage].connectionError}`, 'error');
    }
}

// ============================================================
// Funciones de Edición (Renombrar, Crear Carpeta, Eliminar)
// ============================================================

function openRenameModal(path, oldName, isFolder = false) {
    currentFileToRename = { path, oldName, isFolder };
    const input = document.getElementById('newFileName');
    input.value = oldName;
    document.getElementById('renameModal').style.display = 'block';
    input.focus();
    input.select();
}

function closeRenameModal() {
    document.getElementById('renameModal').style.display = 'none';
    currentFileToRename = null;
}

async function renameItem() {
    if (!currentFileToRename) return;

    const newName = document.getElementById('newFileName').value.trim();
    if (!newName) {
        showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${translations[currentLanguage].newNamePlaceholder}`, 'error');
        return;
    }

    const user = getUserSession();
    if (!user) {
        closeRenameModal();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/rename/${user.username}?path=${encodeURIComponent(currentFileToRename.path)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: user.token,
                newName: newName
            })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('uploadMessage', `<i class="fas fa-check-circle"></i> ${translations[currentLanguage].renameSuccess}`, 'success');
            closeRenameModal();
            loadFileList();
        } else {
            showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${escapeHTML(data.message || translations[currentLanguage].renameError)}`, 'error');
        }
    } catch (error) {
        console.error('Error renombrando:', error);
        showMessage('uploadMessage', `<i class="fas fa-exclamation-triangle"></i> ${translations[currentLanguage].connectionError}`, 'error');
    }
}

function downloadFile(itemPath, isFolder = false) {
    const user = getUserSession();
    if (!user) return;

    if (isFolder) {
        window.open(`${API_URL}/download/${user.username}?path=${encodeURIComponent(itemPath)}&token=${user.token}&zip=true`, '_blank');
    } else {
        window.open(`${API_URL}/download/${user.username}?path=${encodeURIComponent(itemPath)}&token=${user.token}`, '_blank');
    }
}

async function downloadSelectedFiles() {
    if (!ensureHasSelection()) return;

    const user = getUserSession();
    if (!user) return;

    try {
        const response = await fetch(`${API_URL}/download-selected/${user.username}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: user.token,
                paths: Array.from(selectedFiles)
            })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${escapeHTML(data.message || 'Error al descargar la selección')}`, 'error');
            return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'seleccion.zip';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error descargando selección:', error);
        showMessage('uploadMessage', `<i class="fas fa-exclamation-triangle"></i> ${translations[currentLanguage].connectionError}`, 'error');
    }
}

function previewFile(filePath) {
    const user = getUserSession();
    if (!user) return;
    const isAdmin = !!user.isAdmin;

    const targetUsername = isAdmin ? (adminBrowsingUsername || user.username) : user.username;
    const browsingOtherUser = isAdmin && targetUsername !== user.username;

    const baseUrl = browsingOtherUser ? `${API_URL}/admin/preview/${targetUsername}` : `${API_URL}/preview/${user.username}`;
    window.open(`${baseUrl}?path=${encodeURIComponent(filePath)}&token=${user.token}`, '_blank');
}

/**
 * Muestra un modal de confirmación personalizado en lugar del confirm() nativo.
 * Devuelve una Promise que resuelve a true si el usuario acepta, false si cancela.
 */
function showConfirmModal(message, title, acceptLabel) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const msgEl = document.getElementById('confirmModalMessage');
        const titleEl = document.getElementById('confirmModalTitle');
        const acceptBtn = document.getElementById('confirmModalAccept');
        const cancelBtn = document.getElementById('confirmModalCancel');

        if (!modal || !msgEl || !acceptBtn || !cancelBtn) {
            // Fallback al confirm nativo si el modal no existe
            resolve(window.confirm(message));
            return;
        }

        if (titleEl) titleEl.textContent = title || (currentLanguage === 'es' ? 'Confirmar acción' : 'Confirm action');
        msgEl.textContent = message;
        acceptBtn.textContent = acceptLabel || (currentLanguage === 'es' ? 'Eliminar' : 'Delete');
        cancelBtn.textContent = translations[currentLanguage]?.cancel || 'Cancelar';

        modal.style.display = 'block';

        function handleAccept() {
            modal.style.display = 'none';
            cleanup();
            resolve(true);
        }

        function handleCancel() {
            modal.style.display = 'none';
            cleanup();
            resolve(false);
        }

        function handleBackdrop(e) {
            if (e.target === modal) handleCancel();
        }

        function handleKey(e) {
            if (e.key === 'Escape') handleCancel();
            if (e.key === 'Enter') handleAccept();
        }

        function cleanup() {
            acceptBtn.removeEventListener('click', handleAccept);
            cancelBtn.removeEventListener('click', handleCancel);
            modal.removeEventListener('click', handleBackdrop);
            document.removeEventListener('keydown', handleKey);
        }

        acceptBtn.addEventListener('click', handleAccept);
        cancelBtn.addEventListener('click', handleCancel);
        modal.addEventListener('click', handleBackdrop);
        document.addEventListener('keydown', handleKey);
    });
}

async function deleteItem(itemPath, isFolder = false) {
    const confirmMsg = isFolder
        ? translations[currentLanguage].confirmDeleteFolder
        : translations[currentLanguage].confirmDelete;

    const title = currentLanguage === 'es' ? 'Confirmar eliminación' : 'Confirm deletion';
    if (!await showConfirmModal(confirmMsg, title)) return;

    const user = getUserSession();
    if (!user) return;

    showMessage('uploadMessage', `<i class="fas fa-spinner fa-spin"></i> ${translations[currentLanguage].deleting}`, 'info');

    try {
        const response = await fetch(`${API_URL}/delete/${user.username}?token=${user.token}&path=${encodeURIComponent(itemPath)}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showMessage('uploadMessage', `<i class="fas fa-check-circle"></i> ${translations[currentLanguage].deleteSuccess}`, 'success');

            if (selectedFiles.has(itemPath)) {
                selectedFiles.delete(itemPath);
                updateSelectedCount();
            }

            loadFileList();
        } else {
            showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${escapeHTML(data.message || translations[currentLanguage].deleteError)}`, 'error');
        }
    } catch (error) {
        console.error('Error eliminando:', error);
        showMessage('uploadMessage', `<i class="fas fa-exclamation-triangle"></i> ${translations[currentLanguage].connectionError}`, 'error');
    }
}

async function deleteSelectedItems() {
    if (!ensureHasSelection()) return;

    const msg = translations[currentLanguage].confirmDeleteFolder;
    const title = currentLanguage === 'es' ? 'Confirmar eliminación' : 'Confirm deletion';
    if (!await showConfirmModal(msg, title)) return;

    const user = getUserSession();
    if (!user) return;

    showMessage('uploadMessage', `<i class="fas fa-spinner fa-spin"></i> ${translations[currentLanguage].deleting}`, 'info');

    try {
        for (const itemPath of Array.from(selectedFiles)) {
            const response = await fetch(`${API_URL}/delete/${user.username}?token=${user.token}&path=${encodeURIComponent(itemPath)}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (!data.success) {
                showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${escapeHTML(data.message || translations[currentLanguage].deleteError)}`, 'error');
                return;
            }
        }
        selectedFiles.clear();
        updateSelectedCount();
        showMessage('uploadMessage', `<i class="fas fa-check-circle"></i> ${translations[currentLanguage].deleteSuccess}`, 'success');
        loadFileList();
    } catch (error) {
        console.error('Error eliminando selección:', error);
        showMessage('uploadMessage', `<i class="fas fa-exclamation-triangle"></i> ${translations[currentLanguage].connectionError}`, 'error');
    }
}

async function createFolder() {
    const folderName = document.getElementById('folderName').value.trim();
    if (!folderName) {
        showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${translations[currentLanguage].folderNamePlaceholder}`, 'error');
        return;
    }

    const user = getUserSession();
    if (!user) {
        closeMkdirModal();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/mkdir/${user.username}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: user.token, folderName })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('uploadMessage', `<i class="fas fa-check-circle"></i> ${translations[currentLanguage].mkdirSuccess}`, 'success');
            closeMkdirModal();
            loadFileList();
        } else {
            showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${escapeHTML(data.message || translations[currentLanguage].mkdirError)}`, 'error');
        }
    } catch (error) {
        console.error('Error creando carpeta:', error);
        showMessage('uploadMessage', `<i class="fas fa-exclamation-triangle"></i> ${translations[currentLanguage].connectionError}`, 'error');
    }
}

function closeMkdirModal() {
    document.getElementById('mkdirModal').style.display = 'none';
    document.getElementById('folderName').value = '';
}

function openMkdirModal() {
    document.getElementById('folderName').value = '';
    document.getElementById('mkdirModal').style.display = 'block';
    document.getElementById('folderName').focus();
}

// ============================================================
// Funciones de Compartir
// ============================================================
let currentShareFile = { path: null, name: null };

function openShareModal(filePath, fileName) {
    currentShareFile = { path: filePath, name: fileName };
    document.getElementById('shareFileNameDisplay').innerHTML = `<i class="fas fa-file"></i> ${fileName}`;
    document.getElementById('shareUrlContainer').style.display = 'none';
    document.getElementById('shareExpiration').value = 'never';
    document.getElementById('generateShareLink').style.display = 'block';
    document.getElementById('shareModal').style.display = 'block';
}

function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
    currentShareFile = { path: null, name: null };
}

async function generateShareLink() {
    if (!currentShareFile.path) return;

    const expiration = document.getElementById('shareExpiration').value;
    const user = getUserSession();
    if (!user) return;

    showMessage('uploadMessage', `<i class="fas fa-spinner fa-spin"></i> ${translations[currentLanguage].generatingLink}`, 'info');

    try {
        const response = await fetch(`${API_URL}/share/${user.username}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: user.token,
                filePath: currentShareFile.path,
                expiresIn: expiration
            })
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById('shareUrlInput').value = data.shareUrl;
            let expiryText = '';
            if (data.expiresAt) {
                const expiryDate = new Date(data.expiresAt).toLocaleString();
                expiryText = `${translations[currentLanguage].expiration} ${expiryDate}`;
            } else {
                expiryText = translations[currentLanguage].never;
            }
            document.getElementById('shareExpiryInfo').textContent = expiryText;
            document.getElementById('shareUrlContainer').style.display = 'block';
            document.getElementById('generateShareLink').style.display = 'none';
            showMessage('uploadMessage', `<i class="fas fa-check-circle"></i> ${translations[currentLanguage].linkCopied}`, 'success');
        } else {
            showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${escapeHTML(data.message || 'Error')}`, 'error');
        }
    } catch (error) {
        console.error('Error generando enlace:', error);
        showMessage('uploadMessage', `<i class="fas fa-exclamation-triangle"></i> ${translations[currentLanguage].connectionError}`, 'error');
    }
}

document.getElementById('copyShareUrl')?.addEventListener('click', () => {
    const input = document.getElementById('shareUrlInput');
    input.select();
    document.execCommand('copy');
    showMessage('uploadMessage', translations[currentLanguage].linkCopied, 'success');
});

// ============================================================
// Funciones de Búsqueda
// ============================================================

function handleSearchInput(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
}

function handleSearchKeyUp(e) {
    if (e.key === 'Escape') {
        clearSearch();
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        applyFilters();
    }
}

// ============================================================
// Funciones de Validación de Contraseña
// ============================================================

function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]+/) && password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/) || password.match(/[$@#&!]+/)) strength += 25;
    return strength;
}

function updatePasswordStrength(password) {
    const strength = checkPasswordStrength(password);
    const bar = document.querySelector('#passwordStrength .password-strength-bar');
    if (bar) {
        bar.style.width = strength + '%';
        if (strength < 50) {
            bar.style.background = '#dc3545';
        } else if (strength < 75) {
            bar.style.background = '#ffc107';
        } else {
            bar.style.background = '#28a745';
        }
    }
}

// ============================================================
// Carga y Visualización de Archivos
// ============================================================

async function loadFileList() {
    const user = getUserSession();
    if (!user) return;

    const fileListDiv = document.getElementById('fileList');
    const controlsParking = document.getElementById('fileListControlsParking') || document.createElement('div');
    controlsParking.id = 'fileListControlsParking';
    controlsParking.style.display = 'none';
    if (!controlsParking.parentNode) {
        fileListDiv.parentNode.insertBefore(controlsParking, fileListDiv);
    }
    ['searchContainer', 'currentPath'].forEach(id => {
        const element = document.getElementById(id);
        if (element && fileListDiv.contains(element)) {
            controlsParking.appendChild(element);
        }
    });
    fileListDiv.innerHTML = `<div class="loader"></div><p style="text-align: center;">${translations[currentLanguage].loading}</p>`;

    try {
        const isAdmin = !!user.isAdmin;
        const targetUsername = isAdmin ? (adminBrowsingUsername || user.username) : user.username;
        const browsingOtherUser = isAdmin && targetUsername !== user.username;

        let url = browsingOtherUser
            ? `${API_URL}/admin/users/${targetUsername}/files?token=${user.token}`
            : `${API_URL}/files/${user.username}?token=${user.token}`;

        if (currentPath) {
            url += `&path=${encodeURIComponent(currentPath)}`;
        }
        const response = await fetch(url);

        if (response.status === 401 || response.status === 403) {
            if (response.status === 401) {
                logout();
                return;
            }
            if (response.status === 403 && browsingOtherUser) {
                adminBrowsingUsername = null;
                const select = document.getElementById('adminBrowseUserSelect');
                if (select) select.value = '';
                loadFileList();
                return;
            }
        }

        const data = await response.json();

        if (data.success) {
            allFiles = data.files;
            applyFilters();
            updatePathDisplay(data.currentPath);

            const dropZone = document.getElementById('uploadDropZone');
            const hiddenFileInput = document.getElementById('hiddenFileInput');
            if (browsingOtherUser) {
                if (dropZone) dropZone.style.display = 'none';
                if (hiddenFileInput) hiddenFileInput.style.display = 'none';
            } else {
                if (dropZone) dropZone.style.display = '';
                if (hiddenFileInput) hiddenFileInput.style.display = 'none';
            }

            if (!browsingOtherUser) loadDashboardStats();
        } else {
            showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> ${escapeHTML(data.message || translations[currentLanguage].uploadError)}`, 'error');
            fileListDiv.innerHTML = '';
        }
    } catch (error) {
        console.error('Error cargando archivos:', error);
        showMessage('uploadMessage', `<i class="fas fa-exclamation-triangle"></i> ${translations[currentLanguage].connectionError}`, 'error');
        fileListDiv.innerHTML = '';
    }
}

function displayFiles(files) {
    const fileListDiv = document.getElementById('fileList');
    if (!fileListDiv) return;

    // Guardar el foco y posición del cursor del input de búsqueda antes de mover el nodo
    const searchInput = document.getElementById('searchInput');
    const searchHadFocus = searchInput && document.activeElement === searchInput;
    const searchSelStart = searchHadFocus ? searchInput.selectionStart : null;
    const searchSelEnd = searchHadFocus ? searchInput.selectionEnd : null;

    const preservedControls = document.createDocumentFragment();
    const pathBar = document.getElementById('currentPath');
    const searchContainer = document.getElementById('searchContainer');
    if (searchContainer) preservedControls.appendChild(searchContainer);
    if (pathBar) preservedControls.appendChild(pathBar);

    if (files.length === 0) {
        fileListDiv.innerHTML = `
            <h3><i class="fas fa-files"></i> ${translations[currentLanguage].myFiles} (0)</h3>
            <div id="fileListControls" class="file-list-controls"></div>
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>${translations[currentLanguage].emptyFolder}</p>
                <p class="text-muted">${translations[currentLanguage].emptyFolderHint || 'Arrastra archivos o haz clic en la zona superior para seleccionar'}</p>
            </div>
        `;
        const controlsSlot = document.getElementById('fileListControls');
        if (controlsSlot) controlsSlot.appendChild(preservedControls);
        placeManagerControls();

        // Restaurar foco si lo tenía antes
        if (searchHadFocus) {
            const si = document.getElementById('searchInput');
            if (si) { si.focus(); si.setSelectionRange(searchSelStart, searchSelEnd); }
        }
        return;
    }

    let html = `<h3><i class="fas fa-files"></i> ${translations[currentLanguage].myFiles} (${files.length})</h3>`;
    html += '<div id="fileListControls" class="file-list-controls"></div>';
    html += '<div class="file-table-container">';
    html += '<table class="file-table">';
    html += `<thead><tr>
        <th style="width: 40px;"><input type="checkbox" id="selectAllCheckbox" onclick="toggleSelectAll()" class="file-checkbox"></th>
        <th>${translations[currentLanguage].fileName}</th>
        <th style="width: 120px;">${translations[currentLanguage].size}</th>
        <th style="width: 160px;">${translations[currentLanguage].uploaded}</th>
        <th style="width: 180px;">${translations[currentLanguage].fileType}</th>
    </tr></thead>`;
    html += '<tbody>';

    files.forEach(item => {
        const isDir = item.isDirectory;
        const date = new Date(item.mtime).toLocaleString(currentLanguage === 'es' ? 'es-ES' : 'en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        let sizeDisplay = item.sizeFormatted || '--';
        let displayName = item.name;
        if (displayName.length > 25) {
            displayName = displayName.substring(0, 22) + '...';
        }

        const safeName = escapeHTML(item.name);
        const safeDisplayName = escapeHTML(displayName);
        const safePath = item.path.replace(/'/g, "\\'");
        const safeNameEscaped = safeName.replace(/'/g, "\\'");

        let fileIcon = isDir ? 'fa-folder' : 'fa-file';
        let iconColor = isDir ? '#ffd166' : '#4361ee';
        const isSelected = selectedFiles.has(item.path) ? 'checked' : '';

        if (!isDir) {
            const ext = item.name.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext)) fileIcon = 'fa-file-image';
            else if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv'].includes(ext)) fileIcon = 'fa-file-video';
            else if (['mp3', 'wav', 'flac', 'aac', 'm4a'].includes(ext)) fileIcon = 'fa-file-audio';
            else if (ext === 'pdf') fileIcon = 'fa-file-pdf';
            else if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) fileIcon = 'fa-file-archive';
            else if (['js', 'html', 'css', 'json', 'py', 'java', 'cpp', 'c', 'php', 'xml', 'yaml'].includes(ext)) fileIcon = 'fa-file-code';
        }

        const typeDisplay = getFileTypeDisplay(item.name, isDir);

        html += `<tr class="file-row" oncontextmenu="showContextMenu(event, {path: '${safePath}', isDirectory: ${isDir}, name: '${safeNameEscaped}'})" onclick="handleRowClick(event, '${safePath}', ${isDir})">
            <td><input type="checkbox" class="file-checkbox" data-path="${safePath}" ${isSelected} onclick="event.stopPropagation(); toggleFileSelection('${safePath}')"></td>
            <td>
                <i class="fas ${fileIcon} file-icon-anim" style="margin-right: 12px; color: ${iconColor}; font-size: 1.2rem;"></i> 
                <span class="file-name" title="${safeName}">${safeDisplayName}</span>
            </td>
            <td><span class="badge">${sizeDisplay}</span></td>
            <td>${date}</td>
            <td><span class="file-type-text">${typeDisplay}</span></td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    fileListDiv.innerHTML = html;
    const controlsSlot = document.getElementById('fileListControls');
    if (controlsSlot) controlsSlot.appendChild(preservedControls);
    placeManagerControls();
    updateCheckboxState();
    updateSelectedCount();

    // Restaurar foco y posición del cursor después de re-insertar el searchContainer en el DOM
    if (searchHadFocus) {
        const si = document.getElementById('searchInput');
        if (si) { si.focus(); si.setSelectionRange(searchSelStart, searchSelEnd); }
    }
}

// ============================================================
// Mensajes y Sesión
// ============================================================

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.innerHTML = message;
    element.className = type === 'success' ? 'success-message' : type === 'error' ? 'error-message' : 'info-message';
    if (type !== 'info') {
        setTimeout(() => { element.innerHTML = ''; element.className = ''; }, 3000);
    }
}

function refreshFileManager() {
    loadFileList();
    loadDashboardStats();
}

async function loadDashboardStats() {
    const user = getUserSession();
    if (!user) return;

    try {
        const response = await fetch(`${API_URL}/user/stats?token=${user.token}`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('userDashboard').style.display = 'grid';
            renderDashboardCharts(data.stats);
        }
    } catch (error) {
        console.error('Error cargando estadísticas del dashboard:', error);
    }
}

let chartInstances = {};

function renderDashboardCharts(stats) {
    const { quota_bytes, max_file_size_bytes, bandwidth_kbps, used_bytes, downloads } = stats;

    const themePrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#4361ee';
    const themeBg = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e2e8f0';
    const themeText = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#1e293b';

    Chart.defaults.color = themeText;

    const formatB = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'], i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const initChart = (ctxId, data, textId, textContent) => {
        if (chartInstances[ctxId]) chartInstances[ctxId].destroy();
        const ctx = document.getElementById(ctxId).getContext('2d');
        chartInstances[ctxId] = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: { legend: { display: false }, tooltip: { enabled: true } }
            }
        });
        document.getElementById(textId).textContent = textContent;
    };

    const usedPercent = quota_bytes > 0 ? (used_bytes / quota_bytes) * 100 : 0;
    const freeBytes = Math.max(0, quota_bytes - used_bytes);
    initChart('storageChart', {
        labels: ['Usado', 'Libre'],
        datasets: [{
            data: [used_bytes, freeBytes],
            backgroundColor: [themePrimary, themeBg],
            borderWidth: 0
        }]
    }, 'storageText', `${formatB(used_bytes)} / ${formatB(quota_bytes)}`);

    const bwText = bandwidth_kbps > 0 ? `${bandwidth_kbps} KB/s` : 'Ilimitado';
    initChart('bandwidthChart', {
        labels: ['Límite', ''],
        datasets: [{
            data: [1, 0],
            backgroundColor: [bandwidth_kbps > 0 ? '#06d6a0' : themePrimary, themeBg],
            borderWidth: 0
        }]
    }, 'bandwidthText', bwText);

    const maxFileText = max_file_size_bytes > 0 ? formatB(max_file_size_bytes) : 'Ilimitado';
    initChart('maxFileChart', {
        labels: ['Límite', ''],
        datasets: [{
            data: [1, 0],
            backgroundColor: [max_file_size_bytes > 0 ? '#f59e0b' : themePrimary, themeBg],
            borderWidth: 0
        }]
    }, 'maxFileText', maxFileText);

    const downloadsCount = parseInt(downloads || 0);
    const downloadsData = downloadsCount > 0 ? [downloadsCount, 0] : [1, 0];
    initChart('downloadsChart', {
        labels: ['Descargas', ''],
        datasets: [{
            data: downloadsData,
            backgroundColor: [downloadsCount > 0 ? '#8b5cf6' : themePrimary, themeBg],
            borderWidth: 0
        }]
    }, 'downloadsText', `${downloadsCount} descargas`);
}

async function logout() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: user.token })
                });
            }
        } catch (e) {
            console.warn('Error notificando logout al servidor:', e);
        }
    }

    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// ============================================================
// SUBIDA AUTOMÁTICA POR ARRASTRE O CLIC (sin botones)
// ============================================================

let activeUploadTasks = [];
let uploadFinishTimeoutId = null;

function getUploadPathForTask(taskRelativePath) {
    const parts = taskRelativePath.split('/');
    parts.pop();
    const dirPart = parts.join('/');
    if (currentPath) {
        return dirPart ? currentPath + '/' + dirPart : currentPath;
    } else {
        return dirPart;
    }
}

function getFileIconClass(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext)) return { icon: 'fa-file-image', color: 'var(--primary)' };
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv'].includes(ext)) return { icon: 'fa-file-video', color: 'var(--accent)' };
    if (['mp3', 'wav', 'flac', 'aac', 'm4a'].includes(ext)) return { icon: 'fa-file-audio', color: '#06d6a0' };
    if (ext === 'pdf') return { icon: 'fa-file-pdf', color: '#ef476f' };
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return { icon: 'fa-file-archive', color: '#ffd166' };
    if (['js', 'html', 'css', 'json', 'py', 'java', 'cpp', 'c', 'php', 'xml', 'yaml'].includes(ext)) return { icon: 'fa-file-code', color: '#8b5cf6' };
    return { icon: 'fa-file', color: 'var(--text-secondary)' };
}

function renderUploadProgressContainer() {
    const uploadMessage = document.getElementById('uploadMessage');
    if (!uploadMessage) return;

    uploadMessage.className = 'info-message';
    uploadMessage.style.display = 'block';

    let html = `
        <div id="contenedor-barra-progreso" style="text-align: left; width: 100%; padding: 15px 0; font-family: inherit;">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span id="overallUploadTitle" style="display: inline-flex; align-items: center; gap: 8px;">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 20px;"></i>
                    <span>Subiendo archivos...</span>
                </span>
            </div>
            <div style="width: 100%; background-color: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 15px;">
                <div id="overallUploadProgressBar" style="width: 0%; height: 100%; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); transition: width 0.1s ease;"></div>
            </div>
            
            <div class="upload-progress-list" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 5px;">
    `;

    activeUploadTasks.forEach(task => {
        const fileIcon = getFileIconClass(task.file.name);

        let fileDisplayName = task.relativePath;
        let folderPrefix = '';
        if (task.relativePath.includes('/')) {
            const parts = task.relativePath.split('/');
            const name = parts.pop();
            const folder = parts.join('/');
            folderPrefix = `<i class="fas fa-folder" style="color: #ffc107; margin-right: 4px;" title="Carpeta: ${escapeHTML(folder)}"></i> <span style="color: var(--text-muted); font-size: 0.85em;">${escapeHTML(folder)}/</span>`;
            fileDisplayName = name;
        }

        if (task.isFolder) {
            folderPrefix = `<i class="fas fa-folder" style="color: #ffc107; margin-right: 4px;"></i>`;
            fileDisplayName = task.relativePath;
        }

        html += `
            <div id="item_${task.id}" class="upload-progress-item" style="display: flex; flex-direction: column; gap: 4px; padding: 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg);">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%; font-weight: 500;" title="${escapeHTML(task.relativePath)}">
                        ${folderPrefix}${!task.isFolder ? `<i class="fas ${fileIcon.icon}" style="color: ${fileIcon.color}; margin-right: 4px;"></i>` : ''}${escapeHTML(fileDisplayName)}
                    </span>
                    <span style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 8px; align-items: center;">
                        <span class="upload-speed-text">${task.speedText}</span>
                        <span class="upload-percent-text" style="font-weight: 600;">0%</span>
                        <i class="upload-item-status-icon fas fa-clock" style="color: var(--text-muted);"></i>
                    </span>
                </div>
                <div style="width: 100%; background-color: var(--border-color); height: 4px; border-radius: 2px; overflow: hidden;">
                    <div class="upload-progress-bar-fill" style="width: 0%; height: 100%; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); transition: width 0.2s ease;"></div>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    uploadMessage.innerHTML = html;
}

function updateTaskUI(task) {
    const itemEl = document.getElementById(`item_${task.id}`);
    if (!itemEl) return;

    const fillEl = itemEl.querySelector('.upload-progress-bar-fill');
    const percentEl = itemEl.querySelector('.upload-percent-text');
    const speedEl = itemEl.querySelector('.upload-speed-text');
    const iconEl = itemEl.querySelector('.upload-item-status-icon');

    if (fillEl) {
        fillEl.style.width = `${task.percent}%`;
        fillEl.className = 'upload-progress-bar-fill';
        if (task.status === 'success') fillEl.classList.add('success');
        if (task.status === 'error') fillEl.classList.add('error');
    }

    if (percentEl) {
        if (task.status === 'success') {
            percentEl.innerHTML = `<span style="color: var(--success); font-weight: bold;"><i class="fas fa-check-circle"></i> ${task.isFolder ? 'Creada' : 'Completado'}</span>`;
        } else if (task.status === 'error') {
            percentEl.innerHTML = `<span style="color: var(--danger); font-weight: bold;"><i class="fas fa-exclamation-circle"></i> Error</span>`;
        } else {
            percentEl.textContent = `${Math.round(task.percent)}%`;
        }
    }

    if (speedEl) {
        if (task.status === 'success' || task.status === 'error') {
            speedEl.textContent = task.status === 'error' ? task.errorMsg : '';
        } else {
            speedEl.textContent = task.speedText;
        }
    }

    if (iconEl) {
        if (task.status === 'success') {
            iconEl.className = 'upload-item-status-icon fas fa-check-circle';
            iconEl.style.color = 'var(--success)';
        } else if (task.status === 'error') {
            iconEl.className = 'upload-item-status-icon fas fa-exclamation-circle';
            iconEl.style.color = 'var(--danger)';
        } else if (task.status === 'uploading') {
            iconEl.className = 'upload-item-status-icon fas fa-spinner fa-spin';
            iconEl.style.color = 'var(--primary)';
        } else {
            iconEl.className = 'upload-item-status-icon fas fa-clock';
            iconEl.style.color = 'var(--text-muted)';
        }
    }
}

function updateOverallProgressUI() {
    const uploadMessage = document.getElementById('uploadMessage');
    if (!uploadMessage) return;

    const tasks = activeUploadTasks;
    if (tasks.length === 0) return;

    const completedCount = tasks.filter(t => t.status === 'success' || t.status === 'error').length;
    const totalCount = tasks.length;

    const totalPercent = tasks.reduce((sum, t) => sum + t.percent, 0);
    const overallPercent = Math.round(totalPercent / totalCount);

    const overallBar = document.getElementById('overallUploadProgressBar');
    if (overallBar) {
        overallBar.style.width = `${overallPercent}%`;
    }

    const overallTitle = document.getElementById('overallUploadTitle');
    const cancelBtn = document.getElementById('cancelUploadBtn');
    const dropZone = document.getElementById('uploadDropZone');

    if (completedCount === totalCount) {
        if (cancelBtn) cancelBtn.style.display = 'none';

        if (overallTitle) {
            const hasErrors = tasks.some(t => t.status === 'error');
            const isEs = currentLanguage === 'es';
            if (hasErrors) {
                overallTitle.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: var(--warning);"></i> ${isEs ? 'Subida finalizada con algunos errores' : 'Upload finished with some errors'} (${completedCount}/${totalCount})`;
            } else {
                overallTitle.innerHTML = `<i class="fas fa-check-circle" style="color: var(--success);"></i> ${isEs ? '¡Todos los archivos subidos exitosamente!' : 'All files uploaded successfully!'} (${completedCount}/${totalCount})`;
            }
        }

        if (!uploadFinishTimeoutId) {
            loadFileList();
            uploadFinishTimeoutId = setTimeout(() => {
                if (uploadMessage) {
                    uploadMessage.style.display = 'none';
                    uploadMessage.innerHTML = '';
                }
                if (dropZone) {
                    dropZone.style.display = 'flex';
                }
                uploadFinishTimeoutId = null;
                refreshFileManager();
            }, 5000);
        }
    } else {
        if (cancelBtn) cancelBtn.style.display = 'inline-flex';
        if (dropZone) dropZone.style.display = 'none';

        if (overallTitle) {
            const isEs = currentLanguage === 'es';
            overallTitle.innerHTML = `<i class="fas fa-cloud-upload-alt fa-spin"></i> ${isEs ? 'Subiendo' : 'Uploading'} ${completedCount} ${isEs ? 'de' : 'of'} ${totalCount} ${isEs ? 'archivos' : 'files'}... (${overallPercent}%)`;
        }
    }
}

function cancelAllUploads() {
    const tasksToCancel = activeUploadTasks.filter(t => t.status === 'uploading' || t.status === 'pending');
    if (tasksToCancel.length === 0) return;

    tasksToCancel.forEach(task => {
        if (task.xhr) {
            task.xhr.onload = null;
            task.xhr.onerror = null;
            if (task.xhr.upload) {
                task.xhr.upload.onprogress = null;
            }
            try {
                task.xhr.abort();
            } catch (e) {
                console.warn('Error abortando XHR:', e);
            }
            task.xhr = null;
        }

        task.status = 'error';
        task.errorMsg = currentLanguage === 'es' ? 'Cancelado' : 'Cancelled';
        updateTaskUI(task);
    });

    updateOverallProgressUI();
}

function uploadTask(task, onDoneCallback) {
    const user = getUserSession();
    if (!user) {
        task.status = 'error';
        task.errorMsg = 'Sesión expirada';
        updateTaskUI(task);
        updateOverallProgressUI();
        onDoneCallback && onDoneCallback();
        return;
    }

    task.status = 'uploading';
    updateTaskUI(task);

    if (task.isFolder) {
        const targetFolderName = currentPath ? currentPath + '/' + task.relativePath : task.relativePath;
        fetch(`${API_URL}/mkdir/${user.username}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: user.token, folderName: targetFolderName })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    task.status = 'success';
                    task.percent = 100;
                    task.speedText = '';
                } else {
                    task.status = 'error';
                    task.errorMsg = data.message || 'Error creando carpeta';
                }
                updateTaskUI(task);
                updateOverallProgressUI();
                onDoneCallback && onDoneCallback();
            })
            .catch(() => {
                task.status = 'error';
                task.errorMsg = 'Error de conexión';
                updateTaskUI(task);
                updateOverallProgressUI();
                onDoneCallback && onDoneCallback();
            });
        return;
    }

    const targetFolder = getUploadPathForTask(task.relativePath);
    const formData = new FormData();
    formData.append('file', task.file);
    formData.append('token', user.token);

    const xhr = new XMLHttpRequest();
    task.xhr = xhr;

    let uploadUrl = `${API_URL}/upload/${user.username}?token=${user.token}`;
    if (targetFolder) {
        uploadUrl += `&path=${encodeURIComponent(targetFolder)}`;
    }

    xhr.open('POST', uploadUrl, true);

    let uploadStartTime = Date.now();
    let lastLoaded = 0;
    let lastTime = uploadStartTime;

    xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
            task.percent = Math.max(0, Math.min(100, (event.loaded / event.total) * 100));
            task.uploadedBytes = event.loaded;

            const currentTime = Date.now();
            const timeDiff = (currentTime - lastTime) / 1000;

            if (timeDiff > 0.5) {
                const bytesDiff = event.loaded - lastLoaded;
                const speedBps = bytesDiff / timeDiff;

                if (speedBps > 1024 * 1024) {
                    task.speedText = `${(speedBps / (1024 * 1024)).toFixed(2)} MB/s`;
                } else if (speedBps > 1024) {
                    task.speedText = `${(speedBps / 1024).toFixed(2)} KB/s`;
                } else {
                    task.speedText = `${Math.round(speedBps)} B/s`;
                }

                lastTime = currentTime;
                lastLoaded = event.loaded;
            }

            updateTaskUI(task);
            updateOverallProgressUI();
        }
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                if (data.success) {
                    task.status = 'success';
                    task.percent = 100;
                    task.speedText = '';
                } else {
                    task.status = 'error';
                    task.errorMsg = data.message || 'Error en subida';
                }
            } catch (e) {
                task.status = 'error';
                task.errorMsg = 'Error parseando respuesta';
            }
        } else {
            let errorMsg = 'Error del servidor';
            try {
                const data = JSON.parse(xhr.responseText);
                if (data.message) errorMsg = data.message;
            } catch (e) { }
            task.status = 'error';
            task.errorMsg = errorMsg;
        }
        task.xhr = null;
        updateTaskUI(task);
        updateOverallProgressUI();
        onDoneCallback && onDoneCallback();
    };

    xhr.onerror = function () {
        task.status = 'error';
        task.errorMsg = translations[currentLanguage].connectionError || 'Error de conexión';
        task.xhr = null;
        updateTaskUI(task);
        updateOverallProgressUI();
        onDoneCallback && onDoneCallback();
    };

    xhr.send(formData);
}

async function enqueueFilesForUpload(fileTasks) {
    if (fileTasks.length === 0) return;

    const user = getUserSession();
    if (!user) return;

    let totalSize = 0;
    const validTasks = [];

    for (const task of fileTasks) {
        if (!task.isFolder && task.file.size > userQuotaInfo.max_file_size_bytes && userQuotaInfo.max_file_size_bytes > 0) {
            const maxSizeText = getFormattedMaxFileSize();
            const fileSizeText = formatBytesShort(task.file.size);
            alert(`El archivo ${task.file.name} supera el tamaño máximo de ${maxSizeText} y no se subirá.\nTu archivo: ${fileSizeText}`);
            continue;
        }
        totalSize += task.isFolder ? 0 : task.file.size;
        validTasks.push(task);
    }

    if (validTasks.length === 0) return;

    await loadUserQuotaInfo();

    if (userQuotaInfo.quota_bytes > 0 && (userQuotaInfo.used_bytes + totalSize) > userQuotaInfo.quota_bytes) {
        const availableSpace = Math.max(0, userQuotaInfo.quota_bytes - userQuotaInfo.used_bytes);
        alert(`No hay suficiente espacio para subir todos los archivos.\nEspacio libre disponible: ${formatBytesShort(availableSpace)}\nTamaño total a subir: ${formatBytesShort(totalSize)}`);
        return;
    }

    activeUploadTasks = activeUploadTasks.filter(t => t.status === 'uploading' || t.status === 'pending');

    const currentBatchTasks = [];
    for (const task of validTasks) {
        const taskId = 'upload_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const newTask = {
            id: taskId,
            file: task.file,
            relativePath: task.relativePath,
            isFolder: !!task.isFolder,
            status: 'pending',
            percent: 0,
            speedText: 'Espera...',
            uploadedBytes: 0,
            totalBytes: task.isFolder ? 0 : task.file.size,
            xhr: null,
            errorMsg: ''
        };
        currentBatchTasks.push(newTask);
        activeUploadTasks.push(newTask);
    }

    if (uploadFinishTimeoutId) {
        clearTimeout(uploadFinishTimeoutId);
        uploadFinishTimeoutId = null;
    }
    const dropZone = document.getElementById('uploadDropZone');
    if (dropZone) dropZone.style.display = 'none';
    const cancelBtn = document.getElementById('cancelUploadBtn');
    if (cancelBtn) cancelBtn.style.display = 'inline-flex';

    renderUploadProgressContainer();
    updateOverallProgressUI();

    const largeFileThreshold = 1073741824; // 1 GB
    const largeTasks = currentBatchTasks.filter(t => !t.isFolder && t.file.size >= largeFileThreshold);
    const smallTasks = currentBatchTasks.filter(t => t.isFolder || t.file.size < largeFileThreshold);

    if (largeTasks.length >= 2) {
        largeTasks.sort((a, b) => b.file.size - a.file.size);

        let currentLargeIdx = 0;
        function runNextLarge() {
            if (currentLargeIdx < largeTasks.length) {
                const task = largeTasks[currentLargeIdx];
                currentLargeIdx++;
                uploadTask(task, runNextLarge);
            } else {
                smallTasks.forEach(task => {
                    uploadTask(task, () => { });
                });
            }
        }
        runNextLarge();
    } else {
        currentBatchTasks.forEach(task => {
            uploadTask(task, () => { });
        });
    }
}

async function getAllFileEntries(dataTransferItems) {
    const fileEntries = [];

    async function traverseEntry(entry, relativePath = '') {
        if (entry.isFile) {
            const file = await new Promise((resolve, reject) => {
                entry.file(resolve, reject);
            });
            fileEntries.push({
                file: file,
                relativePath: relativePath ? relativePath + '/' + file.name : file.name
            });
        } else if (entry.isDirectory) {
            const dirReader = entry.createReader();

            const entries = await new Promise((resolve, reject) => {
                const allEntries = [];
                function read() {
                    dirReader.readEntries((results) => {
                        if (results.length === 0) {
                            resolve(allEntries);
                        } else {
                            allEntries.push(...results);
                            read();
                        }
                    }, reject);
                }
                read();
            });

            if (entries.length === 0) {
                fileEntries.push({
                    isFolder: true,
                    file: { name: entry.name, size: 0 },
                    relativePath: relativePath ? relativePath + '/' + entry.name : entry.name
                });
            } else {
                for (const subEntry of entries) {
                    await traverseEntry(subEntry, relativePath ? relativePath + '/' + entry.name : entry.name);
                }
            }
        }
    }

    const initialEntries = [];
    for (let i = 0; i < dataTransferItems.length; i++) {
        const item = dataTransferItems[i];
        if (item && item.kind === 'file') {
            const entry = item.webkitGetAsEntry();
            if (entry) {
                initialEntries.push(entry);
            }
        }
    }

    for (const entry of initialEntries) {
        await traverseEntry(entry);
    }

    return fileEntries;
}

// ============================================================
// EDITOR DE TEMAS
// ============================================================

const themePresets = {
    default: { primary: '#4361ee', secondary: '#4cc9f0', background: '#f8fafc', text: '#0f172a', accent: '#7209b7', success: '#06d6a0', danger: '#ef476f', warning: '#f59e0b' },
    ocean: { primary: '#0077b6', secondary: '#00b4d8', background: '#f0f9ff', text: '#0b2545', accent: '#0096c7', success: '#06d6a0', danger: '#ef476f', warning: '#f59e0b' },
    forest: { primary: '#2d6a4f', secondary: '#52b788', background: '#f0fdf4', text: '#052e16', accent: '#40916c', success: '#22c55e', danger: '#ef476f', warning: '#f59e0b' },
    sunset: { primary: '#ff6b35', secondary: '#ffb703', background: '#fff7ed', text: '#431407', accent: '#f72585', success: '#06d6a0', danger: '#ef4444', warning: '#f59e0b' },
    midnight: { primary: '#6366f1', secondary: '#22d3ee', background: '#0b1020', text: '#e2e8f0', accent: '#a855f7', success: '#22c55e', danger: '#fb7185', warning: '#fbbf24' },
    dark: { primary: '#4f46e5', secondary: '#22d3ee', background: '#0f172a', text: '#e2e8f0', accent: '#9333ea', success: '#22c55e', danger: '#fb7185', warning: '#fbbf24' },
    candy: { primary: '#fb7185', secondary: '#f472b6', background: '#fff1f2', text: '#3b0a2a', accent: '#a78bfa', success: '#2dd4bf', danger: '#ef4444', warning: '#fbbf24' }
};

function openThemeEditor() {
    const savedTheme = localStorage.getItem('userTheme');
    const theme = savedTheme ? JSON.parse(savedTheme) : themePresets.default;
    ['primary', 'secondary', 'background', 'text', 'accent', 'success', 'danger', 'warning'].forEach(c => {
        document.getElementById(c + 'ColorPicker').value = theme[c];
    });
    updateThemePreview();
    document.getElementById('themeEditorModal').style.display = 'block';
}

function updateThemePreview() {
    const theme = getCurrentColorValues();
    const preview = document.getElementById('themePreview');
    if (!preview) return;

    const isDarkBg = isColorDark(theme.background);
    const header = preview.querySelector('.preview-header');
    if (header) header.style.background = `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`;

    const btn = preview.querySelector('.preview-btn');
    if (btn) btn.style.background = `linear-gradient(135deg, ${theme.primary} 0%, ${adjustColor(theme.primary, -20)} 100%)`;

    const input = preview.querySelector('.preview-input');
    if (input) {
        input.style.borderColor = theme.secondary;
        input.style.background = isDarkBg ? adjustColor(theme.background, 22) : '#ffffff';
        input.style.color = theme.text;
    }

    const card = preview.querySelector('.preview-card');
    if (card) {
        card.style.background = isDarkBg ? adjustColor(theme.background, 30) : '#ffffff';
        card.style.borderColor = theme.secondary;
        card.style.color = theme.text;
    }
}

function getCurrentColorValues() {
    return {
        primary: document.getElementById('primaryColorPicker').value,
        secondary: document.getElementById('secondaryColorPicker').value,
        background: document.getElementById('backgroundColorPicker').value,
        text: document.getElementById('textColorPicker').value,
        accent: document.getElementById('accentColorPicker').value,
        success: document.getElementById('successColorPicker').value,
        danger: document.getElementById('dangerColorPicker').value,
        warning: document.getElementById('warningColorPicker').value
    };
}

function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function closeThemeEditor() {
    const modal = document.getElementById('themeEditorModal');
    if (modal) modal.style.display = 'none';
}

function applyPreset(presetName) {
    const preset = themePresets[presetName];
    if (!preset) return;

    document.getElementById('primaryColorPicker').value = preset.primary;
    document.getElementById('secondaryColorPicker').value = preset.secondary;
    document.getElementById('backgroundColorPicker').value = preset.background;
    document.getElementById('textColorPicker').value = preset.text;
    document.getElementById('accentColorPicker').value = preset.accent;
    document.getElementById('successColorPicker').value = preset.success;
    document.getElementById('dangerColorPicker').value = preset.danger;
    document.getElementById('warningColorPicker').value = preset.warning;

    updateThemePreview();
}

function saveTheme() {
    const theme = getCurrentColorValues();
    localStorage.setItem('userTheme', JSON.stringify(theme));
    applyThemeToCSS(theme);
    closeThemeEditor();
    alert(translations[currentLanguage].themeSaved || '¡Tema guardado!');
}

function resetTheme() {
    const defaultTheme = themePresets.default;
    document.getElementById('primaryColorPicker').value = defaultTheme.primary;
    document.getElementById('secondaryColorPicker').value = defaultTheme.secondary;
    document.getElementById('backgroundColorPicker').value = defaultTheme.background;
    document.getElementById('textColorPicker').value = defaultTheme.text;
    document.getElementById('accentColorPicker').value = defaultTheme.accent;
    document.getElementById('successColorPicker').value = defaultTheme.success;
    document.getElementById('dangerColorPicker').value = defaultTheme.danger;
    document.getElementById('warningColorPicker').value = defaultTheme.warning;

    localStorage.removeItem('userTheme');
    applyThemeToCSS(defaultTheme);
    updateThemePreview();
    alert(translations[currentLanguage].themeReset || 'Tema restablecido');
}

function applyThemeToCSS(theme) {
    const root = document.documentElement;

    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-light', adjustColor(theme.primary, 40));
    root.style.setProperty('--primary-dark', adjustColor(theme.primary, -20));
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--success', theme.success);
    root.style.setProperty('--danger', theme.danger);
    root.style.setProperty('--warning', theme.warning);
    root.style.setProperty('--info', adjustColor(theme.primary, 20));

    const isDarkBg = isColorDark(theme.background);

    root.style.setProperty('--bg-main', theme.background);
    root.style.setProperty('--bg-gradient-start', theme.background);
    root.style.setProperty('--bg-gradient-end', isDarkBg ? theme.accent : adjustColor(theme.primary, 160));

    root.style.setProperty('--text-primary', theme.text);
    root.style.setProperty('--text-secondary', isDarkBg ? adjustColor(theme.text, -60) : adjustColor(theme.text, 40));
    root.style.setProperty('--text-muted', isDarkBg ? adjustColor(theme.text, -110) : adjustColor(theme.text, 80));

    root.style.setProperty('--container-bg', isDarkBg ? 'rgba(15, 23, 42, 0.92)' : 'rgba(248, 250, 252, 0.96)');
    root.style.setProperty('--card-bg', isDarkBg ? '#111827' : '#ffffff');
    root.style.setProperty('--input-bg', isDarkBg ? '#0b1220' : '#ffffff');
    root.style.setProperty('--filter-bg', isDarkBg ? '#0b1220' : '#f1f5f9');
    root.style.setProperty('--border-color', isDarkBg ? '#334155' : '#e2e8f0');
    root.style.setProperty('--input-border', isDarkBg ? '#475569' : '#cbd5e1');
    root.style.setProperty('--table-row-hover', isDarkBg ? '#1f2937' : '#f8fafc');
}

function isColorDark(hex) {
    const color = hex.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16), g = parseInt(color.substr(2, 2), 16), b = parseInt(color.substr(4, 2), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 < 128;
}

// ============================================================
// INICIALIZACIÓN PRINCIPAL (DOMContentLoaded)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('userTheme');
    applyThemeToCSS(savedTheme ? JSON.parse(savedTheme) : themePresets.default);

    const user = getUserSession();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('userInfo').innerHTML = `<i class="fas fa-user-circle"></i> ${translations[currentLanguage].welcome} <strong>${user.username}</strong>`;
    document.querySelectorAll('.logout-divider, .logout-section').forEach(el => el.style.display = 'block');
    detectAndEnableAdminUI(user);
    setupFilterMenu();
    placeManagerControls();
    loadFileList();
    loadDashboardStats();
    loadUserQuotaInfo();

    document.getElementById('languageToggle').addEventListener('click', () => {
        const newLang = currentLanguage === 'es' ? 'en' : 'es';
        localStorage.setItem('language', newLang);
        location.reload();
    });

    const filterType = document.getElementById('filterType');
    if (filterType) {
        filterType.addEventListener('change', (e) => {
            currentFilterType = e.target.value;
            const extensionGroup = document.getElementById('extensionFilterGroup');
            if (currentFilterType === 'files') {
                extensionGroup.style.display = 'block';
            } else {
                extensionGroup.style.display = 'none';
                currentExtensionFilter = 'all';
                const filterExtension = document.getElementById('filterExtension');
                if (filterExtension) filterExtension.value = 'all';
            }
            syncFilterMenuState();
            applyFilters();
        });
    }

    document.getElementById('filterExtension')?.addEventListener('change', (e) => {
        currentExtensionFilter = e.target.value;
        applyFilters();
    });

    document.getElementById('clearFiltersBtn')?.addEventListener('click', clearAllFilters);

    // Listener de búsqueda: filtra la lista al escribir
    const searchInputEl = document.getElementById('searchInput');
    if (searchInputEl) {
        searchInputEl.addEventListener('input', () => {
            applyFilters();
        });
        // Limpiar búsqueda al pulsar Escape
        searchInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInputEl.value = '';
                applyFilters();
                searchInputEl.blur();
            }
        });
    }

    document.getElementById('saveRename')?.addEventListener('click', renameItem);
    document.getElementById('saveMkdir')?.addEventListener('click', createFolder);
    document.getElementById('saveMoveBrowser')?.addEventListener('click', moveFileToCurrentFolder);
    document.getElementById('confirmSend')?.addEventListener('click', sendFiles);
    document.getElementById('generateShareLink')?.addEventListener('click', generateShareLink);

    document.getElementById('createFolderBtn')?.addEventListener('click', openMkdirModal);

    document.querySelector('#renameModal .close-modal')?.addEventListener('click', closeRenameModal);
    document.getElementById('cancelRename')?.addEventListener('click', closeRenameModal);

    document.getElementById('closeMkdirModal')?.addEventListener('click', closeMkdirModal);
    document.getElementById('cancelMkdir')?.addEventListener('click', closeMkdirModal);

    document.getElementById('closeMoveBrowserModal')?.addEventListener('click', closeMoveBrowserModal);
    document.getElementById('cancelMoveBrowser')?.addEventListener('click', closeMoveBrowserModal);

    document.getElementById('closeShareModal')?.addEventListener('click', closeShareModal);
    document.getElementById('cancelShare')?.addEventListener('click', closeShareModal);

    document.getElementById('closeSendModal')?.addEventListener('click', closeSendModal);
    document.getElementById('cancelSend')?.addEventListener('click', closeSendModal);

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeRenameModal();
            closeMkdirModal();
            closeMoveBrowserModal();
            closeShareModal();
            closeSendModal();
            closeThemeEditor();
        }
    });

    document.getElementById('newFileName')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') renameItem(); });
    document.getElementById('folderName')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') createFolder(); });

    document.getElementById('sendButton')?.addEventListener('click', openSendModal);
    document.getElementById('bulkMoveButton')?.addEventListener('click', openBulkMoveModal);
    document.getElementById('bulkDownloadButton')?.addEventListener('click', downloadSelectedFiles);
    document.getElementById('bulkDeleteButton')?.addEventListener('click', deleteSelectedItems);
    document.getElementById('cancelUploadBtn')?.addEventListener('click', cancelAllUploads);

    // ===== NUEVA LÓGICA DE SUBIDA AUTOMÁTICA (CLIC Y ARRASTRE) =====
    const dropZone = document.getElementById('uploadDropZone');
    const hiddenFileInput = document.getElementById('hiddenFileInput');

    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-active'), false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-active'), false);
        });

        dropZone.addEventListener('drop', async (e) => {
            const dt = e.dataTransfer;
            if (dt.items && dt.items.length > 0) {
                const tasks = await getAllFileEntries(dt.items);
                enqueueFilesForUpload(tasks);
            } else if (dt.files && dt.files.length > 0) {
                const tasks = Array.from(dt.files).map(file => ({ file, relativePath: file.name }));
                enqueueFilesForUpload(tasks);
            }
        });

        dropZone.addEventListener('click', () => {
            hiddenFileInput.click();
        });
    }

    if (hiddenFileInput) {
        hiddenFileInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            const tasks = files.map(file => ({ file, relativePath: file.name }));
            enqueueFilesForUpload(tasks);
            hiddenFileInput.value = '';
        });
    }

    document.getElementById('themeEditorBtn').onclick = openThemeEditor;

    ['primary', 'secondary', 'background', 'text', 'accent', 'success', 'danger', 'warning'].forEach(id => {
        const el = document.getElementById(id + 'ColorPicker');
        if (el) el.addEventListener('input', updateThemePreview);
    });

    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.onclick = (e) => {
            e.stopPropagation();
            document.getElementById('settingsDropdown').classList.toggle('open');
        };
        document.addEventListener('click', (e) => {
            if (!document.getElementById('settingsDropdown').contains(e.target))
                document.getElementById('settingsDropdown').classList.remove('open');
        });
    }
});

function getFileTypeDisplay(name, isDir) {
    if (isDir) {
        return currentLanguage === 'es' ? 'Carpeta' : 'Folder';
    }
    const ext = name.split('.').pop().toLowerCase();

    const types = {
        es: {
            pdf: 'Documento PDF',
            jpg: 'Imagen JPEG',
            jpeg: 'Imagen JPEG',
            png: 'Imagen PNG',
            gif: 'Imagen GIF',
            webp: 'Imagen WebP',
            svg: 'Gráfico vectorial SVG',
            mp3: 'Audio MP3',
            wav: 'Audio WAV',
            flac: 'Audio FLAC',
            mp4: 'Video MP4',
            webm: 'Video WebM',
            zip: 'Comprimido ZIP',
            rar: 'Comprimido RAR',
            '7z': 'Comprimido 7z',
            html: 'Documento HTML',
            css: 'Hoja de estilo CSS',
            js: 'Archivo JavaScript',
            json: 'Documento JSON',
            txt: 'Documento de texto',
            exe: 'Aplicación ejecutable',
            default: `Archivo ${ext.toUpperCase()}`
        },
        en: {
            pdf: 'PDF Document',
            jpg: 'JPEG Image',
            jpeg: 'JPEG Image',
            png: 'PNG Image',
            gif: 'GIF Image',
            webp: 'WebP Image',
            svg: 'SVG Vector Image',
            mp3: 'MP3 Audio',
            wav: 'WAV Audio',
            flac: 'FLAC Audio',
            mp4: 'MP4 Video',
            webm: 'WebM Video',
            zip: 'ZIP Archive',
            rar: 'RAR Archive',
            '7z': '7z Archive',
            html: 'HTML Document',
            css: 'CSS Stylesheet',
            js: 'JavaScript File',
            json: 'JSON Document',
            txt: 'Text Document',
            exe: 'Executable Application',
            default: `${ext.toUpperCase()} File`
        }
    };

    const langTypes = types[currentLanguage] || types['es'];
    return langTypes[ext] || langTypes['default'];
}

function handleRowClick(e, path, isDir) {
    if (e.target.closest('.file-checkbox') || e.target.closest('input')) {
        return;
    }
    if (isDir) {
        openFolder(path);
    } else {
        previewFile(path);
    }
}

// ============================================================
// Menú Contextual (Click Derecho)
// ============================================================

function rightClickSelect(filePath) {
    if (!selectedFiles.has(filePath)) {
        selectedFiles.clear();
        selectedFiles.add(filePath);
        updateSelectedCount();
        updateCheckboxState();
    }
}

function showContextMenu(e, item) {
    e.preventDefault();
    rightClickSelect(item.path);

    let menu = document.getElementById('customContextMenu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'customContextMenu';
        menu.className = 'custom-context-menu';
        document.body.appendChild(menu);
    }

    const count = selectedFiles.size;
    const isSingle = count === 1;
    const isDir = item.isDirectory;

    let html = '';

    // 1. Enviar (Send)
    html += `
        <div class="context-menu-item" onclick="triggerContextAction('send')">
            <i class="fas fa-file-export"></i>
            <span>${translations[currentLanguage].send} ${!isSingle ? `(${count})` : ''}</span>
        </div>
    `;

    // 2. Mover (Move)
    html += `
        <div class="context-menu-item" onclick="triggerContextAction('move')">
            <i class="fas fa-arrows-alt"></i>
            <span>${translations[currentLanguage].move} ${!isSingle ? `(${count})` : ''}</span>
        </div>
    `;

    // 3. Descargar (Download / Download ZIP)
    const downloadLabel = isSingle && !isDir ? translations[currentLanguage].download : translations[currentLanguage].downloadZip;
    html += `
        <div class="context-menu-item" onclick="triggerContextAction('download')">
            <i class="fas fa-download"></i>
            <span>${downloadLabel} ${!isSingle ? `(${count})` : ''}</span>
        </div>
    `;

    // 4. Compartir (Share) (only if single file)
    if (isSingle && !isDir) {
        html += `
            <div class="context-menu-item" onclick="triggerContextAction('share')">
                <i class="fas fa-share-alt"></i>
                <span>${translations[currentLanguage].share}</span>
            </div>
        `;
    }

    // 5. Renombrar (Rename) (only if single)
    if (isSingle) {
        html += `
            <div class="context-menu-item" onclick="triggerContextAction('rename')">
                <i class="fas fa-pencil-alt"></i>
                <span>${translations[currentLanguage].rename}</span>
            </div>
        `;
    }

    // Separador
    html += `<div class="context-menu-separator"></div>`;

    // 6. Eliminar (Delete)
    html += `
        <div class="context-menu-item danger" onclick="triggerContextAction('delete')">
            <i class="fas fa-trash"></i>
            <span>${translations[currentLanguage].delete} ${!isSingle ? `(${count})` : ''}</span>
        </div>
    `;

    menu.innerHTML = html;

    // Position menu
    menu.style.display = 'block';

    const menuWidth = 200;
    const menuHeight = isSingle ? (isDir ? 190 : 230) : 150;
    let posX = e.pageX;
    let posY = e.pageY;

    if (posX + menuWidth > window.innerWidth + window.scrollX) {
        posX = e.pageX - menuWidth;
    }
    if (posY + menuHeight > window.innerHeight + window.scrollY) {
        posY = e.pageY - menuHeight;
    }

    menu.style.left = posX + 'px';
    menu.style.top = posY + 'px';

    // Trigger fade/scale entrance
    setTimeout(() => {
        menu.classList.add('visible');
    }, 10);
}

function triggerContextAction(action) {
    const selectedPaths = Array.from(selectedFiles);
    if (selectedPaths.length === 0) return;

    const firstPath = selectedPaths[0];
    const firstItem = filteredFiles.find(f => f.path === firstPath) || { path: firstPath, isDirectory: false, name: firstPath.split('/').pop() };

    closeContextMenu();

    if (action === 'send') {
        openSendModal();
    } else if (action === 'move') {
        if (selectedPaths.length === 1) {
            openMoveBrowserModal(firstItem.path, firstItem.name);
        } else {
            openBulkMoveModal();
        }
    } else if (action === 'download') {
        if (selectedPaths.length === 1) {
            downloadFile(firstItem.path, firstItem.isDirectory);
        } else {
            downloadSelectedFiles();
        }
    } else if (action === 'share') {
        openShareModal(firstItem.path, firstItem.name);
    } else if (action === 'rename') {
        openRenameModal(firstItem.path, firstItem.name, firstItem.isDirectory);
    } else if (action === 'delete') {
        if (selectedPaths.length === 1) {
            deleteItem(firstItem.path, firstItem.isDirectory);
        } else {
            deleteSelectedItems();
        }
    }
}

function closeContextMenu() {
    const menu = document.getElementById('customContextMenu');
    if (menu) {
        menu.classList.remove('visible');
        setTimeout(() => {
            menu.style.display = 'none';
        }, 150);
    }
}

// Escuchar eventos globales para cerrar el menú contextual
document.addEventListener('click', function (e) {
    if (!e.target.closest('.custom-context-menu')) {
        closeContextMenu();
    }
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeContextMenu();
    }
});

setLanguage(currentLanguage);