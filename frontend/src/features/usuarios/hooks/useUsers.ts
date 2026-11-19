import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import type { User } from '@/features/auth/types/auth.types';
export const useUsuarios = () => useQuery({queryKey:['usuarios'],queryFn:async() => (await api.get<User[]>('/admin/usuarios')).data});
export function useUsuarioStatus() {
 const qc=useQueryClient();
 return useMutation({mutationFn: async({id,disabled}:{id:number;disabled:boolean})=>
 (await api.post<User>(`/admin/usuarios/${id}/${disabled?'desactivar':'activar'}`)).data,
 onSuccess:()=>qc.invalidateQueries({queryKey:['usuarios']})});
}
