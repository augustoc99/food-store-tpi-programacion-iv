import { api } from '@/shared/api/api';
import type { Producto, ProductoInput, ProductosPaginados } from '../types/product.types';
export type SearchParams = { skip: number; limit: number; search?: string; categoria_id?: number; disponible?: boolean };
export const productosApi = {
 list: async (params: SearchParams) => (await api.get<ProductosPaginados>('/productos', { params })).data,
 create: async (input: ProductoInput) => (await api.post<Producto>('/productos', input)).data,
 update: async (id: number, input: Partial<ProductoInput>) => (await api.put<Producto>(`/productos/${id}`, input)).data,
 stock: async (id: number, stock: number, disponible: boolean) =>
   (await api.patch<Producto>(`/productos/${id}/stock`, { stock, disponible })).data,
 remove: async (id: number) => api.delete(`/productos/${id}`),
};
