/**
 * LOGIN.JS - SISTEMA DE AUTENTICACIÓN Y CONFIGURACIÓN
 * Este archivo contiene la lógica de login/registro y configuración de temas e idiomas.
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
        loginSuccess: 'Login exitoso!',
        loginError: 'Usuario o contraseña incorrectos',
        connectionError: 'Error de conexión con el servidor',
        verifying: 'Verificando credenciales...',
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
        cancel: 'Cancelar',
        save: 'Guardar',
        preview: 'Vista'
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
        loginSuccess: 'Login successful!',
        loginError: 'Invalid username or password',
        connectionError: 'Connection error',
        verifying: 'Verifying credentials...',
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
        cancel: 'Cancel',
        save: 'Save',
        preview: 'Preview'
    }
};

// Estado Global
let currentLanguage = localStorage.getItem('language') || 'es';

const themePresets = {
    default: { primary: '#4361ee', secondary: '#4cc9f0', background: '#f8fafc', text: '#0f172a', accent: '#7209b7', success: '#06d6a0', danger: '#ef476f', warning: '#f59e0b' },
    ocean: { primary: '#0077b6', secondary: '#00b4d8', background: '#f0f9ff', text: '#0b2545', accent: '#0096c7', success: '#06d6a0', danger: '#ef476f', warning: '#f59e0b' },
    forest: { primary: '#2d6a4f', secondary: '#52b788', background: '#f0fdf4', text: '#052e16', accent: '#40916c', success: '#22c55e', danger: '#ef476f', warning: '#f59e0b' },
    sunset: { primary: '#ff6b35', secondary: '#ffb703', background: '#fff7ed', text: '#431407', accent: '#f72585', success: '#06d6a0', danger: '#ef4444', warning: '#f59e0b' },
    midnight: { primary: '#6366f1', secondary: '#22d3ee', background: '#0b1020', text: '#e2e8f0', accent: '#a855f7', success: '#22c55e', danger: '#fb7185', warning: '#fbbf24' },
    dark: { primary: '#4f46e5', secondary: '#22d3ee', background: '#0f172a', text: '#e2e8f0', accent: '#9333ea', success: '#22c55e', danger: '#fb7185', warning: '#fbbf24' },
    candy: { primary: '#fb7185', secondary: '#f472b6', background: '#fff1f2', text: '#3b0a2a', accent: '#a78bfa', success: '#2dd4bf', danger: '#ef4444', warning: '#fbbf24' }
};

// ============================================================
// Funciones de Utilidad
// ============================================================

/**
 * Escapa caracteres especiales de HTML para prevenir ataques XSS.
 */
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Muestra un mensaje de estado temporal en la UI.
 */
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.innerHTML = message;
    element.className = type === 'success' ? 'success-message' : type === 'error' ? 'error-message' : 'info-message';
    if (type !== 'info') {
        setTimeout(() => { element.innerHTML = ''; element.className = ''; }, 3000);
    }
}

/**
 * Implementación del algoritmo MD5 para hashing de cadenas.
 * Utilizado para procesar contraseñas antes del envío.
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

/**
 * Valida la fortaleza de una contraseña.
 */
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]+/) && password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/) || password.match(/[$@#&!]+/)) strength += 25;
    return strength;
}

/**
 * Actualiza visualmente la barra de fortaleza de la contraseña.
 */
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
// GESTIÓN DE IDIOMAS
// ============================================================

/**
 * Cambia el idioma de la interfaz.
 */
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.getElementById('htmlTag').setAttribute('lang', lang);

    // Actualizar elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Actualizar placeholders con data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });

    // Actualizar títulos con data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (translations[lang][key]) {
            element.title = translations[lang][key];
        }
    });

    // Cambiar texto del botón de toggle
    const langBtn = document.getElementById('languageToggle').querySelector('span');
    if (langBtn) {
        langBtn.textContent = lang === 'es' ? 'English' : 'Español';
    }
}

// ============================================================
// EDITOR DE TEMAS
// ============================================================

