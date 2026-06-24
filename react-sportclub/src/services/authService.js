const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  localStorage.getItem('sportclub_api_url') ||
  'http://localhost:3000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const result = await response.json().catch(() => ({
    ok: false,
    message: 'La API no respondio con JSON valido.'
  }));

  if (!response.ok || result.ok === false) {
    throw {
      message: getReadableMessage(result.message, result.errors),
      errors: result.errors || {}
    };
  }

  return result.data;
}

function getReadableMessage(message, errors = {}) {
  const text = String(message || '').trim();

  if (/payload/i.test(text) && Object.keys(errors || {}).length > 0) {
    return 'Revisa los campos marcados en rojo antes de continuar.';
  }

  return text || 'Ocurrio un error al comunicarse con la API.';
}

export function login(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: credentials
  });
}

export function registerUser(userData) {
  return request('/auth/register', {
    method: 'POST',
    body: userData
  });
}

export function saveSession(sessionData) {
  localStorage.setItem('sportclub_token', sessionData.token);
  localStorage.setItem('sportclub_user', JSON.stringify(sessionData.user));
}

export function saveRegisteredUser(user) {
  localStorage.setItem('sportclub_user', JSON.stringify(user));
}

