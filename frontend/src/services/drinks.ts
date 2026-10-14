import api from './api';

export interface Drink {
  id: number;
  nev: string;
  tipus: string;
  isLimited: boolean;
}

export interface CreateSor {
  nevHu: string;
  nevEn: string;
  nevDe: string;
  leirasHu: string;
  leirasEn: string;
  leirasDe: string;
  tipus: string;
  alkoholtartalom: number;
  isLimited: boolean;
  file: File;
}

export interface CreateKoktel {
  nevHu: string;
  nevEn: string;
  nevDe: string;
  osszetevokHu: string;
  osszetevokEn: string;
  osszetevokDe: string;
  leirasHu: string;
  leirasEn: string;
  leirasDe: string;
  isLimited: boolean;
  file: File;
}

export const drinkService = {
  getAll: async (text?: string): Promise<Drink[]> => {
    const response = await api.get('/piak/admin', {
      params: text ? { text } : undefined,
    });
    return response.data;
  },

  deleteSor: async (id: number) => {
    await api.delete(`/piak/admin/sor/${id}`);
  },

  deleteKoktel: async (id: number) => {
    await api.delete(`/piak/admin/koktel/${id}`);
  },

  createSor: async (model: CreateSor) => {
    const formData = new FormData();
    formData.append('nevHu', model.nevHu);
    formData.append('nevEn', model.nevEn);
    formData.append('nevDe', model.nevDe);
    formData.append('leirasHu', model.leirasHu);
    formData.append('leirasEn', model.leirasEn);
    formData.append('leirasDe', model.leirasDe);
    formData.append('tipus', model.tipus);
    formData.append('alkoholtartalom', model.alkoholtartalom.toString());
    formData.append('isLimited', model.isLimited.toString());
    formData.append('file', model.file);
    const response = await api.post('/piak/admin/sor', formData);
    return response.data;
  },

  createKoktel: async (model: CreateKoktel) => {
    const formData = new FormData();
    formData.append('nevHu', model.nevHu);
    formData.append('nevEn', model.nevEn);
    formData.append('nevDe', model.nevDe);
    formData.append('osszetevokHu', model.osszetevokHu);
    formData.append('osszetevokEn', model.osszetevokEn);
    formData.append('osszetevokDe', model.osszetevokDe);
    formData.append('leirasHu', model.leirasHu);
    formData.append('leirasEn', model.leirasEn);
    formData.append('leirasDe', model.leirasDe);
    formData.append('isLimited', model.isLimited.toString());
    formData.append('file', model.file);
    const response = await api.post('/piak/admin/koktel', formData);
    return response.data;
  },
};