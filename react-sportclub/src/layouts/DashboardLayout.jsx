import { Outlet } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import Footer from '../components/Footer.jsx';

function DashboardLayout({ roleName }) {
  return (
    <div className="app-shell">
      <AppNavbar roleName={roleName} />
      <main className="container py-5">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default DashboardLayout;

