import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productosApi, type SearchParams } from '../api/productosApi';
export const useProductos = (params: SearchParams) => useQuery({ queryKey: ['productos', params], queryFn: () => productosApi.list(params) });
export function useProductActions() {
 const qc = useQueryClient();
 const ok = () => qc.invalidateQueries({ queryKey: ['productos'] });
 return {
  create: useMutation({ mutationFn: productosApi.create, onSuccess: ok }),
  update: useMutation({ mutationFn: ({ id, data }: { id: number; data: Parameters<typeof productosApi.update>[1] }) => productosApi.update(id, data), onSuccess: ok }),
  stock: useMutation({ mutationFn: ({ id, stock, disponible }: { id: number; stock: number; disponible: boolean }) => productosApi.stock(id, stock, disponible), onSuccess: ok }),
  remove: useMutation({ mutationFn: productosApi.remove, onSuccess: ok }),
 };
}
