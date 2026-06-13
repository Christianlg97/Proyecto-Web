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
        title: 'Sistema de Gestión de Archivos',
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
        noFileSelected: 'No se ha seleccionado ningún archivo'
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
        noFileSelected: 'No file selected'
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
    const toolbarRow1 = actionBar ? actionBar.querySelector('.toolbar-row-1') : null;
    const toolbarRow2 = actionBar ? actionBar.querySelector('.toolbar-row-2') : null;
    const adminBrowseBar = document.getElementById('adminBrowseBar');
    const extensionGroup = document.getElementById('extensionFilterGroup');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    if (actionBar) {
        const targetRow1 = toolbarRow1 || actionBar;
        const targetRow2 = toolbarRow2 || actionBar;

        if (extensionGroup && extensionGroup.parentNode !== targetRow1) {
            targetRow1.appendChild(extensionGroup);
        }
        if (clearFiltersBtn && clearFiltersBtn.parentNode !== targetRow1) {
            targetRow1.appendChild(clearFiltersBtn);
        }
        if (adminBrowseBar && adminBrowseBar.parentNode !== targetRow2) {
            adminBrowseBar.classList.add('admin-browse-inline');
            targetRow2.appendChild(adminBrowseBar);
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

async function deleteItem(itemPath, isFolder = false) {
    const confirmMsg = isFolder
        ? translations[currentLanguage].confirmDeleteFolder
        : translations[currentLanguage].confirmDelete;

    if (!confirm(confirmMsg)) return;

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
    if (!confirm(translations[currentLanguage].confirmDeleteFolder)) return;

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
        return;
    }

    let html = `<h3><i class="fas fa-files"></i> ${translations[currentLanguage].myFiles} (${files.length})</h3>`;
    html += '<div id="fileListControls" class="file-list-controls"></div>';
    html += '<div class="file-table-container">';
    html += '<table class="file-table">';
    html += `<thead><tr>
        <th style="width: 40px;"><input type="checkbox" id="selectAllCheckbox" onclick="toggleSelectAll()" class="file-checkbox"></th>
        <th>${translations[currentLanguage].fileName}</th>
        <th style="width: 100px;">${translations[currentLanguage].size}</th>
        <th style="width: 160px;">${translations[currentLanguage].uploaded}</th>
        <th style="min-width: 320px;">${translations[currentLanguage].actions}</th>
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

        html += `<tr>
            <td><input type="checkbox" class="file-checkbox" data-path="${safePath}" ${isSelected} onclick="toggleFileSelection('${safePath}')"></td>
            <td class="clickable-name-cell" onclick="${isDir ? `openFolder('${safePath}')` : `previewFile('${safePath}')`}">
                <i class="fas ${fileIcon} file-icon-anim" style="margin-right: 12px; color: ${iconColor}; font-size: 1.2rem;"></i> 
                <span class="file-name" title="${safeName}">${safeDisplayName}</span>
            </td>
            <td><span class="badge">${sizeDisplay}</span></td>
            <td>${date}</td>
            <td><div class="action-cell" style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-start;">`;

        if (isDir) {
            html += `
                <button onclick="downloadFile('${safePath}', true)" class="table-btn btn-download" title="${translations[currentLanguage].downloadZip}"><i class="fas fa-download"></i> <span class="btn-text">${translations[currentLanguage].download}</span></button>
                <button onclick="openRenameModal('${safePath}', '${safeName}', true)" class="table-btn btn-rename" title="${translations[currentLanguage].rename}"><i class="fas fa-pencil-alt"></i> <span class="btn-text">${translations[currentLanguage].rename}</span></button>
                <button onclick="deleteItem('${safePath}', true)" class="table-btn btn-delete" title="${translations[currentLanguage].delete}"><i class="fas fa-trash"></i> <span class="btn-text">${translations[currentLanguage].delete}</span></button>
            `;
        } else {
            html += `
                <button onclick="downloadFile('${safePath}')" class="table-btn btn-download" title="${translations[currentLanguage].download}"><i class="fas fa-download"></i> <span class="btn-text">${translations[currentLanguage].download}</span></button>
                <button onclick="openMoveBrowserModal('${safePath}', '${safeName}')" class="table-btn btn-move" title="${translations[currentLanguage].move}"><i class="fas fa-arrows-alt"></i> <span class="btn-text">${translations[currentLanguage].move}</span></button>
                <button onclick="openRenameModal('${safePath}', '${safeName}')" class="table-btn btn-rename" title="${translations[currentLanguage].rename}"><i class="fas fa-pencil-alt"></i> <span class="btn-text">${translations[currentLanguage].rename}</span></button>
                <button onclick="deleteItem('${safePath}')" class="table-btn btn-delete" title="${translations[currentLanguage].delete}"><i class="fas fa-trash"></i> <span class="btn-text">${translations[currentLanguage].delete}</span></button>
		        <button onclick="openShareModal('${safePath}', '${safeName}')" class="table-btn btn-share" title="${translations[currentLanguage].share}"><i class="fas fa-share-alt"></i> <span class="btn-text">${translations[currentLanguage].share}</span></button>
            `;
        }

        html += `</div></td></tr>`;
    });

    html += '</tbody></table></div>';
    fileListDiv.innerHTML = html;
    const controlsSlot = document.getElementById('fileListControls');
    if (controlsSlot) controlsSlot.appendChild(preservedControls);
    placeManagerControls();
    updateCheckboxState();
    updateSelectedCount();
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

