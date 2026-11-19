import { createColumnHelper, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useAuthStore } from '@/store/authStore';
import Tabla from '@/shared/components/Tabla';
import Estados from '@/shared/components/Estados';
import type { User } from '@/features/auth/types/auth.types';
import { useUsuarios, useUsuarioStatus } from '../hooks/useUsers';

const helper = createColumnHelper<User>();
export default function AdminUsersPage() {
  const current = useAuthStore((s) => s.user);
  const users = useUsuarios();
  const mutation = useUsuarioStatus();
  const table = useReactTable({ data: users.data ?? [], columns: [
    helper.accessor('username', { header: 'Usuario' }), helper.accessor('full_name', { header: 'Nombre' }),
    helper.accessor('email', { header: 'Email' }), helper.accessor('role', { header: 'Rol' }),
    helper.accessor('disabled', { header: 'Estado', cell: (c) => c.getValue() ? 'Desactivado' : 'Activo' }),
    helper.display({ id: 'action', header: 'Acción', cell: (c) => current?.id === c.row.original.id ? 'Cuenta propia'
      : <button className="btn-secondary" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: c.row.original.id, disabled: !c.row.original.disabled })}>
        {c.row.original.disabled ? 'Activar' : 'Desactivar'}</button> })
  ], getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel() });
  return <section><h1 className="page-title">Administración de usuarios</h1>
    {mutation.isError && <p role="alert" className="error">{mutation.error.message}</p>}
    {users.isPending ? <Estados tipo="carga" /> : users.isError ? <Estados tipo="error" mensaje={users.error.message} />
      : <div className="panel"><Tabla tabla={table} /></div>}</section>;
}
