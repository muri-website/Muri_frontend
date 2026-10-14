import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './pages/AdminLayout';
import ReservationsPage from './pages/ReservationsPage';
import DrinksPage from './pages/DrinksPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Nyilvános bejelentkező oldal */}
        <Route path="/login" element={<LoginPage />} />

        {/* Védett Admin útvonalak a közös kerettel */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/foglalasok" element={<ReservationsPage />} />
            <Route path="/admin/italok" element={<DrinksPage />} />
            {/* Alapértelmezett átirányítás a foglalásokra */}
            <Route path="/admin" element={<Navigate to="/admin/foglalasok" replace />} />
          </Route>
        </Route>

        {/* Minden más útvonal átirányítása a login-ra */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
