import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Agenda from './pages/Agenda';
import Appointments from './pages/Appointments';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Login from './pages/Login';
import NoShowPanel from './pages/NoShowPanel';
import Notifications from './pages/Notifications';
import ProfessionalDetail from './pages/ProfessionalDetail';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Search from './pages/Search';
import Security from './pages/Security';
import Teleconsult from './pages/Teleconsult';
import Triage from './pages/Triage';
import { useAuthStore } from './store/auth';

function Protected({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
          <Route path="/redefinir-senha" element={<ResetPassword />} />
          <Route
            path="/seguranca"
            element={
              <Protected>
                <Security />
              </Protected>
            }
          />
          <Route
            path="/notificacoes"
            element={
              <Protected>
                <Notifications />
              </Protected>
            }
          />
          <Route
            path="/buscar"
            element={
              <Protected>
                <Search />
              </Protected>
            }
          />
          <Route
            path="/triagem"
            element={
              <Protected>
                <Triage />
              </Protected>
            }
          />
          <Route
            path="/minhas-consultas"
            element={
              <Protected>
                <Appointments />
              </Protected>
            }
          />
          <Route
            path="/no-show"
            element={
              <Protected>
                <NoShowPanel />
              </Protected>
            }
          />
          <Route
            path="/agenda"
            element={
              <Protected>
                <Agenda />
              </Protected>
            }
          />
          <Route
            path="/teleconsulta/:appointmentId"
            element={
              <Protected>
                <Teleconsult />
              </Protected>
            }
          />
          <Route
            path="/profissional/:id"
            element={
              <Protected>
                <ProfessionalDetail />
              </Protected>
            }
          />
          <Route
            path="/painel"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-200 py-5 text-center text-sm text-slate-500">
        MedConecta AI &middot; prototipo &middot; a triagem nao substitui diagnostico medico
      </footer>
    </div>
  );
}
