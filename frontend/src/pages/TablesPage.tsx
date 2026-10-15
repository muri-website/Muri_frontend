import type React from 'react';
import { useState, useEffect } from 'react';
import {
  tableService,
  type Asztal,
  type CreateAsztal,
} from '../services/tables';

export const TablesPage: React.FC = () => {
  const [tables, setTables] = useState<Asztal[]>([]);
  const [isKintEnabled, setIsKintEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateAsztal>({
    szektorId: 1,
    férőhely: 2,
    darab: 1,
  });

  const getBackendErrorMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { data?: unknown } }).response;
      if (response?.data) {
        if (typeof response.data === 'string') return response.data;
        if (
          typeof response.data === 'object' &&
          response.data !== null &&
          'message' in response.data
        ) {
          return String((response.data as { message: unknown }).message);
        }
      }
    }
    return 'Váratlan hiba történt. Próbáld újra!';
  };

  const fetchTables = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await tableService.getAll();
      setTables(data);
    } catch (error: unknown) {
      setErrorMessage(getBackendErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadAll = async () => {
      setLoading(true);
      try {
        const [tablesData, kintStatus] = await Promise.all([
          tableService.getAll(),
          tableService.kintGet(),
        ]);
        if (isMounted) {
          setTables(tablesData);
          setIsKintEnabled(kintStatus);
        }
      } catch (error: unknown) {
        if (isMounted) setErrorMessage(getBackendErrorMessage(error));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadAll();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleKint = async () => {
    const nextState = !isKintEnabled;
    setErrorMessage(null);
    try {
      await tableService.setKint(nextState);
      setIsKintEnabled(nextState);
    } catch (error: unknown) {
      setErrorMessage(getBackendErrorMessage(error));
    }
  };

  const handlePlus = async (id: number) => {
    setErrorMessage(null);
    try {
      await tableService.plus(id);
      fetchTables();
    } catch (error: unknown) {
      setErrorMessage(getBackendErrorMessage(error));
    }
  };

  const handleMinus = async (id: number) => {
    setErrorMessage(null);
    try {
      await tableService.minus(id);
      fetchTables();
    } catch (error: unknown) {
      setErrorMessage(getBackendErrorMessage(error));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Biztosan törölni szeretnéd ezt az asztaltípust?')) return;
    setErrorMessage(null);
    try {
      await tableService.delete(id);
      fetchTables();
    } catch (error: unknown) {
      setErrorMessage(getBackendErrorMessage(error));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      await tableService.create(formData);
      setIsModalOpen(false);
      setFormData({
        szektorId: 1,
        férőhely: 2,
        darab: 1,
      });
      fetchTables();
    } catch (error: unknown) {
      setErrorMessage(getBackendErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-neutral-900 min-h-screen text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-green-500">Asztalok & Szektorok</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
        >
          <span>+</span> Új Asztal Hozzáadása
        </button>
      </div>
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex justify-between items-center">
          <span>⚠️ {errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-neutral-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
      <div className="mb-6 bg-neutral-800 p-5 rounded-xl border border-neutral-700 flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-white">Kinti Tér (Terasz) Elérhetősége</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Ha ki van kapcsolva, a vendégek nem tudnak asztalt foglalni a kinti szektorba.
          </p>
        </div>
        <button
          onClick={handleToggleKint}
          className={`px-4 py-2 rounded-lg font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center gap-2 border ${isKintEnabled
            ? 'bg-green-500/20 text-green-400 border-green-500/40 hover:bg-green-500/30'
            : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:bg-neutral-750'
            }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${isKintEnabled ? 'bg-green-400' : 'bg-neutral-500'}`} />
          {isKintEnabled ? 'KINTI TÉR NYITVA' : 'KINTI TÉR ZÁRVA'}
        </button>
      </div>
      <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm text-neutral-300">
          <thead className="bg-neutral-950 text-neutral-400 uppercase text-xs border-b border-neutral-700">
            <tr>
              <th className="p-4">Szektor</th>
              <th className="p-4">Férőhely (fő/asztal)</th>
              <th className="p-4">Darabszám</th>
              <th className="p-4 text-center">Darabszám Módosítása</th>
              <th className="p-4 text-center">Műveletek</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {tables.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-neutral-500">
                  {loading ? 'Betöltés...' : 'Nincsenek rögzített asztalok.'}
                </td>
              </tr>
            ) : (
              tables.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-750 transition-colors">
                  <td className="p-4 font-semibold text-white">{item.szektorNev}</td>
                  <td className="p-4 font-bold text-white">{item.férőhely} fő</td>
                  <td className="p-4">{item.darab} db</td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      onClick={() => handleMinus(item.id)}
                      className="px-3 py-1 bg-neutral-900 hover:bg-neutral-700 text-white border border-neutral-700 rounded text-xs transition-colors cursor-pointer font-bold"
                      title="Darabszám csökkentése"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handlePlus(item.id)}
                      className="px-3 py-1 bg-neutral-900 hover:bg-neutral-700 text-white border border-neutral-700 rounded text-xs transition-colors cursor-pointer font-bold"
                      title="Darabszám növelése"
                    >
                      +
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded text-xs transition-colors cursor-pointer"
                    >
                      Törlés
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-green-500">Új Asztal Hozzáadása</h2>
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex justify-between items-center">
                <span>⚠️ {errorMessage}</span>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Szektor</label>
                <select
                  required
                  value={formData.szektorId}
                  onChange={(e) =>
                    setFormData({ ...formData, szektorId: parseInt(e.target.value) || 1 })
                  }
                  className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-green-500"
                >
                  <option value="1">Kint</option>
                  <option value="2">Bent - Alsószint</option>
                  <option value="3">Bent - Földszint</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Férőhely (fő/asztal)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={formData.férőhely}
                  onChange={(e) =>
                    setFormData({ ...formData, férőhely: parseInt(e.target.value) || 1 })
                  }
                  className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Darabszám</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={formData.darab}
                  onChange={(e) =>
                    setFormData({ ...formData, darab: parseInt(e.target.value) || 1 })
                  }
                  className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-green-500"
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
                  {loading ? 'Mentés...' : 'Asztal Mentése'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablesPage;