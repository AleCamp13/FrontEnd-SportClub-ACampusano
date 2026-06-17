/* =====================================================
   SportClub - Evaluacion 2 con consumo de API
   Frontend conectado al backend local mediante fetch().
   ===================================================== */

const API_BASE_URL = localStorage.getItem('sportclub_api_url') || 'http://localhost:3000/api';
const API_TIMEOUT_MS = 8000;

const ROLE_ROUTES = {
  user: 'dashboard-usuario.html',
  coach: 'dashboard-coach.html',
  admin: 'dashboard-admin.html'
};

const CLASS_CATALOG = [
  {
    id: 'yoga',
    name: 'Yoga',
    day: 'Lunes',
    dayShort: 'Lun',
    dayNumber: 15,
    dayIndex: 0,
    time: '18:00',
    coach: 'Ana',
    room: 'Sala 2',
    durationMinutes: 50,
    calories: 420
  },
  {
    id: 'spinning',
    name: 'Spinning',
    day: 'Martes',
    dayShort: 'Mar',
    dayNumber: 16,
    dayIndex: 1,
    time: '07:00',
    coach: 'Carlos',
    room: 'Sala 1',
    durationMinutes: 45,
    calories: 520
  },
  {
    id: 'funcional',
    name: 'Entrenamiento Funcional',
    shortName: 'Funcional',
    day: 'Miercoles',
    dayShort: 'Mie',
    dayNumber: 17,
    dayIndex: 2,
    time: '19:00',
    coach: 'Javier',
    room: 'Sala 3',
    durationMinutes: 55,
    calories: 480
  }
];

const state = {
  users: [],
  deleteUserId: null
};

document.addEventListener('DOMContentLoaded', async () => {
  setupLogout();
  setupLoginForm();
  setupRegisterForm();
  setupRecoveryForm();
  const guardedUser = await setupRoleGuard();

  if (document.body.dataset.page === 'admin') {
    setupAdminPage();
  }

  if (document.body.dataset.page === 'profile') {
    setupProfilePage();
  }

  if (document.body.dataset.page === 'user-dashboard') {
    setupUserDashboard(guardedUser);
  }
});

function getToken() {
  return localStorage.getItem('sportclub_token');
}

function saveSession(data) {
  localStorage.setItem('sportclub_token', data.token);
  localStorage.setItem('sportclub_user', JSON.stringify(data.user));
}

function clearSession() {
  localStorage.removeItem('sportclub_token');
  localStorage.removeItem('sportclub_user');
}

async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (!options.skipAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || API_TIMEOUT_MS);

  const requestOptions = {
    method: options.method || 'GET',
    headers,
    signal: controller.signal
  };

  if (options.body !== undefined) {
    requestOptions.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, requestOptions);
  } catch (error) {
    const isTimeout = error.name === 'AbortError';
    throw {
      message: isTimeout
        ? 'La API no respondio a tiempo. Revisa que el backend este encendido en http://localhost:3000.'
        : 'No se pudo conectar con la API. Revisa que el backend este activo en http://localhost:3000.',
      errors: {}
    };
  } finally {
    clearTimeout(timeoutId);
  }

  const result = await response.json().catch(() => ({
    ok: false,
    message: 'La API no respondio con JSON valido.'
  }));

  if (!response.ok || result.ok === false) {
    if (response.status === 401 && !options.skipRedirect) {
      clearSession();
    }

    throw {
      message: result.message || 'Ocurrio un error al comunicarse con la API.',
      errors: result.errors || {}
    };
  }

  return result;
}

function setupLogout() {
  document.querySelectorAll('.js-logout').forEach((link) => {
    link.addEventListener('click', () => clearSession());
  });
}

async function setupRoleGuard() {
  const requiredRole = document.body.dataset.requiredRole;
  if (!requiredRole) return null;

  if (document.body.dataset.page === 'user-dashboard') {
    return await getAuthenticatedUser({ allowStoredFallback: true }) || getFallbackUser();
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }

  if (requiredRole !== 'any' && user.role !== requiredRole) {
    window.location.href = ROLE_ROUTES[user.role] || 'login.html';
    return null;
  }

  return user;
}

async function getAuthenticatedUser(options = {}) {
  if (!getToken()) {
    return options.allowStoredFallback ? getStoredUser() : null;
  }

  try {
    const result = await apiFetch('/auth/me', { skipRedirect: true });
    localStorage.setItem('sportclub_user', JSON.stringify(result.data));
    return result.data;
  } catch (error) {
    if (options.allowStoredFallback) {
      return getStoredUser();
    }
    clearSession();
    return null;
  }
}

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem('sportclub_user');
    const user = JSON.parse(rawUser || 'null');
    return user && typeof user === 'object' ? user : null;
  } catch (error) {
    return null;
  }
}

function getFallbackUser() {
  return {
    id: 'local-user',
    full_name: 'Usuario SportClub',
    email: 'usuario@sportclub.cl',
    role: 'user',
    birth_date: null,
    metadata: {
      sports: []
    }
  };
}

function setupLoginForm() {
  const form = document.querySelector('#loginForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormErrors(form);
    hideMessage('loginMessage');

    const payload = {
      email: getFieldValue(form, 'email').toLowerCase(),
      password: getFieldValue(form, 'password')
    };

    let isValid = true;
    if (!payload.email) {
      setFieldError(form, 'email', 'El email es obligatorio.');
      isValid = false;
    } else if (!isEmail(payload.email)) {
      setFieldError(form, 'email', 'Email invalido.');
      isValid = false;
    }

    if (!payload.password) {
      setFieldError(form, 'password', 'La contrasena es obligatoria.');
      isValid = false;
    }

    if (!isValid) return;

    setButtonLoading(form, true, 'Ingresando...');
    try {
      const result = await apiFetch('/auth/login', {
        method: 'POST',
        body: payload,
        skipAuth: true
      });

      saveSession(result.data);
      window.location.href = ROLE_ROUTES[result.data.user.role] || 'dashboard-usuario.html';
    } catch (error) {
      showMessage('loginMessage', error.message, 'error');
      applyApiErrors(form, error.errors);
    } finally {
      setButtonLoading(form, false);
    }
  });
}

function setupRegisterForm() {
  const form = document.querySelector('#registerForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormErrors(form);
    hideMessage('registerMessage');

    const payload = buildUserPayload(form, { includeRole: false, requirePassword: true });
    const confirmPassword = getFieldValue(form, 'confirm_password');
    const isValid = validateUserForm(form, payload, {
      requirePassword: true,
      confirmPassword
    });

    if (!isValid) return;

    setButtonLoading(form, true, 'Registrando...');
    try {
      const result = await apiFetch('/auth/register', {
        method: 'POST',
        body: payload,
        skipAuth: true
      });

      localStorage.setItem('sportclub_user', JSON.stringify(result.data));
      showMessage('registerMessage', 'Usuario registrado correctamente. Ahora puedes iniciar sesion.', 'success');
      form.reset();
    } catch (error) {
      showMessage('registerMessage', error.message, 'error');
      applyApiErrors(form, error.errors);
    } finally {
      setButtonLoading(form, false);
    }
  });
}

function setupRecoveryForm() {
  const form = document.querySelector('#recoveryForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearFormErrors(form);

    const email = getFieldValue(form, 'email').toLowerCase();
    if (!email) {
      setFieldError(form, 'email', 'El email es obligatorio.');
      return;
    }

    if (!isEmail(email)) {
      setFieldError(form, 'email', 'Email invalido.');
      return;
    }

    showMessage('recoveryMessage', 'Si el correo existe, recibiras instrucciones para recuperar tu contrasena.', 'success');
  });
}

async function setupAdminPage() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'admin') return;

  fillCurrentUserLabels(user);
  setupAdminUserForm();
  setupUsersTableEvents();
  setupDeleteModal();
  await loadUsers();
}

async function setupUserDashboard(guardedUser = null) {
  const user = guardedUser || await getAuthenticatedUser();
  if (!user) return;

  renderDashboardUser(user);
  setupReservationButtons(user);
  setupReservationList(user);
  renderUserDashboardState(user);
}

function renderDashboardUser(user) {
  const name = capitalizeName(user.full_name || 'Usuario');
  const sport = user.metadata?.sports?.[0]?.name || 'tu proxima clase';

  setText('welcomeName', `Bienvenido, ${name}`);
  setText('favoriteActivity', `Tu actividad favorita: ${capitalizeName(sport)}.`);
  setText('dashboardProfileName', name);
  setText('dashboardProfileEmail', String(user.email || '').toLowerCase());
  setText('dashboardProfileBirth', formatDate(user.birth_date));
  setText('dashboardProfileSport', capitalizeName(sport));
}

function setupReservationButtons(user) {
  document.querySelectorAll('.js-reserve-class').forEach((button) => {
    button.addEventListener('click', () => {
      const classId = button.dataset.classId;
      const added = addReservation(user, classId);
      const classInfo = getClassById(classId);

      if (added) {
        showDashboardNotice(`Reserva confirmada: ${classInfo.name} el ${classInfo.day} a las ${classInfo.time}.`, 'success');
      } else {
        showDashboardNotice(`Ya tienes reservada la clase ${classInfo.name}.`, 'info');
      }

      renderUserDashboardState(user);
      document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function setupReservationList(user) {
  document.getElementById('reservationList')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cancel-reservation]');
    if (!button) return;

    const classInfo = getClassById(button.dataset.cancelReservation);
    removeReservation(user, classInfo.id);
    showDashboardNotice(`Reserva cancelada: ${classInfo.name}.`, 'info');
    renderUserDashboardState(user);
  });
}

function renderUserDashboardState(user) {
  const reservations = getReservations(user)
    .map(getClassById)
    .filter(Boolean)
    .sort((a, b) => a.dayIndex - b.dayIndex);

  renderReservationList(reservations);
  renderActivitySummary(reservations);
  renderCalendar(reservations);
  renderClassButtonStates(reservations);
  renderNextClass(reservations);
}

function getReservationKey(user) {
  return `sportclub_reservations_${user.id || user.email || 'guest'}`;
}

function getReservations(user) {
  try {
    const raw = localStorage.getItem(getReservationKey(user));
    const values = JSON.parse(raw || '[]');
    return Array.isArray(values) ? values : [];
  } catch (error) {
    return [];
  }
}

function saveReservations(user, reservations) {
  localStorage.setItem(getReservationKey(user), JSON.stringify(reservations));
}

function addReservation(user, classId) {
  const reservations = getReservations(user);
  if (reservations.includes(classId)) return false;

  saveReservations(user, [...reservations, classId]);
  return true;
}

function removeReservation(user, classId) {
  saveReservations(user, getReservations(user).filter((id) => id !== classId));
}

function getClassById(classId) {
  return CLASS_CATALOG.find((item) => item.id === classId);
}

function renderReservationList(reservations) {
  const list = document.getElementById('reservationList');
  if (!list) return;

  setText('reservationCounter', String(reservations.length));

  if (!reservations.length) {
    list.innerHTML = '<div class="empty-state"><i class="bi bi-calendar-plus"></i><p>Elige una clase para crear tu primera reserva.</p></div>';
    return;
  }

  list.innerHTML = reservations.map((item) => `
    <div class="list-group-item reservation-item px-0 d-flex justify-content-between align-items-center gap-3">
      <span>
        <b>${escapeHtml(item.name)}</b><br>
        ${item.day} · ${item.time} · Coach ${item.coach}
      </span>
      <span class="d-flex align-items-center gap-2">
        <span class="badge-soft">Confirmada</span>
        <button class="btn btn-sm btn-outline-danger fw-bold" type="button" data-cancel-reservation="${item.id}">
          Cancelar
        </button>
      </span>
    </div>
  `).join('');
}

function renderActivitySummary(reservations) {
  const total = reservations.length;
  const calories = reservations.reduce((sum, item) => sum + item.calories, 0);
  const minutes = reservations.reduce((sum, item) => sum + item.durationMinutes, 0);
  const progress = Math.min(total * 33, 100);
  const reservedDays = new Set(reservations.map((item) => item.dayIndex));
  const labels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

  setText('activityTrainings', String(total));
  setText('activityCalories', calories.toLocaleString('es-CL'));
  setText('activityTime', formatMinutes(minutes));
  setText('progressPercent', `${progress}%`);

  const progressBar = document.getElementById('progressBar');
  if (progressBar) progressBar.style.width = `${progress}%`;

  const bars = document.getElementById('activityBars');
  if (!bars) return;

  bars.innerHTML = labels.map((label, index) => {
    const active = reservedDays.has(index);
    const height = active ? 88 : 18;
    return `<div class="bar ${active ? 'active' : ''}"><span style="height:${height}%"></span>${label}</div>`;
  }).join('');
}

function renderCalendar(reservations) {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;

  const reservedDays = new Map(reservations.map((item) => [item.dayNumber, item]));
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const days = [15, 16, 17, 18, 19, 20, 21];

  grid.innerHTML = [
    ...weekDays.map((day) => `<span class="calendar-head">${day}</span>`),
    ...days.map((day) => {
      const item = reservedDays.get(day);
      return `<span class="calendar-day ${item ? 'reserved' : ''}" title="${item ? item.name : ''}">${day}</span>`;
    })
  ].join('');

  const count = reservations.length;
  setText('calendarSummary', count === 0
    ? 'Sin clases reservadas esta semana'
    : `Tienes ${count} ${count === 1 ? 'clase reservada' : 'clases reservadas'} esta semana`);
}

function renderClassButtonStates(reservations) {
  const reservedIds = new Set(reservations.map((item) => item.id));

  document.querySelectorAll('.js-reserve-class').forEach((button) => {
    const isReserved = reservedIds.has(button.dataset.classId);
    button.classList.toggle('reserved', isReserved);
    button.innerHTML = isReserved
      ? '<i class="bi bi-check2-circle"></i> Reservada'
      : '<i class="bi bi-calendar-plus"></i> Reservar';
  });
}

function renderNextClass(reservations) {
  const next = reservations[0];

  if (!next) {
    setText('nextClassName', 'Sin reserva');
    setText('nextClassDetail', 'Elige una clase disponible');
    return;
  }

  setText('nextClassName', next.shortName || next.name);
  setText('nextClassDetail', `${next.day} · ${next.time} · ${next.room}`);
}

function showDashboardNotice(message, type = 'success') {
  const element = document.getElementById('reservationMessage');
  if (!element) return;

  element.hidden = false;
  element.textContent = message;
  element.className = `reservation-notice ${type}`;
  window.setTimeout(() => {
    element.hidden = true;
  }, 3500);
}

function formatMinutes(totalMinutes) {
  if (!totalMinutes) return '0m';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) return `${minutes}m`;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function setupAdminUserForm() {
  const form = document.querySelector('#adminUserForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormErrors(form);
    hideMessage('adminMessage');

    const editingId = form.dataset.editingId;
    const payload = buildUserPayload(form, {
      includeRole: true,
      requirePassword: !editingId
    });
    const confirmPassword = getFieldValue(form, 'confirm_password');
    const isValid = validateUserForm(form, payload, {
      requirePassword: !editingId,
      confirmPassword,
      passwordOptional: Boolean(editingId)
    });

    if (!isValid) return;

    if (editingId && !payload.password) {
      delete payload.password;
    }

    setButtonLoading(form, true, editingId ? 'Actualizando...' : 'Creando...');
    try {
      await apiFetch(editingId ? `/users/${editingId}` : '/users', {
        method: editingId ? 'PUT' : 'POST',
        body: payload
      });

      showMessage('adminMessage', editingId ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.', 'success');
      resetAdminForm();
      await loadUsers();
    } catch (error) {
      showMessage('adminMessage', error.message, 'error');
      applyApiErrors(form, error.errors);
    } finally {
      setButtonLoading(form, false);
    }
  });

  document.querySelector('#cancelEditButton')?.addEventListener('click', resetAdminForm);
}

function setupUsersTableEvents() {
  const table = document.querySelector('#usersTableBody');
  if (!table) return;

  table.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const id = button.dataset.id;
    if (button.dataset.action === 'edit') {
      await loadUserIntoForm(id);
    }

    if (button.dataset.action === 'delete') {
      openDeleteModal(id);
    }
  });
}

