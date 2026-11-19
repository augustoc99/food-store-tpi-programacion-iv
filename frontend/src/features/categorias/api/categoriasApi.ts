import { api } from '@/shared/api/api';
import type { Categoria, CategoriaInput } from '../types/category.types';
export const categoriasApi = {
 list: async () => (await api.get<Categoria[]>('/categorias')).data,
 create: async (value: CategoriaInput) => (await api.post<Categoria>('/categorias', value)).data,
 update: async (id: number, value: CategoriaInput) => (await api.put<Categoria>(`/categorias/${id}`, value)).data,
 remove: async (id: number) => api.delete(`/categorias/${id}`),
};
