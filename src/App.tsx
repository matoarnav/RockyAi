import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PanelDataProvider } from './context/PanelDataContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Home from './pages/Home';
import Configuracion from './pages/Configuracion';
import ProjectRoute from './components/ProjectRoute';
import ProjectHome from './pages/ProjectHome';
import Metricas from './pages/Metricas';
import Agentes from './pages/Agentes';
import AgentDetail from './pages/AgentDetail';
import EmailCrmLayout from './pages/EmailCrm/EmailCrmLayout';
import Resumen from './pages/EmailCrm/Resumen';
import Campanas from './pages/EmailCrm/Campanas';
import NuevaCampana from './pages/EmailCrm/NuevaCampana';
import Audiencias from './pages/EmailCrm/Audiencias';
import Templates from './pages/EmailCrm/Templates';
import CrmMetricas from './pages/EmailCrm/Metricas';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <PanelDataProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/p/:projectId" element={<ProjectRoute />}>
            <Route index element={<ProjectHome />} />
            <Route path="metricas" element={<Metricas />} />
            <Route path="agentes" element={<Agentes />} />
            <Route path="agentes/:key" element={<AgentDetail />} />
            <Route path="email-crm" element={<EmailCrmLayout />}>
              <Route index element={<Resumen />} />
              <Route path="campanas" element={<Campanas />} />
              <Route path="nueva" element={<NuevaCampana />} />
              <Route path="audiencias" element={<Audiencias />} />
              <Route path="templates" element={<Templates />} />
              <Route path="metricas" element={<CrmMetricas />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </PanelDataProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
