/**
 * ADMIN.JS - Panel de Administración con permisos granulares (checkboxes)
 * Los permisos se asignan individualmente. No hay selector de rol.
 * ADMIN (0x02): permite ver archivos de otros usuarios.
 * SUPERADMIN (0x04): permite acceder al panel de administración.
 * El resto de permisos son checkboxes independientes.
 */

const API_URL = '/api';

window.onerror = function (message, source, lineno, colno, error) {
    console.error("Error global capturado:", message, "en", source, ":", lineno);
};

const translations = {
    es: {
        adminTitle: 'Panel de Administración',
        logout: 'Cerrar sesión',
        backToUsers: 'Volver a usuarios',
        userFilesTitle: 'Archivos de {{username}}',
        changePassword: 'Cambiar contraseña',
        newPassword: 'Nueva contraseña:',
        passwordPlaceholder: 'Mínimo 6 caracteres',
        deleteUser: 'Eliminar usuario',
        registeredAt: 'Registrado:',
        id: 'ID:',
        adminBadge: 'Admin',
        confirmDeleteUser: '¿Estás seguro de eliminar al usuario {{username}} y todos sus archivos?',
        userDeleted: 'Usuario eliminado',
        passwordUpdated: 'Contraseña actualizada',
        minPasswordLength: 'La contraseña debe tener al menos 6 caracteres',
        errorLoadingUsers: 'Error cargando usuarios',
        errorLoadingFiles: 'Error cargando archivos',
        connectionError: 'Error de conexión',
        darkMode: 'Oscuro',
        lightMode: 'Claro',
        cancel: 'Cancelar',
        save: 'Guardar',
        loadingFiles: 'Cargando archivos...',
        emptyFolder: 'Carpeta vacía',
        name: 'Nombre',
        size: 'Tamaño',
        modified: 'Modificado',
        actions: 'Acciones',
        open: 'Abrir',
        preview: 'Vista',
        download: 'Descargar',
        up: 'Subir',
        path: 'Ruta',
        backToApp: 'Volver',
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
        loadingUsers: 'Cargando usuarios...',
        noUsersFound: 'No se encontraron usuarios.',
        selectUser: 'Seleccionar usuario...',
        received: 'Recibidos',
        browse: 'Examinar...',
        noFileSelected: 'No se ha seleccionado ningún archivo'
    },
    en: {
        adminTitle: 'Admin Panel',
        logout: 'Logout',
        backToUsers: 'Back to users',
        userFilesTitle: 'Files of {{username}}',
        changePassword: 'Change password',
        newPassword: 'New password:',
        passwordPlaceholder: 'Minimum 6 characters',
        deleteUser: 'Delete user',
        registeredAt: 'Registered:',
        id: 'ID:',
        adminBadge: 'Admin',
        confirmDeleteUser: 'Are you sure you want to delete user {{username}} and all their files?',
        userDeleted: 'User deleted',
        passwordUpdated: 'Password updated',
        minPasswordLength: 'Password must be at least 6 characters',
        errorLoadingUsers: 'Error loading users',
        errorLoadingFiles: 'Error loading files',
        connectionError: 'Connection error',
        darkMode: 'Dark',
        lightMode: 'Light',
        cancel: 'Cancel',
        save: 'Save',
        loadingFiles: 'Loading files...',
        emptyFolder: 'Empty folder',
        name: 'Name',
        size: 'Size',
        modified: 'Modified',
        actions: 'Actions',
        open: 'Open',
        preview: 'Preview',
        download: 'Download',
        up: 'Up',
        path: 'Path',
        backToApp: 'Back',
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
        loadingUsers: 'Loading users...',
        noUsersFound: 'No users found.',
        selectUser: 'Select user...',
        received: 'Received',
        browse: 'Browse...',
        noFileSelected: 'No file selected'
    }
};

let currentLanguage = localStorage.getItem('language') || 'es';
let currentUser = null;
let currentPath = '';
let selectedUsername = null;

const PERMISSION_BITS = {
    LOGIN:                  0x00000001,
    ADMIN:                  0x00000002,
    SUPERADMIN:             0x00000004,
    FILE_MANAGER:           0x00000008,
    VIEW_OTHERS_FILES:      0x00000010,
    MANAGE_USERS_STATUS:    0x00000020,
    MANAGE_USER_LIMITS:     0x00000040,
    KICK_USERS:             0x00000080,
    CHANGE_ANY_PASSWORD:    0x00000100,
    DELETE_USERS:           0x00000200,
    MANAGE_IPS:             0x00000400,
    MANAGE_GLOBAL_SETTINGS: 0x00000800
};

const permCheckboxMap = {
    'admin': PERMISSION_BITS.ADMIN,
    'superadmin': PERMISSION_BITS.SUPERADMIN,
    '0x10': PERMISSION_BITS.VIEW_OTHERS_FILES,
    '0x20': PERMISSION_BITS.MANAGE_USERS_STATUS,
    '0x40': PERMISSION_BITS.MANAGE_USER_LIMITS,
    '0x80': PERMISSION_BITS.KICK_USERS,
    '0x100': PERMISSION_BITS.CHANGE_ANY_PASSWORD,
    '0x200': PERMISSION_BITS.DELETE_USERS,
    '0x400': PERMISSION_BITS.MANAGE_IPS,
    '0x800': PERMISSION_BITS.MANAGE_GLOBAL_SETTINGS
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Iniciando panel de administración...');

    const backToAppHandler = (e) => {
        e.preventDefault();
        if (window.history.length > 1) window.history.back();
        else window.location.href = 'apps.html';
    };
    const backBtn = document.getElementById('backToAppBtn');
    if (backBtn) backBtn.addEventListener('click', backToAppHandler);
    const backBtnMobile = document.getElementById('backToAppBtnMobile');
    if (backBtnMobile) backBtnMobile.addEventListener('click', backToAppHandler);

    const user = getUserSession();
    if (!user) {
        window.location.href = 'apps.html';
        return;
    }
    if (sessionStorage.getItem('adminAccessGranted') !== 'true') {
        window.location.href = 'apps.html';
        return;
    }
    currentUser = user;

    const adminContainer = document.querySelector('.admin-container');
    if (adminContainer) adminContainer.style.display = 'block';

    // Ocultar pestañas sensibles si no es superadmin
    if (!currentUser.isSuperadmin) {
        const tabs = document.querySelectorAll('.admin-tabs button');
        tabs.forEach(tab => {
            if (tab.textContent.includes('IPs') || tab.textContent.includes('Configuración')) {
                tab.style.display = 'none';
            }
        });
    }

    setLanguage(currentLanguage);
    setupEventListeners();
    loadUsers();
});

function setupEventListeners() {
    const langToggle = document.getElementById('languageToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
            localStorage.setItem('language', currentLanguage);
            location.reload();
        });
    }
    const backToUsersBtn = document.getElementById('backToUsersBtn');
    if (backToUsersBtn) backToUsersBtn.addEventListener('click', backToUsers);
    const themeEditorBtn = document.getElementById('themeEditorBtn');
    if (themeEditorBtn) themeEditorBtn.addEventListener('click', openThemeEditorModal);
}

function getUserSession() {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        const user = JSON.parse(userStr);
        if (user.expires && Date.now() > user.expires) {
            localStorage.removeItem('user');
            return null;
        }
        return user;
    } catch (e) {
        return null;
    }
}

function setLanguage(lang) {
    if (!translations[lang]) lang = 'es';
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) el.placeholder = translations[lang][key];
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translations[lang][key]) el.title = translations[lang][key];
    });
    const langToggle = document.getElementById('languageToggle');
    if (langToggle) {
        const span = langToggle.querySelector('span');
        if (span) span.textContent = lang === 'es' ? 'English' : 'Español';
    }
    if (selectedUsername) {
        const title = document.getElementById('currentUserTitle');
        if (title) title.innerHTML = `<i class="fas fa-user"></i> ${translations[lang].userFilesTitle.replace('{{username}}', selectedUsername)}`;
    }
}

