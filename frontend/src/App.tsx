import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './pages/AdminLayout';
import ReservationsPage from './pages/ReservationsPage';
import DrinksPage from './pages/DrinksPage';
import EventsPage from './pages/EventsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Nyilvános oldalak */}
        <Route path="/login" element={<LoginPage />} />

        {/* Védett Admin útvonalak */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/foglalasok" element={<ReservationsPage />} />
            <Route path="/admin/italok" element={<DrinksPage />} />
            <Route path="/admin/esemenyek" element={<EventsPage />} />
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
