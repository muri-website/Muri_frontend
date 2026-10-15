import api from "./api";

export interface CreateAsztal {
    szektorId: number;
    férőhely: number;
    darab: number;
}

export interface Asztal {
    id: number;
    férőhely: number;
    darab: number;
    szektorNev: string;
}

export const tableService = {
    getAll: async (): Promise<Asztal[]> => {
        const response = await api.get('/beallitasok/admin/asztalok');
        return response.data;
    },

    create: async (asztal: CreateAsztal) => {
        const response = await api.post('/beallitasok/admin/asztalok', asztal);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/beallitasok/admin/asztalok/${id}`);
        return response.data;
    },

    minus: async (id: number) => {
        const response = await api.put(`/beallitasok/admin/asztalok/remove/${id}`);
        return response.data;
    },

    plus: async (id: number) => {
        const response = await api.put(`/beallitasok/admin/asztalok/add/${id}`);
        return response.data;
    },

    kintGet: async (): Promise<boolean> => {
        const response = await api.get('/beallitasok/kint');
        return response.data;
    },

    setKint: async (enabled: boolean) => {
        const response = await api.put('/beallitasok/admin/kint', enabled);
        return response.data;
    }
};