import type React from 'react';
import { useState, useEffect } from 'react';
import {
    openingHoursService,
    type Nyitvatartas,
    type UpdateNyitvatartas,
} from '../services/openingHours';

export const OpeningHoursPage: React.FC = () => {
    const [openingHours, setOpeningHours] = useState<Nyitvatartas[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<Nyitvatartas | null>(null);
    const [formData, setFormData] = useState<UpdateNyitvatartas>({
        nyitas: '16:00',
        zaras: '00:00',
        isZarva: false,
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

    const fetchOpeningHours = async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const data = await openingHoursService.getAll();
            setOpeningHours(data);
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
                const data = await openingHoursService.getAll();
                if (isMounted) setOpeningHours(data);
            } catch (error: unknown) {
                if (isMounted) setErrorMessage(getBackendErrorMessage(error));
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, []);

    const handleEditClick = (item: Nyitvatartas) => {
        setEditingItem(item);
        const formatTime = (timeStr: string) => {
            if (!timeStr) return '00:00';
            const parts = timeStr.split(':');
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        };
        setFormData({
            nyitas: formatTime(item.nyitas),
            zaras: formatTime(item.zaras),
            isZarva: item.isZarva,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        setLoading(true);
        setErrorMessage(null);
        try {
            await openingHoursService.update(editingItem.id, formData);
            setEditingItem(null);
            fetchOpeningHours();
        } catch (error: unknown) {
            setErrorMessage(getBackendErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-neutral-900 min-h-screen text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-green-500">Nyitvatartás Kezelése</h1>
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
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm text-neutral-300">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase text-xs border-b border-neutral-700">
                        <tr>
                            <th className="p-4">Nap</th>
                            <th className="p-4">Nyitás</th>
                            <th className="p-4">Zárás</th>
                            <th className="p-4">Státusz</th>
                            <th className="p-4 text-center">Művelet</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-700">
                        {openingHours.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-6 text-center text-neutral-500">
                                    {loading ? 'Adatok betöltése...' : 'Nincsenek nyitvatartási adatok.'}
                                </td>
                            </tr>
                        ) : (
                            openingHours.map((item) => (
                                <tr key={item.id} className="hover:bg-neutral-750 transition-colors">
                                    <td className="p-4 font-semibold text-white">{item.napNevHu}</td>
                                    <td className="p-4">
                                        {item.isZarva ? (
                                            <span className="text-neutral-500 italic">-</span>
                                        ) : (
                                            <span className="font-mono text-neutral-200">{item.nyitas?.substring(0, 5)}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {item.isZarva ? (
                                            <span className="text-neutral-500 italic">-</span>
                                        ) : (
                                            <span className="font-mono text-neutral-200">{item.zaras?.substring(0, 5)}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {item.isZarva ? (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                                                ZÁRVA
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                                                NYITVA
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="px-3 py-1 bg-neutral-900 hover:bg-neutral-700 text-white border border-neutral-700 rounded text-xs transition-colors cursor-pointer"
                                        >
                                            Szerkesztés
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {editingItem && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4 text-green-500">
                            {editingItem.napNevHu} - Nyitvatartás Módosítása
                        </h2>
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
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex items-center gap-2 bg-neutral-900 p-3 rounded-lg border border-neutral-700">
                                <input
                                    type="checkbox"
                                    id="isZarva"
                                    checked={formData.isZarva}
                                    onChange={(e) => setFormData({ ...formData, isZarva: e.target.checked })}
                                    className="rounded border-neutral-700 bg-neutral-900 text-green-600 focus:ring-0 cursor-pointer"
                                />
                                <label htmlFor="isZarva" className="text-sm font-semibold text-white cursor-pointer">
                                    A bár ezen a napon egész nap ZÁRVA tart
                                </label>
                            </div>
                            {!formData.isZarva && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 text-neutral-300">
                                            Nyitás időpontja
                                        </label>
                                        <input
                                            type="time"
                                            required={!formData.isZarva}
                                            value={formData.nyitas}
                                            onChange={(e) => setFormData({ ...formData, nyitas: e.target.value })}
                                            className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-green-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 text-neutral-300">
                                            Zárás időpontja
                                        </label>
                                        <input
                                            type="time"
                                            required={!formData.isZarva}
                                            value={formData.zaras}
                                            onChange={(e) => setFormData({ ...formData, zaras: e.target.value })}
                                            className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-green-500 font-mono"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-700">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg font-semibold text-sm cursor-pointer"
                                >
                                    Mégse
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-sm disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? 'Mentés...' : 'Mentés'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OpeningHoursPage;