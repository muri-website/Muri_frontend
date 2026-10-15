import api from "./api";

export interface Nyitvatartas {
    id: number;
    napHetfoVasarnap: number;
    nyitas: string;
    zaras: string;
    isZarva: boolean;
    napNevHu: string;
    napNevDe: string;
    napNevEn: string;
}

export interface UpdateNyitvatartas {
    nyitas?: string;
    zaras?: string;
    isZarva?: boolean;
}

export const openingHoursService = {
    getAll: async (): Promise<Nyitvatartas[]> => {
        const response = await api.get('/beallitasok/nyitvatartas');
        return response.data;
    },

    update: async (id: number, model: UpdateNyitvatartas) => {
        const response = await api.put(`/beallitasok/admin/nyitvatartas/${id}`, model);
        return response.data;
    }
};