async function loadUsers() {
    if (!currentUser) return;
    const container = document.getElementById('userList');
    if (!container) return;
    container.innerHTML = `<div class="loader"></div><p style="text-align:center;">${translations[currentLanguage].loadingUsers}</p>`;
    try {
        const res = await fetch(`${API_URL}/admin/users?token=${currentUser.token}`);
        if (res.status === 403) {
            localStorage.removeItem('user');
            sessionStorage.removeItem('adminAccessGranted');
            window.location.href = 'apps.html';
            return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success) {
            const myUser = data.users.find(u => u.username === currentUser.username);
            if (myUser) {
                currentUser.role_mask = myUser.role_mask;
                currentUser.isAdmin = (myUser.role_mask & PERMISSION_BITS.ADMIN) !== 0;
                currentUser.isSuperadmin = (myUser.role_mask & PERMISSION_BITS.SUPERADMIN) !== 0;
                localStorage.setItem('user', JSON.stringify(currentUser));
                const tabs = document.querySelectorAll('.admin-tabs button');
                tabs.forEach(tab => {
                    if (tab.textContent.includes('IPs') || tab.textContent.includes('Configuración')) {
                        tab.style.display = currentUser.isSuperadmin ? 'inline-block' : 'none';
                    }
                });
            }
            displayUsers(data.users);
        } else {
            container.innerHTML = `<p class="error-message">${translations[currentLanguage].errorLoadingUsers}</p>`;
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="error-message">${translations[currentLanguage].connectionError}</p>`;
    }
}

function formatBytesHelper(bytes) {
    if (bytes === 0) return '0 Bytes';
    if (!bytes) return '--';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function displayUsers(users) {
    const container = document.getElementById('userList');
    if (!container) return;
    container.innerHTML = '';
    if (!users || users.length === 0) {
        container.innerHTML = `<p class="info-message">${translations[currentLanguage].noUsersFound}</p>`;
        return;
    }

    const canViewOthers = (currentUser.role_mask & PERMISSION_BITS.ADMIN) !== 0;
    const canManageLimits = (currentUser.role_mask & PERMISSION_BITS.MANAGE_USER_LIMITS) !== 0;
    const canChangeStatus = (currentUser.role_mask & PERMISSION_BITS.MANAGE_USERS_STATUS) !== 0;
    const canKick = (currentUser.role_mask & PERMISSION_BITS.KICK_USERS) !== 0;
    const canChangePassword = (currentUser.role_mask & PERMISSION_BITS.CHANGE_ANY_PASSWORD) !== 0;
    const canDelete = (currentUser.role_mask & PERMISSION_BITS.DELETE_USERS) !== 0;

    users.forEach(user => {
        const isSuperadminUser = (user.role_mask & PERMISSION_BITS.SUPERADMIN) !== 0 || user.username === 'admin';
        const isAdminUser = (user.role_mask & PERMISSION_BITS.ADMIN) !== 0;
        const card = document.createElement('div');
        card.className = 'user-card';
        card.style.borderLeft = user.status === 'banned' ? '4px solid var(--danger-color)' : (user.status === 'disabled' ? '4px solid gray' : '4px solid var(--success-color)');

        let dateStr = 'N/A';
        if (user.created_at) try { dateStr = new Date(user.created_at).toLocaleString(); } catch(e) {}
        const usedStr = formatBytesHelper(user.used_bytes || 0);
        const quotaStr = formatBytesHelper(user.effective_quota_bytes || user.quota_bytes || 0);
        const canManageThis = currentUser.isSuperadmin || (!isAdminUser && !isSuperadminUser);

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h3 style="margin-top:0; ${canViewOthers ? 'cursor:pointer;' : ''}" onclick="${canViewOthers ? `selectUser('${escapeHTML(user.username)}')` : ''}">${escapeHTML(user.username)}</h3>
                <div>
                    ${isSuperadminUser ? `<span class="admin-badge" style="background:var(--primary-color);color:white;padding:2px 6px;border-radius:4px;font-size:0.8rem;"><i class="fas fa-crown"></i> Superadmin</span>` : (isAdminUser ? `<span class="admin-badge" style="background:var(--primary-color);color:white;padding:2px 6px;border-radius:4px;font-size:0.8rem;">Admin</span>` : '')}
                    <span style="font-size:0.8rem; padding:2px 6px; border-radius:4px; background:${user.status === 'active' ? 'var(--success-color)' : (user.status === 'banned' ? 'var(--danger-color)' : 'gray')}; color:white;">${user.status.toUpperCase()}</span>
                </div>
            </div>
            <div style="font-size: 0.9rem; margin-bottom: 10px; ${canViewOthers ? 'cursor:pointer;' : ''}" onclick="${canViewOthers ? `selectUser('${escapeHTML(user.username)}')` : ''}">
                <p style="margin:2px 0;"><i class="fas fa-database"></i> Uso: ${usedStr} / ${quotaStr}</p>
                <p style="margin:2px 0;"><i class="fas fa-network-wired"></i> IP: ${user.last_ip || 'Desconocida'}</p>
                <p style="margin:2px 0; color:gray; font-size: 0.8rem;"><i class="fas fa-calendar"></i> Reg: ${dateStr}</p>
            </div>
            <div class="user-actions" style="display:flex; flex-wrap:wrap; gap:5px; margin-top:10px;">
                ${canManageLimits ? `<button onclick="event.stopPropagation(); openEditLimitsModal(${user.id}, '${escapeHTML(user.username)}', ${user.quota_bytes || null}, ${user.max_file_size_bytes || null}, ${user.bandwidth_kbps || null}, ${isAdminUser}, ${isSuperadminUser}, ${user.role_mask || 0})" class="table-btn btn-rename" title="Límites"><i class="fas fa-sliders-h"></i></button>` : ''}
                ${canChangeStatus && canManageThis ? `<button onclick="event.stopPropagation(); openChangeStatusModal(${user.id}, '${escapeHTML(user.username)}', '${user.status}')" class="table-btn btn-rename" title="Estado"><i class="fas fa-shield-alt"></i></button>` : ''}
                ${canKick && canManageThis ? `<button onclick="event.stopPropagation(); kickUser(${user.id}, '${escapeHTML(user.username)}')" class="table-btn btn-delete" style="background:#ff9800; color:white;" title="Kickear"><i class="fas fa-sign-out-alt"></i></button>` : ''}
                ${canChangePassword && !isSuperadminUser && (currentUser.isSuperadmin || !isAdminUser) ? `<button onclick="event.stopPropagation(); openPasswordModal('${escapeHTML(user.username)}')" class="table-btn btn-rename" title="Contraseña"><i class="fas fa-key"></i></button>` : ''}
                ${canDelete && user.username !== 'admin' ? `<button onclick="event.stopPropagation(); deleteUser('${escapeHTML(user.username)}')" class="table-btn btn-delete" title="Borrar"><i class="fas fa-trash"></i></button>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

function loadPermissionsFromMask(mask) {
    const checkboxes = document.querySelectorAll('#editLimitsModal .perm-checkbox');
    checkboxes.forEach(cb => {
        const bitId = cb.getAttribute('data-bit');
        if (bitId && permCheckboxMap[bitId]) {
            cb.checked = (mask & permCheckboxMap[bitId]) !== 0;
        }
    });
}

function getPermissionsFromCheckboxes() {
    let perm = 0;
    const checkboxes = document.querySelectorAll('#editLimitsModal .perm-checkbox:checked');
    checkboxes.forEach(cb => {
        const bitId = cb.getAttribute('data-bit');
        if (bitId && permCheckboxMap[bitId]) {
            perm |= permCheckboxMap[bitId];
        }
    });
    return perm;
}

function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.admin-tabs button').forEach(el => {
        el.classList.remove('primary');
        el.style.backgroundColor = 'var(--input-bg)';
        el.style.color = 'var(--text-primary)';
    });
    const tab = document.getElementById(tabId);
    if (tab) tab.style.display = 'block';
    const activeBtn = Array.from(document.querySelectorAll('.admin-tabs button')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(tabId));
    if (activeBtn) {
        activeBtn.classList.add('primary');
        activeBtn.style.backgroundColor = '';
        activeBtn.style.color = '';
    }
    if (tabId === 'usersTab') loadUsers();
    else if (tabId === 'ipsTab') loadIps();
    else if (tabId === 'settingsTab') loadGlobalSettings();
}

