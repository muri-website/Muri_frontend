import type React from 'react';
import { useState, useEffect } from 'react';
import {
    drinkService,
    type Drink,
    type CreateSor,
    type CreateKoktel,
} from '../services/drinks';

export const DrinksPage: React.FC = () => {
    const [drinks, setDrinks] = useState<Drink[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [textFilter, setTextFilter] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [drinkType, setDrinkType] = useState<'sor' | 'koktel'>('sor');
    const [file, setFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLimited, setIsLimited] = useState<boolean>(false);
    const [sorData, setSorData] = useState({
        nevHu: '', nevEn: '', nevDe: '',
        leirasHu: '', leirasEn: '', leirasDe: '',
        tipus: 'Craft', alkoholtartalom: 5.0,
    });
    const [koktelData, setKoktelData] = useState({
        nevHu: '', nevEn: '', nevDe: '',
        osszetevokHu: '', osszetevokEn: '', osszetevokDe: '',
        leirasHu: '', leirasEn: '', leirasDe: '',
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

    const fetchDrinks = async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const data = await drinkService.getAll({
                text: textFilter || undefined
            });
            setDrinks(data);
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
                const data = await drinkService.getAll();
                if (isMounted) setDrinks(data);
            } catch (err: unknown) {
                if (isMounted) setErrorMessage(getBackendErrorMessage(err));
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, []);

    const handleDelete = async (id: number, tipus: string) => {
        if (!confirm('Biztosan törölni szeretnéd ezt az italt?')) return;
        try {
            if (tipus.toLowerCase().includes('sor') || tipus === 'sor') {
                await drinkService.deleteSor(id);
            } else {
                await drinkService.deleteKoktel(id);
            }
            fetchDrinks();
        } catch (error: unknown) {
            setErrorMessage(getBackendErrorMessage(error));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert('Kérlek válassz ki egy képet!');
            return;
        }
        setLoading(true);
        setErrorMessage(null);
        try {
            if (drinkType === 'sor') {
                const payload: CreateSor = {
                    ...sorData,
                    isLimited,
                    file,
                };
                await drinkService.createSor(payload);
            } else {
                const payload: CreateKoktel = {
                    ...koktelData,
                    isLimited,
                    file,
                };
                await drinkService.createKoktel(payload);
            }
            setIsModalOpen(false);
            fetchDrinks();
            setFile(null);
        } catch (error: unknown) {
            setErrorMessage(getBackendErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-neutral-900 min-h-screen text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-green-500">Itallap Kezelése</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                    + Új Ital Hozzáadása
                </button>
            </div>
            {errorMessage && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex justify-between items-center">
                    <span>⚠️ {errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)} className="text-neutral-400 hover:text-white">✕</button>
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <input
                    type="text"
                    placeholder="Keresés név alapján..."
                    value={textFilter}
                    onChange={(e) => setTextFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                />
                <button
                    onClick={fetchDrinks}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors cursor-pointer"
                >
                    Szűrés
                </button>
            </div>
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
                <table className="w-full text-left text-sm text-neutral-300">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase text-xs">
                        <tr>
                            <th className="p-4">Név</th>
                            <th className="p-4">Típus</th>
                            <th className="p-4">Kiadás</th>
                            <th className="p-4 text-center">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-700">
                        {drinks.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-6 text-center text-neutral-500">
                                    {loading ? 'Betöltés...' : 'Nincsenek italok.'}
                                </td>
                            </tr>
                        ) : (
                            drinks.map((item) => (
                                <tr key={item.id} className="hover:bg-neutral-750">
                                    <td className="p-4 font-semibold text-white">{item.nev}</td>
                                    <td className="p-4 capitalize">{item.tipus}</td>
                                    <td className="p-4">
                                        {item.isLimited ? (
                                            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-semibold">
                                                Limited
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded text-xs">
                                                Normál
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleDelete(item.id, item.tipus)}
                                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded text-xs transition-colors"
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
                        <h2 className="text-xl font-bold mb-4 text-green-500">Új Ital Hozzáadása</h2>
                        {errorMessage && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex justify-between items-center">
                                <span>⚠️ {errorMessage}</span>
                                <button onClick={() => setErrorMessage(null)} className="text-neutral-400 hover:text-white">✕</button>
                            </div>
                        )}
                        <div className="flex gap-4 mb-6 border-b border-neutral-700 pb-3">
                            <button
                                type="button"
                                onClick={() => setDrinkType('sor')}
                                className={`px-4 py-2 rounded-lg font-semibold ${drinkType === 'sor' ? 'bg-green-600 text-white' : 'bg-neutral-700 text-neutral-300'
                                    }`}
                            >
                                🍺 Sör
                            </button>
                            <button
                                type="button"
                                onClick={() => setDrinkType('koktel')}
                                className={`px-4 py-2 rounded-lg font-semibold ${drinkType === 'koktel' ? 'bg-green-600 text-white' : 'bg-neutral-700 text-neutral-300'
                                    }`}
                            >
                                🍸 Koktél
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Név (HU)</label>
                                    <input
                                        type="text"
                                        required
                                        value={drinkType === 'sor' ? sorData.nevHu : koktelData.nevHu}
                                        onChange={(e) =>
                                            drinkType === 'sor'
                                                ? setSorData({ ...sorData, nevHu: e.target.value })
                                                : setKoktelData({ ...koktelData, nevHu: e.target.value })
                                        }
                                        className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Név (EN)</label>
                                    <input
                                        type="text"
                                        required
                                        value={drinkType === 'sor' ? sorData.nevEn : koktelData.nevEn}
                                        onChange={(e) =>
                                            drinkType === 'sor'
                                                ? setSorData({ ...sorData, nevEn: e.target.value })
                                                : setKoktelData({ ...koktelData, nevEn: e.target.value })
                                        }
                                        className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Név (DE)</label>
                                    <input
                                        type="text"
                                        required
                                        value={drinkType === 'sor' ? sorData.nevDe : koktelData.nevDe}
                                        onChange={(e) =>
                                            drinkType === 'sor'
                                                ? setSorData({ ...sorData, nevDe: e.target.value })
                                                : setKoktelData({ ...koktelData, nevDe: e.target.value })
                                        }
                                        className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Leírás (HU)</label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={drinkType === 'sor' ? sorData.leirasHu : koktelData.leirasHu}
                                        onChange={(e) =>
                                            drinkType === 'sor'
                                                ? setSorData({ ...sorData, leirasHu: e.target.value })
                                                : setKoktelData({ ...koktelData, leirasHu: e.target.value })
                                        }
                                        className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Leírás (EN)</label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={drinkType === 'sor' ? sorData.leirasEn : koktelData.leirasEn}
                                        onChange={(e) =>
                                            drinkType === 'sor'
                                                ? setSorData({ ...sorData, leirasEn: e.target.value })
                                                : setKoktelData({ ...koktelData, leirasEn: e.target.value })
                                        }
                                        className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Leírás (DE)</label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={drinkType === 'sor' ? sorData.leirasDe : koktelData.leirasDe}
                                        onChange={(e) =>
                                            drinkType === 'sor'
                                                ? setSorData({ ...sorData, leirasDe: e.target.value })
                                                : setKoktelData({ ...koktelData, leirasDe: e.target.value })
                                        }
                                        className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                                    />
                                </div>
                            </div>
                            {drinkType === 'sor' ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Sör Típusa (pl. IPA, Lager)</label>
                                        <input
                                            type="text"
                                            required
                                            value={sorData.tipus}
                                            onChange={(e) => setSorData({ ...sorData, tipus: e.target.value })}
                                            className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Alkoholtartalom (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            required
                                            value={sorData.alkoholtartalom}
                                            onChange={(e) => setSorData({ ...sorData, alkoholtartalom: parseFloat(e.target.value) || 0 })}
                                            className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Összetevők (HU)</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Vodka, Narancslé..."
                                            value={koktelData.osszetevokHu}
                                            onChange={(e) => setKoktelData({ ...koktelData, osszetevokHu: e.target.value })}
                                            className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Összetevők (EN)</label>
                                        <input
                                            type="text"
                                            required
                                            value={koktelData.osszetevokEn}
                                            onChange={(e) => setKoktelData({ ...koktelData, osszetevokEn: e.target.value })}
                                            className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Összetevők (DE)</label>
                                        <input
                                            type="text"
                                            required
                                            value={koktelData.osszetevokDe}
                                            onChange={(e) => setKoktelData({ ...koktelData, osszetevokDe: e.target.value })}
                                            className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white"
                                        />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold mb-1">Kép feltöltése (Cloudinary)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    required
                                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-neutral-400"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isLimited"
                                    checked={isLimited}
                                    onChange={(e) => setIsLimited(e.target.checked)}
                                    className="rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-0"
                                />
                                <label htmlFor="isLimited" className="text-sm font-semibold">
                                    Szezonális / Limited kiadás
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg font-semibold text-sm"
                                >
                                    Mégse
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-sm disabled:opacity-50"
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

export default DrinksPage;