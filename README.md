# SportClub - Evaluacion 2 Front End con API

Aplicacion web de SportClub evolucionada desde la version estatica inicial a una version conectada a backend mediante `fetch()`, siguiendo la pauta de Desarrollo FrontEnd con API.

## Funcionalidades implementadas

- Login real con `POST /api/auth/login`.
- Registro publico de usuarios con rol `user` usando `POST /api/auth/register`.
- Guardado de token JWT en `localStorage`.
- Redireccion segun rol:
  - `user` -> `dashboard-usuario.html`
  - `coach` -> `dashboard-coach.html`
  - `admin` -> `dashboard-admin.html`
- Proteccion basica de vistas por rol desde el frontend.
- CRUD de usuarios para administrador:
  - `GET /api/users`
  - `GET /api/users/:id`
  - `POST /api/users`
  - `PUT /api/users/:id`
  - `DELETE /api/users/:id`
- Perfil de usuario logueado:
  - `GET /api/auth/me`
  - `PUT /api/auth/me`
  - `PUT /api/auth/me/password`
- Validaciones visuales sin `alert()`:
  - campos obligatorios
  - formato de email
  - contrasena minima de 8 caracteres
  - confirmacion de contrasena
  - mensajes bajo inputs y bordes rojos
- Tabla de usuarios con ID, nombre completo, email, rol, fecha de registro y acciones.
- Roles mostrados como badges.

## Estructura

```text
SportClub/
  assets/img/
  css/
    api.css
    dashboard-admin.css
    dashboard-coach.css
    dashboard-user.css
    login.css
    style.css
  js/
    script.js
  pages/
    dashboard-admin.html
    dashboard-coach.html
    dashboard-usuario.html
    login.html
    perfil.html
    recuperar.html
    registro.html
  index.html
```

## Backend requerido

Esta version espera que la API local este levantada en:

```text
http://localhost:3000/api
```

El backend de apoyo esta en:

```text
../FrontEnd-Backend-ClubDeportivo
```

Comandos sugeridos desde la carpeta del backend:

```bash
npm install
npm run dev
```

Usuarios semilla documentados por el backend:

```text
usuario1@demo.cl / 12345678
coach1@demo.cl / 12345678
admin1@demo.cl / 12345678
```

