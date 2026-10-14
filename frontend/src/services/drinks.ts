import api from './api';

export interface DrinkQuery {
  text?: string;
  isLimited?: boolean;
}

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
  getAll: async (queryParams?: DrinkQuery): Promise<Drink[]> => {
    const response = await api.get('/piak/admin', {
      params: queryParams,
    });
    return response.data;
  },

  deleteSor: async (id: number) => {
    await api.delete(`/piak/admin/sor/${id}`);
  },

  deleteKoktel: async (id: number) => {
    await api.delete(`/piak/admin/koktel/${id}`);
  },

  createSor: async (sorData: CreateSor) => {
    const formData = new FormData();
    formData.append('nevHu', sorData.nevHu);
    formData.append('nevEn', sorData.nevEn);
    formData.append('nevDe', sorData.nevDe);
    formData.append('leirasHu', sorData.leirasHu);
    formData.append('leirasEn', sorData.leirasEn);
    formData.append('leirasDe', sorData.leirasDe);
    formData.append('tipus', sorData.tipus);
    formData.append('alkoholtartalom', sorData.alkoholtartalom.toString());
    formData.append('isLimited', sorData.isLimited.toString());
    formData.append('file', sorData.file);
    const response = await api.post('/piak/admin/sor', formData);
    return response.data;
  },

  createKoktel: async (koktelData: CreateKoktel) => {
    const formData = new FormData();
    formData.append('nevHu', koktelData.nevHu);
    formData.append('nevEn', koktelData.nevEn);
    formData.append('nevDe', koktelData.nevDe);
    formData.append('osszetevokHu', koktelData.osszetevokHu);
    formData.append('osszetevokEn', koktelData.osszetevokEn);
    formData.append('osszetevokDe', koktelData.osszetevokDe);
    formData.append('leirasHu', koktelData.leirasHu);
    formData.append('leirasEn', koktelData.leirasEn);
    formData.append('leirasDe', koktelData.leirasDe);
    formData.append('isLimited', koktelData.isLimited.toString());
    formData.append('file', koktelData.file);
    const response = await api.post('/piak/admin/koktel', formData);
    return response.data;
  },
};