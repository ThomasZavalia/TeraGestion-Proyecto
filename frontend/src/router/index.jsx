import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { Box } from '@chakra-ui/react';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import PacientesPage from '../pages/pacientes/PacientesPage';
import TurnosPage from '../pages/turnos/TurnoPage'; 
import PagosPage from '../pages/pagos/PagosPage';
import ReportesPage from '../pages/reportes/ReportesPage';
import PerfilPage from '../pages/perfil/PerfilPage'; 
import ReservaPage from '../pages/public/ReservaPage';
import ConfirmarTurnoPage from '../pages/public/ConfirmarTurnoPage';
import { SignalRProvider } from '../context/SignalRContext';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import ObrasSocialesCRUD from '../pages/perfil/components/ObrasSocialesCrud';
import AuditoriaPage from '../pages/auditoria/AuditoriaPage';
import UsuariosPage from '../pages/usuarios/UsuariosPage';

import { PacienteDetallePage } from '../pages/pacientes/PacienteDetallePage';

const SignalRWrapper = () => {
  return (
    <SignalRProvider>
      <DashboardLayout /> 
    </SignalRProvider>
  );
};
const AppRouter = () => {
  return (
    <Routes>
     
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reservar" element={<ReservaPage />} />
      <Route path="/confirmar-turno" element={<ConfirmarTurnoPage />} />

     <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

     
      <Route element={<ProtectedRoute />}>
        <Route element={<SignalRWrapper />}>
          
          <Route path="/" element={<HomePage />} />
          <Route path="/pacientes" element={<PacientesPage />} />

          <Route path="/pacientes/:id" element={<PacienteDetallePage />} />
        
          
       
          <Route path="/turnos" element={<TurnosPage />} />
           <Route path="/configuracion" element={<PerfilPage />} />
          
    <Route element={<ProtectedRoute allowedRoles={['Admin', 'Terapeuta']} />}>
            <Route path="/reportes" element={<ReportesPage />} />
          </Route>

        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Secretaria']} />}>
            <Route path="/pagos" element={<PagosPage />} />
            <Route path="/obras-sociales" element={<Box p={6}><ObrasSocialesCRUD /></Box>} />
          </Route>

          

          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
           
            <Route path="/auditoria" element={<AuditoriaPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />

          </Route>
          
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;