import { Link } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import Footer from '../components/Footer.jsx';

function Home() {
  return (
    <div className="app-shell">
      <AppNavbar />
      <main className="hero-react">
        <div className="container py-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="section-tag">SportClub React SPA</span>
              <h1 className="display-4 fw-bold mt-3">Login y registro migrados a React</h1>
              <p className="lead text-white-50">
                Base profesional con React Router, Bootstrap tradicional y servicio de autenticacion separado.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <Link className="btn btn-warning fw-bold px-4" to="/login">Ir a Login</Link>
                <Link className="btn btn-outline-light fw-bold px-4" to="/registro">Crear cuenta</Link>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="info-card">
                <h2 className="h4 fw-bold">Estructura pedida</h2>
                <ul className="mb-0">
                  <li>React Router</li>
                  <li>pages, services, components, layouts</li>
                  <li>Bootstrap con className tradicional</li>
                  <li>authService.js para conectar API</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Home;