function refreshAdminData() {
    const filePanel = document.getElementById('filesPanel');
    if (filePanel && filePanel.style.display === 'block') loadUserFiles();
    else {
        const activeTab = document.querySelector('.admin-tabs button.primary');
        if (activeTab) {
            const match = activeTab.getAttribute('onclick').match(/switchAdminTab\('([^']+)'\)/);
            if (match) {
                if (match[1] === 'ipsTab') loadIps();
                else if (match[1] === 'settingsTab') loadGlobalSettings();
                else loadUsers();
            } else loadUsers();
        } else loadUsers();
    }
}

function formatBestSpaceUnit(bytes) {
    if (!bytes) return { val: '', unit: 'MB' };
    if (bytes >= 1024*1024*1024 && bytes % (1024*1024*1024) === 0) return { val: bytes / (1024*1024*1024), unit: 'GB' };
    if (bytes >= 1024*1024 && bytes % (1024*1024) === 0) return { val: bytes / (1024*1024), unit: 'MB' };
    if (bytes >= 1024*1024*1024) return { val: parseFloat((bytes / (1024*1024*1024)).toFixed(2)), unit: 'GB' };
    if (bytes >= 1024*1024) return { val: parseFloat((bytes / (1024*1024)).toFixed(2)), unit: 'MB' };
    return { val: parseFloat((bytes / 1024).toFixed(2)), unit: 'KB' };
}

function parseSpaceUnit(val, unit) {
    if (!val) return null;
    const v = parseFloat(val);
    if (unit === 'GB') return Math.round(v * 1024 * 1024 * 1024);
    if (unit === 'MB') return Math.round(v * 1024 * 1024);
    if (unit === 'KB') return Math.round(v * 1024);
    return null;
}

function formatBestSpeedUnit(kbps) {
    if (!kbps) return { val: '', unit: 'MB/s' };
    if (kbps >= 1024 && kbps % 1024 === 0) return { val: kbps / 1024, unit: 'MB/s' };
    if (kbps >= 1024) return { val: parseFloat((kbps / 1024).toFixed(2)), unit: 'MB/s' };
    return { val: kbps, unit: 'KB/s' };
}

function parseSpeedUnit(val, unit) {
    if (!val) return null;
    const v = parseFloat(val);
    if (unit === 'MB/s') return Math.round(v * 1024);
    if (unit === 'KB/s') return Math.round(v);
    return null;
}

function closeAdminModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

function openEditLimitsModal(id, username, quota, maxFile, bw, isAdmin, isSuperadmin, roleMask) {
    document.getElementById('limitsUsername').textContent = username;
    document.getElementById('editLimitsUserId').value = id;
    const qFmt = formatBestSpaceUnit(quota);
    document.getElementById('userQuota').value = qFmt.val;
    document.getElementById('userQuotaUnit').value = qFmt.unit;
    const mFmt = formatBestSpaceUnit(maxFile);
    document.getElementById('userMaxFileSize').value = mFmt.val;
    document.getElementById('userMaxFileSizeUnit').value = mFmt.unit;
    const bFmt = formatBestSpeedUnit(bw);
    document.getElementById('userBandwidth').value = bFmt.val;
    document.getElementById('userBandwidthUnit').value = bFmt.unit;
    loadPermissionsFromMask(roleMask || 0);
    document.getElementById('editLimitsModal').style.display = 'flex';
}

async function saveUserLimits() {
    const id = document.getElementById('editLimitsUserId').value;
    const quotaVal = document.getElementById('userQuota').value;
    const quotaUnit = document.getElementById('userQuotaUnit').value;
    const quota = parseSpaceUnit(quotaVal, quotaUnit);
    const maxFileVal = document.getElementById('userMaxFileSize').value;
    const maxFileUnit = document.getElementById('userMaxFileSizeUnit').value;
    const maxFile = parseSpaceUnit(maxFileVal, maxFileUnit);
    const bwVal = document.getElementById('userBandwidth').value;
    const bwUnit = document.getElementById('userBandwidthUnit').value;
    const bw = parseSpeedUnit(bwVal, bwUnit);

    let newMask = getPermissionsFromCheckboxes();
    newMask |= PERMISSION_BITS.LOGIN | PERMISSION_BITS.FILE_MANAGER;
    const isAdmin = (newMask & PERMISSION_BITS.ADMIN) !== 0;
    const isSuperadmin = (newMask & PERMISSION_BITS.SUPERADMIN) !== 0;

    try {
        const res = await fetch(`${API_URL}/admin/users/${id}/limits`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: currentUser.token,
                quota_bytes: quota,
                max_file_size_bytes: maxFile,
                bandwidth_kbps: bw,
                role_mask: newMask,
                is_admin: isAdmin,
                is_superadmin: isSuperadmin
            })
        });
        const data = await res.json();
        if (data.success) {
            closeAdminModal('editLimitsModal');
            loadUsers();
        } else alert(data.message);
    } catch (e) { alert('Error de conexión'); }
}

function openChangeStatusModal(id, username, currentStatus) {
    document.getElementById('statusUsername').textContent = username;
    document.getElementById('statusUserId').value = id;
    document.getElementById('userStatus').value = currentStatus;
    document.getElementById('banReason').value = '';
    toggleBanReason();
    document.getElementById('changeStatusModal').style.display = 'flex';
}

function toggleBanReason() {
    const status = document.getElementById('userStatus').value;
    const banReasonGroup = document.getElementById('banReasonGroup');
    if (banReasonGroup) banReasonGroup.style.display = status === 'banned' ? 'block' : 'none';
}

