import api from './api';

export interface FoglalasQuery {
  mikor?: string;
  status?: string;
  text?: string;
}

export interface Foglalas {
  id: number;
  nev: string;
  email: string;
  fo: number;
  mikor: string;
  status: string;
  megjegyzés?: string;
  szektorNev: string;
}

export interface CreateFoglalas {
  nev: string;
  email: string;
  fo: number;
  mikor: string;
  szektorId: number;
  megjegyzés: string;
}

export const reservationService = {
  getAll: async (queryParams?: FoglalasQuery): Promise<Foglalas[]> => {
    const response = await api.get('/foglalasok/admin', {
      params: queryParams,
    });
    return response.data;
  },

  approveStatus: async (id: number) => {
    const response = await api.put(`/foglalasok/admin/${id}/approve`);
    return response.data;
  },

  rejectStatus: async (id: number) => {
    const response = await api.put(`/foglalasok/admin/${id}/reject`);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/foglalasok/admin/${id}`);
  },

  create: async (data: CreateFoglalas) => {
    const response = await api.post('/foglalasok', data);
    return response.data;
  }
};