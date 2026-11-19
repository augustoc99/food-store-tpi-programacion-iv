import { api } from '@/shared/api/api';
import type { Pedido, PedidoInput, Estado, ResumenPedidos } from '../types/pedido.types';
export const pedidosApi = {
 create: async (data: PedidoInput) => (await api.post<Pedido>('/pedidos',data)).data,
 list: async (skip=0, limit=20, estado?: Estado) => (await api.get<{total: number; items: Pedido[]}>('/pedidos',{ params: { skip, limit, estado } })).data,
 cancel: async (id: number) => (await api.patch<Pedido>(`/pedidos/${id}/cancelar`)).data,
 estado: async (id: number, estado: Estado) => (await api.patch<Pedido>(`/pedidos/${id}/estado`, {estado})).data,
 resumen: async () => (await api.get<ResumenPedidos>('/pedidos/resumen')).data,
};
