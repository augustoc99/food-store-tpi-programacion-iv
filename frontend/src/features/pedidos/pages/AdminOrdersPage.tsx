import { useState } from 'react';
import type { Estado } from '../types/pedido.types';
import { usePedidoActions, usePedidos } from '../hooks/usePedidos';
import { money, BadgeEstado } from '../components/OrderCard';
import { createColumnHelper, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import Tabla from '@/shared/components/Tabla';
import type { Pedido } from '../types/pedido.types';
import { Empty, ErrorNotice, Loading } from '@/shared/components/Pages';
const col = createColumnHelper<Pedido>();
export function AdminOrdersPage() {
 const [estado,setEstado]=useState<Estado|undefined>();const [skip,setSkip]=useState(0);
 const query=usePedidos(skip,estado); const act=usePedidoActions();
 const advance:Record<Estado,Estado|null>={PENDIENTE:'EN_PREPARACION',EN_PREPARACION:'ENTREGADO',ENTREGADO:null,CANCELADO:null};
 const table = useReactTable({data:query.data?.items??[],columns:[
  col.accessor('id',{header:'Nº'}),
  col.accessor('created_at',{header:'Fecha',cell:c=>new Date(c.getValue()).toLocaleString('es-AR')}),
  col.accessor('direccion_entrega',{header:'Dirección'}),
  col.accessor('total',{header:'Total',cell:c=>money(c.getValue())}),
  col.accessor('estado',{header:'Estado',cell:c=><BadgeEstado estado={c.getValue()}/>}),
  col.display({id:'actions',header:'Acciones',cell:c=>{
   const pedido=c.row.original;
   return <div className="flex flex-wrap gap-2">
    {advance[pedido.estado]&&<button className="btn-primary" disabled={act.estado.isPending} onClick={()=>act.estado.mutate({id:pedido.id,estado:advance[pedido.estado]!})}>Avanzar</button>}
    {advance[pedido.estado]&&<button className="btn-secondary" disabled={act.estado.isPending} onClick={()=>act.estado.mutate({id:pedido.id,estado:'CANCELADO'})}>Cancelar</button>}
    <details><summary className="cursor-pointer text-sm font-bold underline">Detalle</summary><div className="absolute z-20 max-w-sm rounded-lg bg-white p-4 shadow-xl">{pedido.items.map(i=><p key={i.producto_id}>{i.cantidad} × {i.nombre_producto}: {money(i.subtotal)}</p>)}</div></details>
   </div>;
  }})
 ],getCoreRowModel:getCoreRowModel(),getPaginationRowModel:getPaginationRowModel()});
 return <section><h1 className="page-title">Gestión de pedidos</h1><label className="mb-5 inline-block">Estado <select className="field mt-1" value={estado??''} onChange={e=>{setEstado((e.target.value||undefined) as Estado|undefined);setSkip(0);}}><option value="">Todos</option>{(['PENDIENTE','EN_PREPARACION','ENTREGADO','CANCELADO'] as Estado[]).map(e=><option key={e}>{e}</option>)}</select></label>
 {act.estado.isError&&<p className="error">{act.estado.error.message}</p>}
 {query.isPending?<Loading/>:query.isError?<ErrorNotice error={query.error}/>:query.data.items.length===0?<Empty>No hay pedidos en este estado.</Empty>:<div className="panel"><Tabla tabla={table}/><div className="flex gap-4 p-4"><button className="btn-secondary" disabled={skip===0} onClick={()=>setSkip(Math.max(0,skip-20))}>Anterior bloque</button><button className="btn-secondary" disabled={skip+20>=query.data.total} onClick={()=>setSkip(skip+20)}>Siguiente bloque</button></div></div>}
 </section>;
}