let uploadQueue = [];
let isUploading = false;
let totalUploadTasks = 0;
let completedUploadTasks = 0;

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

function updateQueueProgressUI(percentCurrentFile, speedText, currentFileName) {
    const uploadMessage = document.getElementById('uploadMessage');
    if (!uploadMessage) return;
    
    const percentOverall = totalUploadTasks > 0 
        ? Math.round(((completedUploadTasks + (percentCurrentFile / 100)) / totalUploadTasks) * 100)
        : 0;
        
    uploadMessage.className = 'info-message';
    uploadMessage.innerHTML = `
        <div id="contenedor-barra-progreso" style="text-align: left; width: 100%; padding: 15px 0; font-family: inherit;">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="display: inline-flex; align-items: center; gap: 8px;">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 20px;"></i>
                    <span>${translations[currentLanguage].uploading} ${completedUploadTasks + 1} ${translations[currentLanguage].of} ${totalUploadTasks}...</span>
                </span>
                <span>${percentOverall}%</span>
            </div>
            <div style="width: 100%; background-color: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
                <div id="uploadProgressBar" style="width: ${percentOverall}%; height: 100%; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); transition: width 0.1s ease;"></div>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); display: flex; justify-content: space-between; gap: 10px;">
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%;" title="${escapeHTML(currentFileName)}">${escapeHTML(currentFileName)} (${percentCurrentFile.toFixed(1)}%)</span>
                <span>${speedText}</span>
            </div>
        </div>
    `;
}

