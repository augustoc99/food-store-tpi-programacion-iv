import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pedidosApi } from '../api/pedidosApi';
import type { Estado } from '../types/pedido.types';
export const usePedidos = (skip=0, estado?: Estado) => useQuery({queryKey:['pedidos',skip,estado],queryFn:()=>pedidosApi.list(skip,20,estado)});
export function usePedidoActions() {
 const qc = useQueryClient();
 const invalidate = async () => { await qc.invalidateQueries({queryKey:['pedidos']}); await qc.invalidateQueries({queryKey:['resumen']}); await qc.invalidateQueries({queryKey:['productos']}); };
 return {
  create: useMutation({mutationFn:pedidosApi.create,onSuccess:invalidate}),
  cancel: useMutation({mutationFn:pedidosApi.cancel,onSuccess:invalidate}),
  estado: useMutation({mutationFn:({id,estado}:{id:number;estado:Estado})=>pedidosApi.estado(id,estado),onSuccess:invalidate}),
 };
}