async function saveUserStatus() {
    const id = document.getElementById('statusUserId').value;
    const status = document.getElementById('userStatus').value;
    const reason = document.getElementById('banReason').value;
    if (!confirm(`¿Estás seguro de cambiar el estado a ${status}?`)) return;
    try {
        const res = await fetch(`${API_URL}/admin/users/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: currentUser.token, status, ban_reason: reason })
        });
        const data = await res.json();
        if (data.success) {
            closeAdminModal('changeStatusModal');
            loadUsers();
        } else alert(data.message);
    } catch (e) { alert('Error de conexión'); }
}

async function kickUser(id, username) {
    if (!confirm(`¿Forzar cierre de sesión de ${username}?`)) return;
    try {
        const res = await fetch(`${API_URL}/admin/users/${id}/kick`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: currentUser.token })
        });
        const data = await res.json();
        if (data.success) alert('Sesión invalidada.');
        else alert(data.message);
    } catch (e) { alert('Error de conexión'); }
}

async function loadIps() {
    const container = document.getElementById('ipsList');
    if (!container) return;
    container.innerHTML = '<div class="loader"></div>';
    try {
        const res = await fetch(`${API_URL}/admin/ips?token=${currentUser.token}`);
        const data = await res.json();
        if (data.success) {
            container.innerHTML = '';
            if (data.ips.length === 0) {
                container.innerHTML = '<p>No hay IPs baneadas.</p>';
                return;
            }
            data.ips.forEach(ip => {
                container.innerHTML += `
                    <div class="user-card" style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h3 style="margin:0; color:var(--danger-color);"><i class="fas fa-ban"></i> ${ip.ip_address}</h3>
                            <p style="margin:5px 0;">Motivo: ${ip.reason || 'Sin especificar'}</p>
                            <p style="font-size:0.8rem; color:gray; margin:0;">Baneado por ${ip.banner_name || 'Admin'} el ${new Date(ip.banned_at).toLocaleDateString()}</p>
                        </div>
                        <button class="action-btn" onclick="unbanIp('${ip.ip_address}')"><i class="fas fa-trash"></i> Desbanear</button>
                    </div>
                `;
            });
        }
    } catch (e) { container.innerHTML = '<p>Error de conexión</p>'; }
}

function openBanIpModal() {
    document.getElementById('banIpAddress').value = '';
    document.getElementById('banIpReason').value = '';
    document.getElementById('banIpModal').style.display = 'flex';
}

async function submitIpBan() {
    const ip = document.getElementById('banIpAddress').value;
    const reason = document.getElementById('banIpReason').value;
    if (!ip) return alert('Debes introducir una IP');
    try {
        const res = await fetch(`${API_URL}/admin/ips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: currentUser.token, ip_address: ip, reason })
        });
        const data = await res.json();
        if (data.success) {
            closeAdminModal('banIpModal');
            loadIps();
        } else alert(data.message);
    } catch (e) { alert('Error de conexión'); }
}

async function unbanIp(ip) {
    if (!confirm(`¿Desbanear IP ${ip}?`)) return;
    try {
        const res = await fetch(`${API_URL}/admin/ips/${ip}?token=${currentUser.token}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) loadIps();
        else alert(data.message);
    } catch (e) { alert('Error de conexión'); }
}

async function loadGlobalSettings() {
    const form = document.getElementById('globalSettingsForm');
    if (!form) return;
    form.innerHTML = '<div class="loader"></div>';
    try {
        const res = await fetch(`${API_URL}/admin/settings?token=${currentUser.token}`);
        const data = await res.json();
        if (data.success) {
            const s = data.settings;
            const qFmt = formatBestSpaceUnit(s.default_quota_bytes || 5368709120);
            const mFmt = formatBestSpaceUnit(s.default_max_file_size_bytes || 104857600);
            const bFmt = formatBestSpeedUnit(s.default_bandwidth_kbps || 0);
            form.innerHTML = `
                <div class="form-group">
                    <label>Cuota por defecto:</label>
                    <div style="display:flex; gap:10px;">
                        <input type="number" id="setting_default_quota" value="${qFmt.val}" style="flex:1;">
                        <select id="setting_default_quota_unit" style="width:110px;">
                            <option value="KB" ${qFmt.unit === 'KB' ? 'selected' : ''}>KB</option>
                            <option value="MB" ${qFmt.unit === 'MB' ? 'selected' : ''}>MB</option>
                            <option value="GB" ${qFmt.unit === 'GB' ? 'selected' : ''}>GB</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Tamaño máx. archivo:</label>
                    <div style="display:flex; gap:10px;">
                        <input type="number" id="setting_default_max_file_size" value="${mFmt.val}" style="flex:1;">
                        <select id="setting_default_max_file_size_unit" style="width:110px;">
                            <option value="KB" ${mFmt.unit === 'KB' ? 'selected' : ''}>KB</option>
                            <option value="MB" ${mFmt.unit === 'MB' ? 'selected' : ''}>MB</option>
                            <option value="GB" ${mFmt.unit === 'GB' ? 'selected' : ''}>GB</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Ancho de banda por defecto:</label>
                    <div style="display:flex; gap:10px;">
                        <input type="number" step="0.1" id="setting_default_bandwidth" value="${bFmt.val}" style="flex:1;">
                        <select id="setting_default_bandwidth_unit" style="width:130px;">
                            <option value="KB/s" ${bFmt.unit === 'KB/s' ? 'selected' : ''}>KB/s</option>
                            <option value="MB/s" ${bFmt.unit === 'MB/s' ? 'selected' : ''}>MB/s</option>
                        </select>
                    </div>
                </div>
            `;
        }
    } catch (e) { form.innerHTML = '<p>Error de conexión</p>'; }
}

async function saveGlobalSettings() {
    const qVal = document.getElementById('setting_default_quota').value;
    const qUnit = document.getElementById('setting_default_quota_unit').value;
    const q = parseSpaceUnit(qVal, qUnit) || 5368709120;
    const mVal = document.getElementById('setting_default_max_file_size').value;
    const mUnit = document.getElementById('setting_default_max_file_size_unit').value;
    const m = parseSpaceUnit(mVal, mUnit) || 104857600;
    const bVal = document.getElementById('setting_default_bandwidth').value;
    const bUnit = document.getElementById('setting_default_bandwidth_unit').value;
    const b = parseSpeedUnit(bVal, bUnit) || 0;
    try {
        const res = await fetch(`${API_URL}/admin/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: currentUser.token,
                settings: {
                    default_quota_bytes: q,
                    default_max_file_size_bytes: m,
                    default_bandwidth_kbps: b
                }
            })
        });
        const data = await res.json();
        if (data.success) alert('Ajustes actualizados');
        else alert(data.message);
    } catch (e) { alert('Error de conexión'); }
}