async function processNextUpload() {
    if (uploadQueue.length === 0) {
        isUploading = false;
        totalUploadTasks = 0;
        completedUploadTasks = 0;
        
        showMessage('uploadMessage', `<i class="fas fa-check-circle"></i> ${translations[currentLanguage].uploadSuccess}`, 'success');
        loadFileList();
        return;
    }
    
    const task = uploadQueue.shift();
    const user = getUserSession();
    if (!user) {
        uploadQueue = [];
        isUploading = false;
        return;
    }
    
    const targetFolder = getUploadPathForTask(task.relativePath);
    
    const formData = new FormData();
    formData.append('file', task.file);
    formData.append('token', user.token);
    
    let uploadStartTime = Date.now();
    let lastLoaded = 0;
    let lastTime = uploadStartTime;
    let speedText = '0 B/s';
    
    const xhr = new XMLHttpRequest();
    let uploadUrl = `${API_URL}/upload/${user.username}?token=${user.token}`;
    if (targetFolder) {
        uploadUrl += `&path=${encodeURIComponent(targetFolder)}`;
    }
    
    xhr.open('POST', uploadUrl, true);
    
    xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
            const percentComplete = Math.max(0, Math.min(100, (event.loaded / event.total) * 100));
            const currentTime = Date.now();
            const timeDiff = (currentTime - lastTime) / 1000;
            
            if (timeDiff > 0.5) {
                const bytesDiff = event.loaded - lastLoaded;
                const speedBps = bytesDiff / timeDiff;
                
                if (speedBps > 1024 * 1024) {
                    speedText = `${(speedBps / (1024 * 1024)).toFixed(2)} MB/s`;
                } else if (speedBps > 1024) {
                    speedText = `${(speedBps / 1024).toFixed(2)} KB/s`;
                } else {
                    speedText = `${Math.round(speedBps)} B/s`;
                }
                
                lastTime = currentTime;
                lastLoaded = event.loaded;
            }
            
            updateQueueProgressUI(percentComplete, speedText, task.relativePath);
        }
    };
    
    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                if (data.success) {
                    completedUploadTasks++;
                    processNextUpload();
                } else {
                    showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> Error: ${escapeHTML(data.message || 'error')}`, 'error');
                    isUploading = false;
                    uploadQueue = [];
                }
            } catch (e) {
                showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> Error parseando respuesta`, 'error');
                isUploading = false;
                uploadQueue = [];
            }
        } else {
            let errorMsg = 'Error del servidor';
            try {
                const data = JSON.parse(xhr.responseText);
                if (data.message) errorMsg = data.message;
            } catch(e) {}
            showMessage('uploadMessage', `<i class="fas fa-exclamation-circle"></i> Error al subir ${escapeHTML(task.file.name)}: ${escapeHTML(errorMsg)}`, 'error');
            isUploading = false;
            uploadQueue = [];
        }
    };
    
    xhr.onerror = function () {
        showMessage('uploadMessage', `<i class="fas fa-exclamation-triangle"></i> ${translations[currentLanguage].connectionError}`, 'error');
        isUploading = false;
        uploadQueue = [];
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
        if (task.file.size > userQuotaInfo.max_file_size_bytes && userQuotaInfo.max_file_size_bytes > 0) {
            const maxSizeText = getFormattedMaxFileSize();
            const fileSizeText = formatBytesShort(task.file.size);
            alert(`El archivo ${task.file.name} supera el tamaño máximo de ${maxSizeText} y no se subirá.\nTu archivo: ${fileSizeText}`);
            continue;
        }
        totalSize += task.file.size;
        validTasks.push(task);
    }
    
    if (validTasks.length === 0) return;
    
    await loadUserQuotaInfo();
    
    if (userQuotaInfo.quota_bytes > 0 && (userQuotaInfo.used_bytes + totalSize) > userQuotaInfo.quota_bytes) {
        const availableSpace = Math.max(0, userQuotaInfo.quota_bytes - userQuotaInfo.used_bytes);
        alert(`No hay suficiente espacio para subir todos los archivos.\nEspacio libre disponible: ${formatBytesShort(availableSpace)}\nTamaño total a subir: ${formatBytesShort(totalSize)}`);
        return;
    }
    
    uploadQueue.push(...validTasks);
    totalUploadTasks += validTasks.length;
    
    if (!isUploading) {
        isUploading = true;
        processNextUpload();
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
            
            for (const subEntry of entries) {
                await traverseEntry(subEntry, relativePath ? relativePath + '/' + entry.name : entry.name);
            }
        }
    }
    
    for (const item of dataTransferItems) {
        if (item.kind === 'file') {
            const entry = item.webkitGetAsEntry();
            if (entry) {
                await traverseEntry(entry);
            }
        }
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

setLanguage(currentLanguage);