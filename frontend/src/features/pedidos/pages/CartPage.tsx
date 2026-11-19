import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { Empty } from '@/shared/components/Pages';
const money = (n: number) => n.toLocaleString('es-AR', {style:'currency',currency:'ARS'});
export function CartPage() {
 const items = useCartStore((s)=>s.items);
 const { quitar, cambiarCantidad, vaciar, total } = useCartStore();
 return <section><h1 className="page-title">Mi carrito</h1>
 {items.length === 0 ? <Empty>Tu carrito está vacío. <Link className="underline" to="/">Explorar catálogo</Link></Empty> :
  <div className="panel p-6"><div className="space-y-4">{items.map(i=><div key={i.producto_id} className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
   <div><h2 className="font-bold">{i.nombre}</h2><p className="text-sm text-gray-600">{money(i.precio_unitario)} c/u</p></div>
   <label className="text-sm">Cantidad <input type="number" min={1} max={i.stock} className="field w-24" value={i.cantidad} onChange={e=>cambiarCantidad(i.producto_id,Number(e.target.value))}/></label>
   <strong>{money(i.precio_unitario*i.cantidad)}</strong><button className="btn-secondary" onClick={()=>quitar(i.producto_id)}>Quitar</button></div>)}</div>
   <div className="mt-5 flex flex-wrap justify-between gap-3"><button className="btn-secondary" onClick={vaciar}>Vaciar carrito</button><div className="text-right"><h2 className="text-xl font-bold">Total estimado: {money(total())}</h2>
   <p className="my-2 text-xs text-gray-600">El backend verifica precios y stock al confirmar.</p><Link to="/checkout" className="btn-primary inline-block">Continuar al pago</Link></div></div>
  </div>}</section>;
}
