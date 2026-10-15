import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './pages/AdminLayout';
import ReservationsPage from './pages/ReservationsPage';
import DrinksPage from './pages/DrinksPage';
import EventsPage from './pages/EventsPage';
import TablesPage from './pages/TablesPage';
import OpeningHoursPage from './pages/OpeningHoursPage';
import NotFound from './pages/NotFound';
import { SpeedInsights } from '@vercel/speed-insights/nuxt/runtime';
import { Analytics } from '@vercel/analytics/nuxt/runtime';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Nyilvános oldalak */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/not-found" element={<NotFound />} />

        {/* Védett Admin útvonalak */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/foglalasok" element={<ReservationsPage />} />
            <Route path="/admin/italok" element={<DrinksPage />} />
            <Route path="/admin/esemenyek" element={<EventsPage />} />
            <Route path="/admin/asztalok" element={<TablesPage />} />
            <Route path="/admin/nyitvatartas" element={<OpeningHoursPage />} />
            <Route path="/admin" element={<Navigate to="/admin/foglalasok" replace />} />
          </Route>
        </Route>

        {/* Minden más útvonal átirányítása a not-found-ra */}
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
      <SpeedInsights/>
      <Analytics/>
    </BrowserRouter>
  );
}

export default App
