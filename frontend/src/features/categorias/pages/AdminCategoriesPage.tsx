import { useState } from 'react';
import { createColumnHelper, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useCategorias, useCategoryActions } from '../hooks/useCategories';
import type { Categoria, CategoriaInput } from '../types/category.types';
import CategoriaModal from '../components/CategoriaModal';
import Tabla from '@/shared/components/Tabla';
import { Loading, ErrorNotice, Empty } from '@/shared/components/Pages';
const cols = createColumnHelper<Categoria>();
export function AdminCategoriesPage() {
 const query=useCategorias();const actions=useCategoryActions();
 const [selected,setSelected]=useState<Categoria|null>(null);const [open,setOpen]=useState(false);const [error,setError]=useState<string|null>(null);
 const close=()=>{setOpen(false);setError(null);};
 async function save(data:CategoriaInput){try{if(selected)await actions.update.mutateAsync({id:selected.id,data});else await actions.create.mutateAsync(data);close();}catch(e){setError((e as Error).message);}}
 const table=useReactTable({data:query.data??[],columns:[
 cols.accessor('nombre',{header:'Nombre'}),cols.accessor('descripcion',{header:'Descripción'}),
 cols.display({id:'actions',header:'Acciones',cell:c=><div className="flex gap-2"><button className="btn-secondary" onClick={()=>{setSelected(c.row.original);setOpen(true);}}>Editar</button><button className="btn-secondary" onClick={()=>{if(window.confirm('¿Dar de baja esta categoría?'))actions.remove.mutate(c.row.original.id);}}>Baja</button></div>})
 ],getCoreRowModel:getCoreRowModel(),getPaginationRowModel:getPaginationRowModel()});
 return <section><div className="mb-5 flex items-center justify-between"><h1 className="page-title">Categorías</h1><button className="btn-primary" onClick={()=>{setSelected(null);setOpen(true);}}>Nueva categoría</button></div>
 {actions.remove.isError&&<p className="error">{actions.remove.error.message}</p>}
 {query.isPending?<Loading/>:query.isError?<ErrorNotice error={query.error}/>:!query.data.length?<Empty>No hay categorías.</Empty>:<div className="panel"><Tabla tabla={table}/></div>}
 {open&&<CategoriaModal key={selected?.id??'nuevo'} actual={selected} guardar={save} cerrar={close} error={error}/>}</section>;
}
