import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormMessage from '../components/FormMessage.jsx';
import { login, saveSession } from '../services/authService.js';

const roleRoutes = {
  user: '/usuario',
  coach: '/coach',
  admin: '/admin'
};

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateLogin(form);
    setErrors(validationErrors);
    setMessage('');

    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    try {
      const session = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password
      });
      saveSession(session);
      navigate(roleRoutes[session.user.role] || '/usuario');
    } catch (error) {
      setMessage(error.message);
      setErrors(error.errors || {});
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="row justify-content-center">
      <div className="col-lg-5 col-md-8">
        <div className="auth-card-react">
          <h1 className="h2 text-center">Inicio de sesion</h1>
          <p className="text-center text-muted">Ingresa tus credenciales de SportClub.</p>

          <FormMessage>{message}</FormMessage>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">Correo</label>
              <input
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="correo@ejemplo.cl"
              />
              <div className="invalid-feedback">{errors.email}</div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="password">Contrasena</label>
              <input
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="Ingresa tu contrasena"
              />
              <div className="invalid-feedback">{errors.password}</div>
            </div>

            <button className="btn btn-warning fw-bold w-100" type="submit" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="d-flex justify-content-between mt-4">
            <Link to="/">Volver</Link>
            <Link to="/registro">Crear cuenta</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function validateLogin(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = 'El correo es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Ingresa un correo valido.';
  }

  if (!values.password) {
    errors.password = 'La contrasena es obligatoria.';
  }

  return errors;
}

export default Login;