function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function selectUser(username) {
    if (!(currentUser.role_mask & PERMISSION_BITS.ADMIN)) {
        alert('No tienes permiso para ver archivos de otros usuarios.');
        return;
    }
    selectedUsername = username;
    currentPath = '';
    const userList = document.getElementById('userList');
    const filesPanel = document.getElementById('filesPanel');
    if (userList) userList.style.display = 'none';
    if (filesPanel) filesPanel.style.display = 'block';
    const title = document.getElementById('currentUserTitle');
    if (title) title.innerHTML = `<i class="fas fa-user"></i> ${translations[currentLanguage].userFilesTitle.replace('{{username}}', username)}`;
    loadUserFiles();
}

function backToUsers() {
    selectedUsername = null;
    const userList = document.getElementById('userList');
    const filesPanel = document.getElementById('filesPanel');
    if (userList) userList.style.display = 'grid';
    if (filesPanel) filesPanel.style.display = 'none';
}

async function loadUserFiles() {
    if (!selectedUsername) return;
    const fileListDiv = document.getElementById('fileList');
    if (!fileListDiv) return;
    fileListDiv.innerHTML = `<div class="loader"></div><p>${translations[currentLanguage].loadingFiles}</p>`;
    try {
        let url = `${API_URL}/admin/users/${selectedUsername}/files?token=${currentUser.token}`;
        if (currentPath) url += `&path=${encodeURIComponent(currentPath)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
            displayFiles(data.files);
            updatePathBar(data.currentPath);
        } else {
            fileListDiv.innerHTML = `<p class="error-message">${translations[currentLanguage].errorLoadingFiles}</p>`;
        }
    } catch (err) {
        fileListDiv.innerHTML = `<p class="error-message">${translations[currentLanguage].connectionError}</p>`;
    }
}

function updatePathBar(path) {
    const bar = document.getElementById('pathBar');
    if (!bar) return;
    bar.innerHTML = `<i class="fas fa-folder-open"></i> ${translations[currentLanguage].path}: /${path}${path ? ` <button onclick="goToParent()" class="path-btn"><i class="fas fa-level-up-alt"></i> ${translations[currentLanguage].up}</button>` : ''}`;
}

function goToParent() {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    currentPath = parts.join('/');
    loadUserFiles();
}

function openFolder(folderPath) {
    currentPath = folderPath;
    loadUserFiles();
}

function displayFiles(files) {
    const container = document.getElementById('fileList');
    if (!container) return;
    if (files.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-folder-open"></i><p>${translations[currentLanguage].emptyFolder}</p></div>`;
        return;
    }
    let html = `<table class="file-table"><thead><tr><th>${translations[currentLanguage].name}</th><th>${translations[currentLanguage].size}</th><th>${translations[currentLanguage].modified}</th><th>${translations[currentLanguage].actions}</th></tr></thead><tbody>`;
    files.forEach(item => {
        const isDir = item.isDirectory;
        const date = new Date(item.mtime).toLocaleString(currentLanguage === 'es' ? 'es-ES' : 'en-US');
        const icon = isDir ? 'fa-folder' : 'fa-file';
        const safeName = escapeHTML(item.name);
        const safePath = item.path.replace(/'/g, "\\'");
        html += `<tr>
            <td><i class="fas ${icon}" style="margin-right:12px; color:${isDir ? '#ffd166' : '#4361ee'}"></i> ${safeName}</td>
            <td><span class="badge">${item.sizeFormatted || '--'}</span></td>
            <td>${date}</td>
            <td><div class="action-cell">`;
        if (isDir) {
            html += `<button onclick="openFolder('${safePath}')" class="table-btn btn-open"><i class="fas fa-folder-open"></i> ${translations[currentLanguage].open}</button>`;
        } else {
            html += `<button onclick="previewFile('${safePath}')" class="table-btn btn-preview"><i class="fas fa-eye"></i> ${translations[currentLanguage].preview}</button>
                     <button onclick="downloadFile('${safePath}')" class="table-btn btn-download"><i class="fas fa-download"></i> ${translations[currentLanguage].download}</button>`;
        }
        html += `</div></td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function previewFile(filePath) {
    window.open(`${API_URL}/admin/preview/${selectedUsername}?path=${encodeURIComponent(filePath)}&token=${currentUser.token}`, '_blank');
}

function downloadFile(filePath) {
    window.open(`${API_URL}/admin/download/${selectedUsername}?path=${encodeURIComponent(filePath)}&token=${currentUser.token}`, '_blank');
}

async function deleteUser(username) {
    if (!confirm(translations[currentLanguage].confirmDeleteUser.replace('{{username}}', username))) return;
    try {
        const res = await fetch(`${API_URL}/admin/users/${username}?token=${currentUser.token}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            alert(translations[currentLanguage].userDeleted);
            loadUsers();
            if (selectedUsername === username) backToUsers();
        } else alert('Error: ' + data.message);
    } catch (err) { alert('Error de conexión'); }
}

let passwordTarget = null;
function openPasswordModal(username) {
    passwordTarget = username;
    const newPassInput = document.getElementById('newPassword');
    if (newPassInput) newPassInput.value = '';
    const modal = document.getElementById('passwordModal');
    if (modal) modal.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const cancelPassword = document.getElementById('cancelPassword');
    if (cancelPassword) cancelPassword.addEventListener('click', () => {
        const modal = document.getElementById('passwordModal');
        if (modal) modal.style.display = 'none';
    });
    const savePassword = document.getElementById('savePassword');
    if (savePassword) savePassword.addEventListener('click', async () => {
        const newPassInput = document.getElementById('newPassword');
        const newPassword = newPassInput ? newPassInput.value.trim() : '';
        if (newPassword.length < 6) {
            alert(translations[currentLanguage].minPasswordLength);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/admin/users/${passwordTarget}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: currentUser.token, newPassword })
            });
            const data = await res.json();
            if (data.success) {
                alert(translations[currentLanguage].passwordUpdated);
                const modal = document.getElementById('passwordModal');
                if (modal) modal.style.display = 'none';
            } else alert('Error: ' + data.message);
        } catch (err) { alert('Error de conexión'); }
    });
});