/**
 * Abre el editor de temas cargando los colores actuales.
 */
function openThemeEditor() {
    const savedTheme = localStorage.getItem('userTheme');
    const theme = savedTheme ? JSON.parse(savedTheme) : themePresets.default;
    ['primary', 'secondary', 'background', 'text', 'accent', 'success', 'danger', 'warning'].forEach(c => {
        const el = document.getElementById(c + 'ColorPicker');
        if (el) el.value = theme[c];
    });
    updateThemePreview();
    document.getElementById('themeEditorModal').style.display = 'block';
}

/**
 * Actualiza la vista previa del tema en tiempo real.
 */
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

/**
 * Captura los valores de los selectores de color.
 */
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

/**
 * Ajusta el brillo de un color hexadecimal.
 */
function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Cierra el modal del editor de temas.
 */
function closeThemeEditor() {
    const modal = document.getElementById('themeEditorModal');
    if (modal) modal.style.display = 'none';
}

/**
 * Aplica un tema predefinido.
 */
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

/**
 * Guarda la configuración del tema en localStorage y la aplica.
 */
function saveTheme() {
    const theme = getCurrentColorValues();
    localStorage.setItem('userTheme', JSON.stringify(theme));
    applyThemeToCSS(theme);
    closeThemeEditor();
    alert(translations[currentLanguage].themeSaved || '¡Tema guardado!');
}

/**
 * Restablece el tema a los valores por defecto.
 */
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

/**
 * Aplica el tema inyectando variables CSS en el root del documento.
 */
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

/**
 * Determina si un color hexadecimal es oscuro.
 */
function isColorDark(hex) {
    const color = hex.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16), g = parseInt(color.substr(2, 2), 16), b = parseInt(color.substr(4, 2), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 < 128;
}

