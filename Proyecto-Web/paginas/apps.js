/**
 * APPS.JS - Menú de Selección de Aplicaciones
 * Maneja la redirección a los distintos módulos del sistema
 * y aplica las restricciones iniciales de acceso.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Validar sesión
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = 'login.html';
        return;
    }

    let user;
    try {
        user = JSON.parse(userStr);
        if (!user || !user.token || Date.now() > user.expires) {
            logout();
            return;
        }
    } catch (e) {
        logout();
        return;
    }

    // Mostrar nombre del usuario
    document.getElementById('userNameDisplay').textContent = user.username;

    // Mostrar Admin Card solo si es administrador
    if (user.isAdmin) {
        document.getElementById('adminCard').style.display = 'flex';
    }

    // Manejar clics en las tarjetas
    document.getElementById('fileManagerCard').addEventListener('click', () => {
        window.location.href = 'gestorarchivos.html';
    });

    document.getElementById('adminCard').addEventListener('click', () => {
        // Establecer token en sessionStorage para permitir el acceso directo a admin.html
        sessionStorage.setItem('adminAccessGranted', 'true');
        window.location.href = 'admin.html';
    });
});

async function logout() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                await fetch(`/api/logout`, {
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
    sessionStorage.removeItem('adminAccessGranted');
    window.location.href = 'login.html';
}
