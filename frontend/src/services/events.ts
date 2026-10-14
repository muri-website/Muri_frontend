import api from "./api";

export interface CreateEsemeny {
    cimHu: string;
    cimEn?: string;
    cimDe?: string;
    leirasHu?: string;
    leirasEn?: string;
    leirasDe?: string;
    kezdet?: Date;
    veg?: Date;
    kep?: File;
}

export interface Esemeny {
    id: number;
    cimHu: string;
    createdAt: Date;
}

export const eventService = {
    getAll: async (text?: string): Promise<Esemeny[]> => {
        const response = await api.get('/esemenyek/admin', {
            params: text ? { text } : undefined
        });
        return response.data;
    },

    create: async (model: CreateEsemeny) => {
        const formData = new FormData();
        formData.append('cimHu', model.cimHu);
        if (model.cimEn) {
            formData.append('cimEn', model.cimEn);
        }
        if (model.cimDe) {
            formData.append('cimDe', model.cimDe);
        }
        if (model.leirasHu) {
            formData.append('leirasHu', model.leirasHu);
        }
        if (model.leirasEn) {
            formData.append('leirasEn', model.leirasEn);
        }
        if (model.leirasDe) {
            formData.append('leirasDe', model.leirasDe);
        }
        if (model.kezdet) {
            formData.append('kezdet', model.kezdet.toISOString());
        }
        if (model.veg) {
            formData.append('veg', model.veg.toISOString());
        }
        if (model.kep) {
            formData.append('kep', model.kep);
        }
        const response = await api.post('/esemenyek/admin', formData);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/esemenyek/admin/${id}`);
    }
};