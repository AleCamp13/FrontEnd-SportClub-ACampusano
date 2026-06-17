# Uso de Inteligencia Artificial en SportClub Evaluacion 2

## Herramienta utilizada

Se utilizo ChatGPT como apoyo para transformar el proyecto SportClub desde una version estatica a una version Front End conectada a una API.

## Que se solicito

Se solicito adaptar la carpeta `Eva 1` con las mejoras realizadas previamente en `Eva 3`, para cumplir con la evaluacion de desarrollo FrontEnd con API.

## Cambios realizados

- Fusion de las mejoras de `Eva 3` dentro de `Eva 1`.
- Implementacion de consumo de API con `fetch()`.
- Login conectado a `/api/auth/login`.
- Registro conectado a `/api/auth/register`.
- Redireccion segun rol.
- CRUD de usuarios para administrador conectado a `/api/users`.
- Modulo de perfil conectado a `/api/auth/me`.
- Cambio de contrasena conectado a `/api/auth/me/password`.
- Manejo de token JWT con `localStorage`.
- Validaciones visuales en formularios sin uso de `alert()`.
- Mensajes de error y exito en pantalla.
- Tabla dinamica de usuarios con botones de editar y eliminar.
- Badges visuales para roles `user`, `coach` y `admin`.

## Archivos principales modificados

- `js/script.js`
- `css/api.css`
- `pages/login.html`
- `pages/registro.html`
- `pages/recuperar.html`
- `pages/dashboard-admin.html`
- `pages/dashboard-usuario.html`
- `pages/dashboard-coach.html`
- `pages/perfil.html`
- `README.md`

## Observacion tecnica

El backend no fue modificado. El frontend queda preparado para trabajar con la API local ubicada en `http://localhost:3000/api`.
