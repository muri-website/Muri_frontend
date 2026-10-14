import type React from "react";
import { useState, useEffect } from "react";
import {
  reservationService,
  type Foglalas,
  type FoglalasQuery,
  type CreateFoglalas
} from "../services/reservations";

const ReservationsPage: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [mikor, setMikor] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [reservations, setReservations] = useState<Foglalas[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateFoglalas>({
    nev: '',
    email: 'netgyormuri@gmail.com',
    fo: 2,
    mikor: '',
    szektorId: 1,
    megjegyzés: '',
  });

  const getBackendErrorMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { data?: unknown } }).response;
      if (response?.data) {
        if (typeof response.data === 'string') return response.data;
        if (typeof response.data === 'object' && response.data !== null && 'message' in response.data) {
          return String((response.data as { message: unknown }).message);
        }
      }
    }
    return 'Váratlan hiba történt. Próbáld újra!';
  };

  const fetchReservations = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const queryParams: FoglalasQuery = {};
      if (text) queryParams.text = text;
      if (mikor) queryParams.mikor = mikor;
      if (status) queryParams.status = status;
      const data = await reservationService.getAll(queryParams);
      setReservations(data);
    } catch (error: unknown) {
      setErrorMessage(getBackendErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await reservationService.getAll();
        if (isMounted) setReservations(data);
      } catch (error: unknown) {
        if (isMounted) setErrorMessage(getBackendErrorMessage(error));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleApprove = async (id: number) => {
    setErrorMessage(null);
    try {
      await reservationService.approveStatus(id);
      fetchReservations();
    } catch (error: unknown) {
      setErrorMessage(getBackendErrorMessage(error));
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt("Kérlek, add meg az elutasítás indokát:");
    if (reason === null || reason.trim() === "") {
      return;
    }
    setErrorMessage(null);
    try {
      await reservationService.rejectStatus(id, reason);
      fetchReservations();
    } catch (error: unknown) {
      setErrorMessage(getBackendErrorMessage(error));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Biztosan törölni szeretnéd ezt a foglalást?')) {
      setErrorMessage(null);
      try {
        await reservationService.delete(id);
        fetchReservations();
      } catch (error: unknown) {
        setErrorMessage(getBackendErrorMessage(error));
      }
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      await reservationService.create(formData);
      setIsModalOpen(false);
      setFormData({
        nev: '',
        email: 'netgyormuri@gmail.com',
        fo: 2,
        mikor: '',
        szektorId: 1,
        megjegyzés: '',
      });
      fetchReservations();
    } catch (error: unknown) {
      setErrorMessage(getBackendErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-neutral-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-500">Foglalások Kezelése</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
        >
          <span>+</span> Új foglalás
        </button>
      </div>
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex justify-between items-center">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-neutral-800 p-4 rounded-xl border border-neutral-700">
        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1">KERESÉS (NÉV/EMAIL)</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Kovács..."
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1">DÁTUM</label>
          <input
            type="date"
            value={mikor}
            onChange={(e) => setMikor(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1">STÁTUSZ</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500"
          >
            <option value="">Összes státusz</option>
            <option value="pending">Függőben (Pending)</option>
            <option value="approved">Jóváhagyva (Approved)</option>
            <option value="rejected">Elutasítva (Rejected)</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchReservations}
            disabled={loading}
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {loading ? 'Keresés...' : 'Szűrés'}
          </button>
        </div>
      </div>
      <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm text-neutral-300">
          <thead className="bg-neutral-950 text-neutral-400 uppercase text-xs border-b border-neutral-700">
            <tr>
              <th className="p-4">Név / Email</th>
              <th className="p-4">Időpont</th>
              <th className="p-4">Fő</th>
              <th className="p-4">Szektor</th>
              <th className="p-4">Megjegyzés</th>
              <th className="p-4">Státusz</th>
              <th className="p-4 text-center">Műveletek</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-neutral-500">
                  {loading ? 'Adatok betöltése...' : 'Nincs a feltételeknek megfelelő foglalás.'}
                </td>
              </tr>
            ) : (
              reservations.map((res) => {
                const note = res.megjegyzés || (res as unknown as { megjegyzes: string }).megjegyzes;
                return (
                  <tr key={res.id} className="hover:bg-neutral-750 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{res.nev}</div>
                      <div className="text-xs text-neutral-400">{res.email}</div>
                    </td>
                    <td className="p-4">
                      {new Date(res.mikor).toLocaleString('hu-HU', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 font-bold text-white">{res.fo} fő</td>
                    <td className="p-4">{res.szektorNev}</td>
                    <td className="p-4 max-w-xs truncate text-xs text-neutral-400">
                      {note ? note : <span className="text-neutral-600 italic">-</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${res.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        res.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      {res.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(res.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors cursor-pointer"
                          >
                            Elfogad
                          </button>
                          <button
                            onClick={() => handleReject(res.id)}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors cursor-pointer"
                          >
                            Elutasít
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="px-3 py-1 bg-neutral-700 hover:bg-red-600 text-white rounded text-xs transition-colors cursor-pointer"
                      >
                        Törlés
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-green-500">Új Foglalás Rögzítése</h2>
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex justify-between items-center">
                <span>⚠️ {errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="text-neutral-400 hover:text-white">✕</button>
              </div>
            )}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Vendég Neve</label>
                <input
                  type="text"
                  required
                  value={formData.nev}
                  onChange={(e) => setFormData({ ...formData, nev: e.target.value })}
                  placeholder="Kovács János"
                  className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Személyek száma (fő)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={formData.fo}
                    onChange={(e) => setFormData({ ...formData, fo: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Szektor</label>
                  <select
                    required
                    value={formData.szektorId}
                    onChange={(e) => setFormData({ ...formData, szektorId: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                  >
                    <option value="1">Kint</option>
                    <option value="2">Bent - Alsószint</option>
                    <option value="3">Bent - Földszint</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Időpont</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.mikor}
                  onChange={(e) => setFormData({ ...formData, mikor: e.target.value })}
                  className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg font-semibold text-sm cursor-pointer"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-sm disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Mentés...' : 'Foglalás Rögzítése'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;