/* =====================================================
   SportClub - JavaScript general
   Objetivo: agregar retroalimentación visual simple sin autenticación real.
   Nota académica: este proyecto es estático; por eso no se validan usuarios
   contra una base de datos ni servidor.
   ===================================================== */

// Redirección del login al dashboard de usuario.
const loginForm = document.querySelector('#loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    window.location.href = 'dashboard-usuario.html';
  });
}

// Mensaje visual de registro preparado para retroalimentación de usuario.
const registerForm = document.querySelector('#registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('#registerMessage').textContent = 'Usuario registrado correctamente.';
    document.querySelector('#registerMessage').className = 'message success';
  });
}

// Recuperación de contraseña: muestra mensaje integrado, no usa alert().
const recoveryForm = document.querySelector('#recoveryForm');
if (recoveryForm) {
  recoveryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('#recoveryMessage').textContent = 'Se ha enviado un enlace de recuperación al correo ingresado.';
    document.querySelector('#recoveryMessage').className = 'message success';
  });
}
