import { useState } from 'react';
import { usePedidos, usePedidoActions } from '../hooks/usePedidos';
import { OrderCard } from '../components/OrderCard';
import { Empty, ErrorNotice, Loading } from '@/shared/components/Pages';
export function MyOrdersPage() {
 const [skip,setSkip] = useState(0);const query = usePedidos(skip);const actions = usePedidoActions();
 return <section><h1 className="page-title">Mis pedidos</h1>
 {actions.cancel.isError && <p className="error">{actions.cancel.error.message}</p>}
 {query.isPending?<Loading/>:query.isError?<ErrorNotice error={query.error}/>:query.data.items.length===0?<Empty>Todavía no hiciste pedidos.</Empty>:<div className="space-y-4">
  {query.data.items.map(order=><OrderCard key={order.id} order={order} actions={order.estado==='PENDIENTE'&&<button disabled={actions.cancel.isPending} className="btn-secondary" onClick={()=>actions.cancel.mutate(order.id)}>Cancelar pedido</button>}/>)}
  <div className="flex gap-4"><button className="btn-secondary" disabled={skip===0} onClick={()=>setSkip(Math.max(0,skip-20))}>Anterior</button>
    <button className="btn-secondary" disabled={skip+20>=query.data.total} onClick={()=>setSkip(skip+20)}>Siguiente</button></div></div>}
 </section>;
}
