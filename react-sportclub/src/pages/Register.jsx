import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormMessage from '../components/FormMessage.jsx';
import { registerUser, saveRegisteredUser } from '../services/authService.js';

const initialForm = {
  full_name: '',
  email: '',
  birth_date: '',
  sport_name: '',
  sport_frequency: '',
  password: '',
  confirm_password: ''
};

function Register() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('danger');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateRegister(form);
    setErrors(validationErrors);
    setMessage('');

    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    try {
      const user = await registerUser(buildPayload(form));
      saveRegisteredUser(user);
      setMessageType('success');
      setMessage('Usuario registrado correctamente. Ahora puedes iniciar sesion.');
      setForm(initialForm);
    } catch (error) {
      setMessageType('danger');
      setMessage(error.message);
      setErrors(error.errors || {});
    } finally {
      setIsLoading(false);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="row justify-content-center">
      <div className="col-lg-7 col-md-10">
        <div className="auth-card-react">
          <h1 className="h2 text-center">Registro de usuario</h1>
          <p className="text-center text-muted">Crea tu cuenta para reservar clases.</p>

          <FormMessage type={messageType}>{message}</FormMessage>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="full_name">Nombre completo</label>
              <input className={`form-control ${errors.full_name ? 'is-invalid' : ''}`} id="full_name" name="full_name" value={form.full_name} onChange={handleChange} autoComplete="name" />
              <div className="invalid-feedback">{errors.full_name}</div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="email">Correo</label>
              <input className={`form-control ${errors.email ? 'is-invalid' : ''}`} id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
              <div className="invalid-feedback">{errors.email}</div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="birth_date">Fecha de nacimiento</label>
              <input className={`form-control ${errors.birth_date ? 'is-invalid' : ''}`} id="birth_date" name="birth_date" type="date" max={today} value={form.birth_date} onChange={handleChange} />
              <div className="invalid-feedback">{errors.birth_date}</div>
            </div>

            <div className="row">
              <div className="col-md-8 mb-3">
                <label className="form-label" htmlFor="sport_name">Deporte favorito</label>
                <input className="form-control" id="sport_name" name="sport_name" value={form.sport_name} onChange={handleChange} placeholder="Yoga, futbol, spinning" />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label" htmlFor="sport_frequency">Veces/semana</label>
                <input className={`form-control ${errors.sport_frequency ? 'is-invalid' : ''}`} id="sport_frequency" name="sport_frequency" type="number" min="0" step="1" value={form.sport_frequency} onChange={handleChange} />
                <div className="invalid-feedback">{errors.sport_frequency}</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="password">Contrasena</label>
              <input className={`form-control ${errors.password ? 'is-invalid' : ''}`} id="password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
              <div className="invalid-feedback">{errors.password}</div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="confirm_password">Confirmar contrasena</label>
              <input className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`} id="confirm_password" name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} autoComplete="new-password" />
              <div className="invalid-feedback">{errors.confirm_password}</div>
            </div>

            <button className="btn btn-warning fw-bold w-100" type="submit" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar'}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/login">Volver al inicio de sesion</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function buildPayload(values) {
  const sports = [];

  if (values.sport_name.trim()) {
    const sport = { name: values.sport_name.trim() };
    if (values.sport_frequency !== '') {
      sport.frequency_per_week = Number(values.sport_frequency);
    }
    sports.push(sport);
  }

  return {
    full_name: values.full_name.trim(),
    email: values.email.trim().toLowerCase(),
    birth_date: values.birth_date || null,
    password: values.password,
    metadata: { sports }
  };
}

function validateRegister(values) {
  const errors = {};
  const today = new Date().toISOString().split('T')[0];

  if (!values.full_name.trim()) {
    errors.full_name = 'El nombre completo es obligatorio.';
  } else if (values.full_name.trim().length < 3) {
    errors.full_name = 'El nombre debe tener al menos 3 caracteres.';
  }

  if (!values.email.trim()) {
    errors.email = 'El correo es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Ingresa un correo valido.';
  }

  if (values.birth_date && values.birth_date > today) {
    errors.birth_date = 'La fecha de nacimiento no puede ser futura.';
  }

  if (values.sport_frequency !== '') {
    const frequency = Number(values.sport_frequency);
    if (!Number.isInteger(frequency) || frequency < 0) {
      errors.sport_frequency = 'Debe ser un numero entero mayor o igual a 0.';
    }
  }

  if (!values.password) {
    errors.password = 'La contrasena es obligatoria.';
  } else if (values.password.length < 8) {
    errors.password = 'La contrasena debe tener minimo 8 caracteres.';
  }

  if (values.password !== values.confirm_password) {
    errors.confirm_password = 'Las contrasenas no coinciden.';
  }

  return errors;
}

export default Register;

