import type { ReactNode } from 'react';
import type { Pedido } from '../types/pedido.types';
export const money = (v: number) => v.toLocaleString('es-AR',{style:'currency',currency:'ARS'});
export function BadgeEstado({estado}:{estado:Pedido['estado']}) {
 const colors = {PENDIENTE:'bg-amber-100 text-amber-900',EN_PREPARACION:'bg-sky-100 text-sky-900',ENTREGADO:'bg-green-100 text-green-900',CANCELADO:'bg-red-100 text-red-900'};
 return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[estado]}`}>{estado.replace('_',' ')}</span>;
}
export function OrderCard({order,actions}:{order:Pedido;actions?:ReactNode}) {
 return <article className="panel p-5"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold">Pedido #{order.id} · {money(order.total)}</h2><p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString('es-AR')} · {order.direccion_entrega}</p></div><BadgeEstado estado={order.estado}/></div>
 <details className="mt-4"><summary className="cursor-pointer font-semibold">Ver detalle</summary><ul className="mt-2 space-y-1 text-sm">{order.items.map(i=><li key={i.producto_id} className="flex justify-between"><span>{i.cantidad} × {i.nombre_producto} ({money(i.precio_unitario)})</span><strong>{money(i.subtotal)}</strong></li>)}</ul><p className="mt-2 text-sm">Pago: {order.forma_pago} {order.notas && ` · ${order.notas}`}</p></details>
 {actions && <div className="mt-4 flex gap-3">{actions}</div>}</article>;
}