function setupDeleteModal() {
  document.querySelector('#confirmDeleteButton')?.addEventListener('click', async () => {
    if (!state.deleteUserId) return;

    try {
      await apiFetch(`/users/${state.deleteUserId}`, { method: 'DELETE' });
      showMessage('adminMessage', 'Usuario eliminado correctamente.', 'success');
      state.deleteUserId = null;
      await loadUsers();
    } catch (error) {
      showMessage('adminMessage', error.message, 'error');
    }
  });
}

async function loadUsers() {
  const body = document.querySelector('#usersTableBody');
  if (!body) return;

  body.innerHTML = '<tr><td colspan="6" class="text-center py-4">Cargando usuarios...</td></tr>';

  try {
    const result = await apiFetch('/users');
    state.users = result.data || [];
    renderUsers(state.users);
    updateAdminMetrics(state.users);
  } catch (error) {
    body.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">${escapeHtml(error.message)}</td></tr>`;
  }
}

function renderUsers(users) {
  const body = document.querySelector('#usersTableBody');
  if (!body) return;

  if (!users.length) {
    body.innerHTML = '<tr><td colspan="6" class="text-center py-4">No hay usuarios registrados.</td></tr>';
    return;
  }

  body.innerHTML = users.map((user) => `
    <tr>
      <td>${user.id}</td>
      <td>${escapeHtml(capitalizeName(user.full_name))}</td>
      <td>${escapeHtml(String(user.email || '').toLowerCase())}</td>
      <td>${roleBadge(user.role)}</td>
      <td>${formatDate(user.createdAt || user.created_at)}</td>
      <td>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-sm btn-warning fw-bold" type="button" data-action="edit" data-id="${user.id}">
            <i class="bi bi-pencil-square"></i> Editar
          </button>
          <button class="btn btn-sm btn-danger fw-bold" type="button" data-action="delete" data-id="${user.id}">
            <i class="bi bi-trash3"></i> Eliminar
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function loadUserIntoForm(id) {
  const form = document.querySelector('#adminUserForm');
  if (!form) return;

  hideMessage('adminMessage');
  clearFormErrors(form);

  try {
    const result = await apiFetch(`/users/${id}`);
    const user = result.data;
    form.dataset.editingId = user.id;
    form.elements.full_name.value = user.full_name || '';
    form.elements.email.value = user.email || '';
    form.elements.role.value = user.role || 'user';
    form.elements.birth_date.value = normalizeDateInput(user.birth_date);
    form.elements.sport_name.value = user.metadata?.sports?.[0]?.name || '';
    form.elements.sport_frequency.value = user.metadata?.sports?.[0]?.frequency_per_week ?? '';
    form.elements.password.value = '';
    form.elements.confirm_password.value = '';
    setOptionalText('#adminFormTitle', 'Editar Usuario');
    setOptionalText('#adminSubmitText', 'Guardar cambios');
    setOptionalHidden('#cancelEditButton', false);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showMessage('adminMessage', error.message, 'error');
  }
}

function resetAdminForm() {
  const form = document.querySelector('#adminUserForm');
  if (!form) return;

  form.reset();
  delete form.dataset.editingId;
  clearFormErrors(form);
  setOptionalText('#adminFormTitle', 'Nuevo Usuario');
  setOptionalText('#adminSubmitText', 'Crear usuario');
  setOptionalHidden('#cancelEditButton', true);
}

function openDeleteModal(id) {
  const user = state.users.find((item) => String(item.id) === String(id));
  state.deleteUserId = id;
  const name = user ? capitalizeName(user.full_name) : `ID ${id}`;
  const label = document.querySelector('#deleteUserName');
  if (label) label.textContent = name;

  const modalElement = document.querySelector('#deleteUserModal');
  if (modalElement && window.bootstrap) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
  }
}

function updateAdminMetrics(users) {
  setText('metricTotalUsers', users.length);
  setText('metricTotalCoaches', users.filter((user) => user.role === 'coach').length);
  setText('metricTotalAdmins', users.filter((user) => user.role === 'admin').length);
}

async function setupProfilePage() {
  const user = await getAuthenticatedUser();
  if (!user) return;

  fillCurrentUserLabels(user);
  renderProfile(user);
  setupProfileForm(user);
  setupPasswordForm();
}

function setupProfileForm(user) {
  const form = document.querySelector('#profileForm');
  if (!form) return;

  form.elements.full_name.value = user.full_name || '';
  form.elements.email.value = user.email || '';
  form.elements.birth_date.value = normalizeDateInput(user.birth_date);
  form.elements.sport_name.value = user.metadata?.sports?.[0]?.name || '';
  form.elements.sport_frequency.value = user.metadata?.sports?.[0]?.frequency_per_week ?? '';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormErrors(form);
    hideMessage('profileMessage');

    const payload = buildUserPayload(form, {
      includeRole: false,
      requirePassword: false,
      includePassword: false
    });

    const isValid = validateUserForm(form, payload, {
      requirePassword: false,
      skipPassword: true
    });

    if (!isValid) return;

    setButtonLoading(form, true, 'Guardando...');
    try {
      const result = await apiFetch('/auth/me', {
        method: 'PUT',
        body: payload
      });

      localStorage.setItem('sportclub_user', JSON.stringify(result.data));
      renderProfile(result.data);
      fillCurrentUserLabels(result.data);
      showMessage('profileMessage', 'Perfil actualizado correctamente.', 'success');
    } catch (error) {
      showMessage('profileMessage', error.message, 'error');
      applyApiErrors(form, error.errors);
    } finally {
      setButtonLoading(form, false);
    }
  });
}

function setupPasswordForm() {
  const form = document.querySelector('#passwordForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormErrors(form);
    hideMessage('passwordMessage');

    const payload = {
      current_password: getFieldValue(form, 'current_password'),
      new_password: getFieldValue(form, 'new_password'),
      confirm_password: getFieldValue(form, 'confirm_password')
    };

    let isValid = true;
    if (!payload.current_password) {
      setFieldError(form, 'current_password', 'La contrasena actual es obligatoria.');
      isValid = false;
    }

    if (!payload.new_password || payload.new_password.length < 8) {
      setFieldError(form, 'new_password', 'La nueva contrasena debe tener minimo 8 caracteres.');
      isValid = false;
    }

    if (payload.new_password !== payload.confirm_password) {
      setFieldError(form, 'confirm_password', 'Las contrasenas no coinciden.');
      isValid = false;
    }

    if (!isValid) return;

    setButtonLoading(form, true, 'Guardando...');
    try {
      await apiFetch('/auth/me/password', {
        method: 'PUT',
        body: payload
      });
      form.reset();
      showMessage('passwordMessage', 'Contrasena actualizada correctamente.', 'success');
    } catch (error) {
      showMessage('passwordMessage', error.message, 'error');
      applyApiErrors(form, error.errors);
    } finally {
      setButtonLoading(form, false);
    }
  });
}

function renderProfile(user) {
  setText('profileName', capitalizeName(user.full_name));
  setText('profileEmail', String(user.email || '').toLowerCase());
  setHtml('profileRole', roleBadge(user.role));
  setText('profileBirthDate', formatDate(user.birth_date));
  setText('profileSport', user.metadata?.sports?.[0]?.name || 'Sin deporte registrado');
}

function fillCurrentUserLabels(user) {
  setText('currentUserName', capitalizeName(user.full_name));
  setHtml('currentUserRole', roleBadge(user.role));
}

function buildUserPayload(form, options = {}) {
  const payload = {
    full_name: getFieldValue(form, 'full_name'),
    email: getFieldValue(form, 'email').toLowerCase(),
    birth_date: getFieldValue(form, 'birth_date') || null,
    metadata: buildMetadata(form)
  };

  if (options.includeRole) {
    payload.role = getFieldValue(form, 'role') || 'user';
  }

  if (options.includePassword !== false) {
    const password = getFieldValue(form, 'password');
    if (options.requirePassword || password) {
      payload.password = password;
    }
  }

  return payload;
}

function buildMetadata(form) {
  const sportName = getFieldValue(form, 'sport_name');
  const frequencyRaw = getFieldValue(form, 'sport_frequency');
  const sports = [];

  if (sportName) {
    const sport = { name: sportName };
    if (frequencyRaw !== '') {
      sport.frequency_per_week = Number(frequencyRaw);
    }
    sports.push(sport);
  }

  return { sports };
}

function validateUserForm(form, payload, options = {}) {
  let isValid = true;

  if (!payload.full_name) {
    setFieldError(form, 'full_name', 'El nombre es obligatorio.');
    isValid = false;
  } else if (payload.full_name.length < 3) {
    setFieldError(form, 'full_name', 'El nombre debe tener al menos 3 caracteres.');
    isValid = false;
  }

  if (!payload.email) {
    setFieldError(form, 'email', 'El email es obligatorio.');
    isValid = false;
  } else if (!isEmail(payload.email)) {
    setFieldError(form, 'email', 'Email invalido.');
    isValid = false;
  }

  if (!options.skipPassword) {
    const password = payload.password || '';
    const passwordWasTyped = Boolean(password);

    if (options.requirePassword && !password) {
      setFieldError(form, 'password', 'La contrasena es obligatoria.');
      isValid = false;
    } else if ((options.requirePassword || passwordWasTyped) && password.length < 8) {
      setFieldError(form, 'password', 'Contrasena minima 8 caracteres.');
      isValid = false;
    }

    if ((options.requirePassword || passwordWasTyped) && password !== options.confirmPassword) {
      setFieldError(form, 'confirm_password', 'Las contrasenas no coinciden.');
      isValid = false;
    }
  }

  const frequency = payload.metadata?.sports?.[0]?.frequency_per_week;
  if (frequency !== undefined && (!Number.isInteger(frequency) || frequency < 0)) {
    setFieldError(form, 'sport_frequency', 'Debe ser un numero entero mayor o igual a 0.');
    isValid = false;
  }

  return isValid;
}

function getFieldValue(form, name) {
  return String(form.elements[name]?.value || '').trim();
}

function clearFormErrors(form) {
  form.querySelectorAll('.is-invalid').forEach((input) => input.classList.remove('is-invalid'));
  form.querySelectorAll('.invalid-feedback').forEach((feedback) => {
    feedback.textContent = '';
  });
}

function setFieldError(form, name, message) {
  const field = form.elements[name];
  if (!field) return;

  field.classList.add('is-invalid');
  const wrapper = field.closest('.mb-3, .mb-4, .col-md-3, .col-md-4, .col-md-6, .col-lg-6') || field.parentElement;
  const feedback = wrapper?.querySelector('.invalid-feedback');
  if (feedback) feedback.textContent = message;
}

function applyApiErrors(form, errors = {}) {
  Object.entries(errors || {}).forEach(([key, value]) => {
    const message = Array.isArray(value) ? value.join(' ') : value;
    if (form.elements[key]) setFieldError(form, key, message);
  });
}

function showMessage(id, message, type = 'error') {
  const element = document.getElementById(id);
  if (!element) return;
  element.hidden = false;
  element.textContent = message;
  element.className = `message ${type}`;
}

function hideMessage(id) {
  const element = document.getElementById(id);
  if (!element) return;
  element.hidden = true;
  element.textContent = '';
}

function setButtonLoading(form, isLoading, text = '') {
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;

  if (isLoading) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${text}`;
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalHtml || button.innerHTML;
  }
}

function roleBadge(role) {
  const labels = {
    user: 'user',
    coach: 'coach',
    admin: 'admin'
  };
  return `<span class="badge role-badge role-${role}">${labels[role] || role}</span>`;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatDate(value) {
  if (!value) return 'Sin fecha';
  const dateText = String(value).split('T')[0];
  const parts = dateText.split('-');

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function normalizeDateInput(value) {
  if (!value) return '';
  return String(value).split('T')[0];
}

function capitalizeName(value = '') {
  return String(value)
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setHtml(id, value) {
  const element = document.getElementById(id);
  if (element) element.innerHTML = value;
}

function setOptionalText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function setOptionalHidden(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.hidden = value;
}
