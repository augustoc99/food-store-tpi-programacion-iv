import { useState } from 'react';
import { createColumnHelper,getCoreRowModel,getPaginationRowModel,useReactTable } from '@tanstack/react-table';
import { useCategorias } from '@/features/categorias/hooks/useCategories';
import { useProductActions,useProductos } from '../hooks/useProducts';
import { ProductModal } from '../components/ProductModal';
import type { Producto,ProductoInput } from '../types/product.types';
import Tabla from '@/shared/components/Tabla';
import { Loading, ErrorNotice, Empty, Pager } from '@/shared/components/Pages';
const cols=createColumnHelper<Producto>();
export function AdminProductsPage() {
 const [skip,setSkip]=useState(0),[selected,setSelected]=useState<Producto|null>(null),[open,setOpen]=useState(false),[error,setError]=useState<string|null>(null);
 const query=useProductos({skip,limit:100});const cats=useCategorias();const act=useProductActions();
 const close=()=>{setOpen(false);setError(null);};
 async function save(data:ProductoInput){try{if(selected)await act.update.mutateAsync({id:selected.id,data});else await act.create.mutateAsync(data);close();}catch(e){setError((e as Error).message);}}
 function editStock(p:Producto){const newStock=window.prompt(`Nuevo stock de ${p.nombre}`,String(p.stock));if(newStock===null)return;const stock=Number(newStock);
 if(!Number.isSafeInteger(stock)||stock<0){window.alert('Ingresá un número entero mayor o igual a cero');return;}
 const available=window.confirm('¿Marcar producto como disponible?');act.stock.mutate({id:p.id,stock,disponible:available});}
 const table=useReactTable({data:query.data?.items??[],columns:[
 cols.accessor('nombre',{header:'Nombre'}),cols.accessor('categoria.nombre',{header:'Categoría'}),
 cols.accessor('precio_base',{header:'Precio',cell:i=>i.getValue().toLocaleString('es-AR',{style:'currency',currency:'ARS'})}),
 cols.accessor('stock',{header:'Stock'}),cols.accessor('disponible',{header:'Disponible',cell:i=>i.getValue()?'Sí':'No'}),
 cols.display({id:'actions',header:'Acciones',cell:i=><div className="flex flex-wrap gap-1"><button className="btn-secondary" onClick={()=>{setSelected(i.row.original);setOpen(true);}}>Editar</button><button className="btn-secondary" onClick={()=>editStock(i.row.original)}>Stock</button><button className="btn-secondary" onClick={()=>{if(window.confirm('¿Dar de baja el producto?'))act.remove.mutate(i.row.original.id);}}>Baja</button></div>})
 ],getCoreRowModel:getCoreRowModel(),getPaginationRowModel:getPaginationRowModel()});
 return <section><div className="mb-5 flex items-center justify-between"><h1 className="page-title">Productos y stock</h1><button className="btn-primary" disabled={!cats.data?.length} onClick={()=>{setSelected(null);setOpen(true);}}>Nuevo producto</button></div>
 {[act.stock.error,act.remove.error].filter(Boolean).map((e,i)=><p key={i} className="error">{e?.message}</p>)}
 {query.isPending?<Loading/>:query.isError?<ErrorNotice error={query.error}/>:query.data.items.length===0?<Empty>No hay productos.</Empty>:<div className="panel"><Tabla tabla={table}/></div>}
 {query.data&&<Pager skip={skip} limit={100} total={query.data.total} setSkip={setSkip}/>}
 {open&&cats.data&&<ProductModal key={selected?.id??'nuevo'} actual={selected} categories={cats.data} guardar={save} cerrar={close} error={error}/>}</section>;
}
