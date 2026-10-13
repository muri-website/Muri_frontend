import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ProtectedRoute } from './components/ProtectedRoute'

const AdminDashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };
  return (
    <div style={{ padding: '2rem', color: '#fff' }}>
      <h1>Muri Admin Dashboard</h1>
      <p>Sikeresen beléptél!</p>
      <button onClick={handleLogout}>Kijelentkezés</button>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Nyilvános bejelentkező oldal */}
        <Route path="/login" element={<LoginPage />} />

        {/* Védett Admin útvonalak */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Bármilyen más útvonal esetén átirányítás */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
