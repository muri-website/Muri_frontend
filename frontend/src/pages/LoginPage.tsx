import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.login(email, password);
      navigate('/admin');
    } catch {
      setError('Érvénytelen e-mail cím vagy jelszó!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-800 rounded-xl shadow-2xl p-8 border border-neutral-700">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-green-500 tracking-wide">MURI PUB & MORE</h1>
          <p className="text-neutral-400 text-sm mt-1">Adminisztrációs Felület</p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              E-mail cím
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="netgyormuri@gmail.com"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:outline-none focus:border-green-500 text-white placeholder-neutral-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Jelszó
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:outline-none focus:border-green-500 text-white placeholder-neutral-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md transition-all duration-200 cursor-pointer"
          >
            {loading ? 'Bejelentkezés...' : 'Belépés'}
          </button>
        </form>
      </div>
    </div>
  );
};