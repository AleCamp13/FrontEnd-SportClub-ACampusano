import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import UserDashboard from '../pages/UserDashboard.jsx';
import CoachDashboard from '../pages/CoachDashboard.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
        </Route>

        <Route element={<DashboardLayout roleName="Usuario" />}>
          <Route path="/usuario" element={<UserDashboard />} />
        </Route>

        <Route element={<DashboardLayout roleName="Coach" />}>
          <Route path="/coach" element={<CoachDashboard />} />
        </Route>

        <Route element={<DashboardLayout roleName="Administrador" />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