async function logout() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.token) {
                await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: user.token })
                });
            }
        } catch(e) {}
    }
    localStorage.removeItem('user');
    sessionStorage.removeItem('adminAccessGranted');
    window.location.href = 'login.html';
}

// ======================== Theme Editor (completo) ========================
const themePresets = {
    default: { primary: '#4361ee', secondary: '#4cc9f0', background: '#f8fafc', text: '#0f172a', accent: '#7209b7', success: '#06d6a0', danger: '#ef476f', warning: '#f59e0b' },
    ocean: { primary: '#0077b6', secondary: '#00b4d8', background: '#f0f9ff', text: '#0b2545', accent: '#0096c7', success: '#06d6a0', danger: '#ef476f', warning: '#f59e0b' },
    forest: { primary: '#2d6a4f', secondary: '#52b788', background: '#f0fdf4', text: '#052e16', accent: '#40916c', success: '#22c55e', danger: '#ef476f', warning: '#f59e0b' },
    sunset: { primary: '#ff6b35', secondary: '#ffb703', background: '#fff7ed', text: '#431407', accent: '#f72585', success: '#06d6a0', danger: '#ef4444', warning: '#f59e0b' },
    midnight: { primary: '#6366f1', secondary: '#22d3ee', background: '#0b1020', text: '#e2e8f0', accent: '#a855f7', success: '#22c55e', danger: '#fb7185', warning: '#fbbf24' },
    dark: { primary: '#4f46e5', secondary: '#22d3ee', background: '#0f172a', text: '#e2e8f0', accent: '#9333ea', success: '#22c55e', danger: '#fb7185', warning: '#fbbf24' },
    candy: { primary: '#fb7185', secondary: '#f472b6', background: '#fff1f2', text: '#3b0a2a', accent: '#a78bfa', success: '#2dd4bf', danger: '#ef4444', warning: '#fbbf24' }
};

function openThemeEditorModal() {
    const modal = document.getElementById('themeEditorModal');
    if (!modal) return;
    const saved = localStorage.getItem('userTheme');
    const theme = saved ? JSON.parse(saved) : themePresets.default;
    document.getElementById('primaryColorPicker').value = theme.primary;
    document.getElementById('secondaryColorPicker').value = theme.secondary;
    document.getElementById('backgroundColorPicker').value = theme.background;
    document.getElementById('textColorPicker').value = theme.text;
    document.getElementById('accentColorPicker').value = theme.accent;
    document.getElementById('successColorPicker').value = theme.success;
    document.getElementById('dangerColorPicker').value = theme.danger;
    document.getElementById('warningColorPicker').value = theme.warning;
    updateAdminThemePreview();
    modal.style.display = 'block';
}

function closeThemeEditor() {
    const modal = document.getElementById('themeEditorModal');
    if (modal) modal.style.display = 'none';
}

