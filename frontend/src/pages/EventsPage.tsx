import type React from 'react';
import { useState, useEffect } from 'react';
import {
    eventService,
    type Esemeny,
    type CreateEsemeny,
} from '../services/events';

export const EventsPage: React.FC = () => {
    const [events, setEvents] = useState<Esemeny[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [textFilter, setTextFilter] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [formData, setFormData] = useState<{
        cimHu: string;
        cimEn: string;
        cimDe: string;
        leirasHu: string;
        leirasEn: string;
        leirasDe: string;
        kezdet: string;
        veg: string;
    }>({
        cimHu: '',
        cimEn: '',
        cimDe: '',
        leirasHu: '',
        leirasEn: '',
        leirasDe: '',
        kezdet: '',
        veg: '',
    });
    const [kep, setKep] = useState<File | null>(null);

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

    const fetchEvents = async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const data = await eventService.getAll(textFilter || undefined);
            setEvents(data);
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
                const data = await eventService.getAll();
                if (isMounted) setEvents(data);
            } catch (error: unknown) {
                if (isMounted) setErrorMessage(getBackendErrorMessage(error));
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadData();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Biztosan törölni szeretnéd ezt az eseményt?')) return;
        setErrorMessage(null);
        try {
            await eventService.delete(id);
            fetchEvents();
        } catch (error: unknown) {
            setErrorMessage(getBackendErrorMessage(error));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);
        try {
            const payload: CreateEsemeny = {
                cimHu: formData.cimHu,
                cimEn: formData.cimEn || undefined,
                cimDe: formData.cimDe || undefined,
                leirasHu: formData.leirasHu || undefined,
                leirasEn: formData.leirasEn || undefined,
                leirasDe: formData.leirasDe || undefined,
                kezdet: formData.kezdet ? new Date(formData.kezdet) : undefined,
                veg: formData.veg ? new Date(formData.veg) : undefined,
                kep: kep || undefined,
            };
            await eventService.create(payload);
            setIsModalOpen(false);
            fetchEvents();
            setFormData({
                cimHu: '',
                cimEn: '',
                cimDe: '',
                leirasHu: '',
                leirasEn: '',
                leirasDe: '',
                kezdet: '',
                veg: '',
            });
            setKep(null);
        } catch (error: unknown) {
            setErrorMessage(getBackendErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-neutral-900 min-h-screen text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-green-500">Események Kezelése</h1>
                <button
                    onClick={() => (setIsModalOpen(true), setErrorMessage(null))}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                    <span>+</span> Új Esemény
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <input
                    type="text"
                    placeholder="Keresés cím alapján..."
                    value={textFilter}
                    onChange={(e) => setTextFilter(e.target.value)}
                    className="w-full sm:col-span-2 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                />
                <button
                    onClick={fetchEvents}
                    disabled={loading}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                    {loading ? 'Keresés...' : 'Szűrés'}
                </button>
            </div>
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm text-neutral-300">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase text-xs border-b border-neutral-700">
                        <tr>
                            <th className="p-4">Cím</th>
                            <th className="p-4">Kezdet</th>
                            <th className="p-4">Vég</th>
                            <th className="p-4">Létrehozva</th>
                            <th className="p-4 text-center">Művelet</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-700">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-6 text-center text-neutral-500">
                                    {loading ? 'Adatok betöltése...' : 'Nincs a feltételeknek megfelelő esemény.'}
                                </td>
                            </tr>
                        ) : (
                            events.map((item) => (
                                <tr key={item.id} className="hover:bg-neutral-750 transition-colors">
                                    <td className="p-4 font-semibold text-white">{item.cimHu}</td>
                                    <td className="p-4 text-neutral-400">
                                        {item.kezdet ? (
                                            new Date(item.kezdet).toLocaleString('hu-HU', {
                                                dateStyle: 'short',
                                                timeStyle: 'short',
                                            })
                                        ) : (
                                            <span className="text-neutral-500 italic">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-neutral-400">
                                        {item.veg ? (
                                            new Date(item.veg).toLocaleString('hu-HU', {
                                                dateStyle: 'short',
                                                timeStyle: 'short',
                                            })
                                        ) : (
                                            <span className="text-neutral-500 italic">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-neutral-400">
                                        {new Date(item.createdAt).toLocaleString('hu-HU', {
                                            dateStyle: 'short',
                                            timeStyle: 'short',
                                        })}
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
                    <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-green-500">
                            Új Esemény Hozzáadása
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Cím (HU) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.cimHu}
                                        onChange={(e) => setFormData({ ...formData, cimHu: e.target.value })}
                                        className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Cím (EN)</label>
                                    <input
                                        type="text"
                                        value={formData.cimEn}
                                        onChange={(e) => setFormData({ ...formData, cimEn: e.target.value })}
                                        className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Cím (DE)</label>
                                    <input
                                        type="text"
                                        value={formData.cimDe}
                                        onChange={(e) => setFormData({ ...formData, cimDe: e.target.value })}
                                        className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-green-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Leírás (HU)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.leirasHu}
                                        onChange={(e) => setFormData({ ...formData, leirasHu: e.target.value })}
                                        className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Leírás (EN)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.leirasEn}
                                        onChange={(e) => setFormData({ ...formData, leirasEn: e.target.value })}
                                        className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Leírás (DE)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.leirasDe}
                                        onChange={(e) => setFormData({ ...formData, leirasDe: e.target.value })}
                                        className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-green-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Kezdeti időpont</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.kezdet}
                                        onChange={(e) => setFormData({ ...formData, kezdet: e.target.value })}
                                        className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Befejező időpont</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.veg}
                                        onChange={(e) => setFormData({ ...formData, veg: e.target.value })}
                                        className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-green-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Borítókép (Opcionális)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setKep(e.target.files ? e.target.files[0] : null)}
                                    className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-neutral-400"
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
                                    {loading ? 'Mentés...' : 'Esemény Mentése'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventsPage;