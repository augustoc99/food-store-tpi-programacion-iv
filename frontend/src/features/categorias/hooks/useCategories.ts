import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '../api/categoriasApi';
export const useCategorias = () => useQuery({ queryKey: ['categorias'], queryFn: categoriasApi.list });
export function useCategoryActions() {
 const qc = useQueryClient();
 const ok = () => qc.invalidateQueries({ queryKey: ['categorias'] });
 return {
  create: useMutation({ mutationFn: categoriasApi.create, onSuccess: ok }),
  update: useMutation({ mutationFn: ({ id, data }: { id: number; data: Parameters<typeof categoriasApi.create>[0] }) => categoriasApi.update(id, data), onSuccess: ok }),
  remove: useMutation({ mutationFn: categoriasApi.remove, onSuccess: ok }),
 };
}