function updateAdminThemePreview() {
    const theme = {
        primary: document.getElementById('primaryColorPicker').value,
        secondary: document.getElementById('secondaryColorPicker').value,
        background: document.getElementById('backgroundColorPicker').value,
        text: document.getElementById('textColorPicker').value,
        accent: document.getElementById('accentColorPicker').value,
        success: document.getElementById('successColorPicker').value,
        danger: document.getElementById('dangerColorPicker').value,
        warning: document.getElementById('warningColorPicker').value
    };
    const preview = document.getElementById('themePreview');
    if (!preview) return;
    const isDark = isColorDark(theme.background);
    const header = preview.querySelector('.preview-header');
    if (header) header.style.background = `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`;
    const btn = preview.querySelector('.preview-btn');
    if (btn) btn.style.background = `linear-gradient(135deg, ${theme.primary}, ${adjustColor(theme.primary, -20)})`;
    const input = preview.querySelector('.preview-input');
    if (input) {
        input.style.borderColor = theme.secondary;
        input.style.background = isDark ? adjustColor(theme.background, 22) : '#fff';
        input.style.color = theme.text;
    }
    const card = preview.querySelector('.preview-card');
    if (card) {
        card.style.background = isDark ? adjustColor(theme.background, 30) : '#fff';
        card.style.borderColor = theme.secondary;
        card.style.color = theme.text;
    }
}

function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#',''),16);
    const r = Math.min(255, Math.max(0, (num>>16)+amount));
    const g = Math.min(255, Math.max(0, ((num>>8)&0x00FF)+amount));
    const b = Math.min(255, Math.max(0, (num&0x0000FF)+amount));
    return `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`;
}

function applyPreset(presetName) {
    const p = themePresets[presetName];
    if (!p) return;
    document.getElementById('primaryColorPicker').value = p.primary;
    document.getElementById('secondaryColorPicker').value = p.secondary;
    document.getElementById('backgroundColorPicker').value = p.background;
    document.getElementById('textColorPicker').value = p.text;
    document.getElementById('accentColorPicker').value = p.accent;
    document.getElementById('successColorPicker').value = p.success;
    document.getElementById('dangerColorPicker').value = p.danger;
    document.getElementById('warningColorPicker').value = p.warning;
    updateAdminThemePreview();
}

function saveTheme() {
    const theme = {
        primary: document.getElementById('primaryColorPicker').value,
        secondary: document.getElementById('secondaryColorPicker').value,
        background: document.getElementById('backgroundColorPicker').value,
        text: document.getElementById('textColorPicker').value,
        accent: document.getElementById('accentColorPicker').value,
        success: document.getElementById('successColorPicker').value,
        danger: document.getElementById('dangerColorPicker').value,
        warning: document.getElementById('warningColorPicker').value
    };
    localStorage.setItem('userTheme', JSON.stringify(theme));
    applyAdminThemeToCSS(theme);
    closeThemeEditor();
    alert(translations[currentLanguage].themeSaved);
}

function resetTheme() {
    const def = themePresets.default;
    document.getElementById('primaryColorPicker').value = def.primary;
    document.getElementById('secondaryColorPicker').value = def.secondary;
    document.getElementById('backgroundColorPicker').value = def.background;
    document.getElementById('textColorPicker').value = def.text;
    document.getElementById('accentColorPicker').value = def.accent;
    document.getElementById('successColorPicker').value = def.success;
    document.getElementById('dangerColorPicker').value = def.danger;
    document.getElementById('warningColorPicker').value = def.warning;
    localStorage.removeItem('userTheme');
    applyAdminThemeToCSS(def);
    updateAdminThemePreview();
    alert(translations[currentLanguage].themeReset);
}

function applyAdminThemeToCSS(theme) {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-light', adjustColor(theme.primary, 40));
    root.style.setProperty('--primary-dark', adjustColor(theme.primary, -20));
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--success', theme.success);
    root.style.setProperty('--danger', theme.danger);
    root.style.setProperty('--warning', theme.warning);
    const isDark = isColorDark(theme.background);
    root.style.setProperty('--bg-main', theme.background);
    root.style.setProperty('--bg-gradient-start', theme.background);
    root.style.setProperty('--bg-gradient-end', isDark ? theme.accent : adjustColor(theme.primary, 160));
    root.style.setProperty('--text-primary', theme.text);
    root.style.setProperty('--text-secondary', isDark ? adjustColor(theme.text, -60) : adjustColor(theme.text, 40));
    root.style.setProperty('--text-muted', isDark ? adjustColor(theme.text, -110) : adjustColor(theme.text, 80));
    root.style.setProperty('--container-bg', isDark ? 'rgba(15,23,42,0.92)' : 'rgba(248,250,252,0.96)');
    root.style.setProperty('--card-bg', isDark ? '#111827' : '#ffffff');
    root.style.setProperty('--input-bg', isDark ? '#0b1220' : '#ffffff');
    root.style.setProperty('--filter-bg', isDark ? '#0b1220' : '#f1f5f9');
    root.style.setProperty('--border-color', isDark ? '#334155' : '#e2e8f0');
    root.style.setProperty('--input-border', isDark ? '#475569' : '#cbd5e1');
    root.style.setProperty('--table-row-hover', isDark ? '#1f2937' : '#f8fafc');
}

function isColorDark(hex) {
    const c = hex.replace('#','');
    const r = parseInt(c.substr(0,2),16);
    const g = parseInt(c.substr(2,2),16);
    const b = parseInt(c.substr(4,2),16);
    return (r*299 + g*587 + b*114)/1000 < 128;
}

// Inicializar listeners del editor de temas después de cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    const colorPickers = ['primaryColorPicker', 'secondaryColorPicker', 'backgroundColorPicker', 'textColorPicker', 'accentColorPicker', 'successColorPicker', 'dangerColorPicker', 'warningColorPicker'];
    colorPickers.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateAdminThemePreview);
    });
    const savedTheme = localStorage.getItem('userTheme');
    if (savedTheme) applyAdminThemeToCSS(JSON.parse(savedTheme));
    else applyAdminThemeToCSS(themePresets.default);
});