// ============================================================
// INICIALIZACIÓN PRINCIPAL
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Aplicar tema guardado
    const savedTheme = localStorage.getItem('userTheme');
    applyThemeToCSS(savedTheme ? JSON.parse(savedTheme) : themePresets.default);

    // Aplicar idioma
    setLanguage(currentLanguage);

    // === Gestión de Pestañas ===
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginTab && registerTab && loginForm && registerForm) {
        loginTab.onclick = () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active-form');
            registerForm.classList.remove('active-form');
            document.getElementById('loginMessage').innerHTML = '';
            document.getElementById('loginMessage').className = '';
            document.getElementById('registerMessage').innerHTML = '';
            document.getElementById('registerMessage').className = '';
        };

        registerTab.onclick = () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.add('active-form');
            loginForm.classList.remove('active-form');
            document.getElementById('loginMessage').innerHTML = '';
            document.getElementById('loginMessage').className = '';
            document.getElementById('registerMessage').innerHTML = '';
            document.getElementById('registerMessage').className = '';
        };
    }

    // === Fortaleza de Contraseña ===
    const regPasswordInput = document.getElementById('regPassword');
    const passwordStrengthContainer = document.getElementById('passwordStrength');

    const resetPasswordStrength = () => {
        if (!passwordStrengthContainer) return;
        const bar = passwordStrengthContainer.querySelector('.password-strength-bar');
        if (bar) {
            bar.style.width = '0%';
            bar.style.background = '';
        }
        passwordStrengthContainer.style.display = 'none';
    };

    const syncPasswordStrength = () => {
        if (!regPasswordInput || !passwordStrengthContainer) return;
        const password = regPasswordInput.value || '';
        if (!password) {
            resetPasswordStrength();
            return;
        }
        passwordStrengthContainer.style.display = 'block';
        updatePasswordStrength(password);
    };

    if (regPasswordInput && passwordStrengthContainer) {
        resetPasswordStrength();
        regPasswordInput.addEventListener('input', syncPasswordStrength);
        regPasswordInput.addEventListener('blur', syncPasswordStrength);
        loginTab?.addEventListener('click', resetPasswordStrength);
        registerTab?.addEventListener('click', syncPasswordStrength);
    }

    // === Procesamiento de Login ===
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            showMessage('loginMessage', `<i class="fas fa-spinner fa-spin"></i> ${translations[currentLanguage].verifying}`, 'info');

            const hashedPassword = md5Hash(password);
            try {
                // Intentar obtener la IP pública real del cliente
                let client_ip = '';
                try {
                    const ipRes = await fetch('https://api.ipify.org?format=json', { method: 'GET', mode: 'cors' });
                    if (ipRes.ok) {
                        const ipData = await ipRes.json();
                        client_ip = ipData.ip;
                    }
                } catch (ipErr) {
                    console.warn('No se pudo obtener la IP pública del cliente:', ipErr);
                }

                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password: hashedPassword, client_ip })
                });
                const data = await response.json();
                if (data.success) {
                    showMessage('loginMessage', `<i class="fas fa-check-circle"></i> ${translations[currentLanguage].loginSuccess}`, 'success');
                    localStorage.setItem('user', JSON.stringify({
                        username, token: data.token, expires: Date.now() + 3600000, isAdmin: !!data.isAdmin
                    }));
                    setTimeout(() => {
                        window.location.href = 'apps.html';
                    }, 1000);
                } else {
                    showMessage('loginMessage', `<i class="fas fa-exclamation-circle"></i> ${escapeHTML(data.message || translations[currentLanguage].loginError)}`, 'error');
                }
            } catch (error) {
                showMessage('loginMessage', `<i class="fas fa-exclamation-triangle"></i> ${translations[currentLanguage].connectionError}`, 'error');
            }
        });
    }

    // === Procesamiento de Registro ===
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirm = document.getElementById('regConfirmPassword').value;

            if (!username || !password || !confirm) {
                showMessage('registerMessage', `<i class="fas fa-exclamation-circle"></i> ${translations[currentLanguage].allFieldsRequired}`, 'error');
                return;
            }

            if (username.length < 3) {
                showMessage('registerMessage', `<i class="fas fa-exclamation-circle"></i> ${translations[currentLanguage].usernameTooShort}`, 'error');
                return;
            }

            if (password.length < 6) {
                showMessage('registerMessage', `<i class="fas fa-exclamation-circle"></i> ${translations[currentLanguage].passwordTooShort}`, 'error');
                return;
            }

            if (password !== confirm) {
                showMessage('registerMessage', `<i class="fas fa-exclamation-circle"></i> ${translations[currentLanguage].passwordMismatch}`, 'error');
                return;
            }

            showMessage('registerMessage', `<i class="fas fa-spinner fa-spin"></i> ${translations[currentLanguage].registering}`, 'info');
            const hashedPassword = md5Hash(password);
            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password: hashedPassword })
                });
                const data = await response.json();
                if (data.success) {
                    showMessage('registerMessage', `<i class="fas fa-check-circle"></i> ${translations[currentLanguage].registerSuccess}`, 'success');
                    setTimeout(() => {
                        if (loginTab) loginTab.click();
                    }, 1500);
                } else {
                    showMessage('registerMessage', `<i class="fas fa-exclamation-circle"></i> ${escapeHTML(data.message || translations[currentLanguage].registerError)}`, 'error');
                }
            } catch (error) {
                showMessage('registerMessage', `<i class="fas fa-exclamation-triangle"></i> ${translations[currentLanguage].connectionError}`, 'error');
            }
        });
    }

    // === Temas e Idioma ===
    document.getElementById('themeEditorBtn').onclick = openThemeEditor;

    ['primary', 'secondary', 'background', 'text', 'accent', 'success', 'danger', 'warning'].forEach(id => {
        const el = document.getElementById(id + 'ColorPicker');
        if (el) el.addEventListener('input', updateThemePreview);
    });

    // === Dropdown de Ajustes ===
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

    // === Toggle de Idioma ===
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
        languageToggle.onclick = () => {
            const newLang = currentLanguage === 'es' ? 'en' : 'es';
            setLanguage(newLang);
        };
    }
});

// Inicializar idioma por defecto
setLanguage(currentLanguage);
