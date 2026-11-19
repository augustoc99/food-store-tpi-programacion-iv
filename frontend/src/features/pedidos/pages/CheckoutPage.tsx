import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { usePedidoActions } from '../hooks/usePedidos';
import type { Pago } from '../types/pedido.types';
export function CheckoutPage() {
 const navigate = useNavigate();
 const items = useCartStore((s)=>s.items);
 const clear = useCartStore((s)=>s.vaciar);
 const actions = usePedidoActions();
 const [error,setError] = useState<string|null>(null);
 const [pedidoConfirmado, setPedidoConfirmado] = useState(false);
 const form = useForm({ defaultValues: {direccion_entrega:'',forma_pago:'EFECTIVO' as Pago,notas:''},
   onSubmit: async ({value}) => { setError(null); try {
     await actions.create.mutateAsync({items:items.map(i=>({producto_id:i.producto_id,cantidad:i.cantidad})),
       direccion_entrega:value.direccion_entrega.trim(),forma_pago:value.forma_pago,notas:value.notas});
     setPedidoConfirmado(true);
     navigate('/mis-pedidos', { replace: true });
     clear();
   } catch(e) {setError((e as Error).message);} } });
 if(pedidoConfirmado || actions.create.isSuccess) return <Navigate to="/mis-pedidos" replace/>;
 if(items.length===0) return <Navigate to="/carrito" replace/>;
 return <section className="mx-auto max-w-lg"><h1 className="page-title">Confirmar pedido</h1><div className="panel p-6"><form className="space-y-5" onSubmit={e=>{e.preventDefault();void form.handleSubmit();}}>
  <form.Field name="direccion_entrega" validators={{onBlur:({value})=>value.trim().length<5?'Ingresá una dirección válida (mínimo 5 caracteres)':undefined}}>{field=><label className="etiqueta">Dirección de entrega *<input className="field mt-1" minLength={5} maxLength={200} required value={field.state.value} onChange={e=>field.handleChange(e.target.value)} onBlur={field.handleBlur}/>{field.state.meta.errors.map((e,i)=><span className="error" key={i}>{String(e)}</span>)}</label>}</form.Field>
  <form.Field name="forma_pago">{field=><label className="etiqueta">Forma de pago<select className="field mt-1" value={field.state.value} onChange={e=>field.handleChange(e.target.value as Pago)}><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option></select></label>}</form.Field>
  <form.Field name="notas">{field=><label className="etiqueta">Notas opcionales<textarea className="field mt-1" rows={3} value={field.state.value} onChange={e=>field.handleChange(e.target.value)}/></label>}</form.Field>
  {error && <p className="error" role="alert">{error}</p>}<button className="btn-primary w-full" disabled={actions.create.isPending} type="submit">{actions.create.isPending?'Confirmando…':'Confirmar compra'}</button>
 </form></div></section>;
}
