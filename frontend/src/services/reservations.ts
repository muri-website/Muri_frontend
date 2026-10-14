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
  getAll: async (query?: FoglalasQuery): Promise<Foglalas[]> => {
    const response = await api.get('/foglalasok/admin', {
      params: query ? query : undefined,
    });
    return response.data;
  },

  approveStatus: async (id: number) => {
    const response = await api.put(`/foglalasok/admin/${id}/approve`);
    return response.data;
  },

  rejectStatus: async (id: number, reason: string) => {
    const response = await api.put(`/foglalasok/admin/${id}/reject`, { reason });
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/foglalasok/admin/${id}`);
  },

  create: async (foglalas: CreateFoglalas) => {
    const response = await api.post('/foglalasok', foglalas);
    return response.data;
  }
};