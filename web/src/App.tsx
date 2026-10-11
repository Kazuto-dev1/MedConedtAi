import type { ReactNode } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Agenda from './pages/Agenda';
import Appointments from './pages/Appointments';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Help from './pages/Help';
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
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main id="conteudo" tabIndex={-1} className="app-main mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ajuda" element={<Help />} />
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
      <footer className="mt-10 border-t border-slate-200 bg-slate-50 py-7 text-center text-sm text-slate-500">
        <p className="font-semibold text-slate-700">MedConecta AI</p>
        <p className="mt-1">Cuidado conectado, com tecnologia e acolhimento.</p>
        <p className="mt-1 text-xs">A triagem não substitui diagnóstico médico. <Link to="/ajuda" className="underline hover:text-[#006b5e]">Central de ajuda</Link></p>
      </footer>
    </div>
  );
}
