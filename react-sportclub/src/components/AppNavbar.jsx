import { Link, NavLink } from 'react-router-dom';

function AppNavbar({ roleName = 'SportClub' }) {
  const logoUrl = `${import.meta.env.BASE_URL}assets/img/logo.png`;

  return (
    <header className="app-topbar">
      <nav className="navbar navbar-expand-lg navbar-dark container py-3">
        <Link className="navbar-brand d-flex align-items-center gap-3" to="/">
          <img className="sport-logo" src={logoUrl} alt="Logo oficial SportClub" />
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#sportMenu" aria-label="Abrir menu">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="sportMenu">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item"><NavLink className="nav-link" to="/">Inicio</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/login">Login</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/registro">Registro</NavLink></li>
            <li className="nav-item"><span className="role-chip">{roleName}</span></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default AppNavbar;

