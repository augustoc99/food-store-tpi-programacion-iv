import { useForm } from '@tanstack/react-form';
import Modal from '@/shared/components/Modal';
import type { Categoria } from '@/features/categorias/types/category.types';
import type { Producto, ProductoInput } from '../types/product.types';
export function ProductModal({ actual,categories,guardar,cerrar,error }:{actual:Producto|null;categories:Categoria[];guardar:(v:ProductoInput)=>Promise<void>;cerrar:()=>void;error:string|null}){
 const form=useForm({defaultValues:{nombre:actual?.nombre??'',descripcion:actual?.descripcion??'',categoria_id:actual?.categoria_id??categories[0]?.id??0,precio_base:actual?.precio_base??0,
 imagen_url:actual?.imagen_url??'',stock:actual?.stock??0,disponible:actual?.disponible??true},onSubmit:async({value})=>guardar({...value,nombre:value.nombre.trim()})});
 return <Modal titulo={actual?'Editar producto':'Nuevo producto'} cerrar={cerrar}><form className="space-y-3" onSubmit={e=>{e.preventDefault();void form.handleSubmit();}}>
 <form.Field name="nombre" validators={{onSubmit:({value})=>!value.trim()?'Ingresá el nombre':undefined}}>{f=><label className="etiqueta">Nombre<input required className="field" value={f.state.value} onChange={e=>f.handleChange(e.target.value)}/>{f.state.meta.errors.join('; ')}</label>}</form.Field>
 <form.Field name="descripcion">{f=><label className="etiqueta">Descripción<textarea className="field" value={f.state.value} onChange={e=>f.handleChange(e.target.value)}/></label>}</form.Field>
 <form.Field name="categoria_id">{f=><label className="etiqueta">Categoría<select className="field" value={f.state.value} onChange={e=>f.handleChange(Number(e.target.value))}>{categories.map(c=><option value={c.id} key={c.id}>{c.nombre}</option>)}</select></label>}</form.Field>
 <div className="grid grid-cols-2 gap-3"><form.Field name="precio_base" validators={{onSubmit:({value})=>value<0?'Precio inválido':undefined}}>{f=><label className="etiqueta">Precio<input type="number" min={0} step="0.01" className="field" value={f.state.value} onChange={e=>f.handleChange(Number(e.target.value))}/></label>}</form.Field>
 <form.Field name="stock" validators={{onSubmit:({value})=>!Number.isSafeInteger(value)||value<0?'Stock inválido':undefined}}>{f=><label className="etiqueta">Stock<input type="number" min={0} className="field" value={f.state.value} onChange={e=>f.handleChange(Number(e.target.value))}/></label>}</form.Field></div>
 <form.Field name="imagen_url">{f=><label className="etiqueta">URL de imagen<input type="url" className="field" value={f.state.value} onChange={e=>f.handleChange(e.target.value)}/></label>}</form.Field>
 <form.Field name="disponible">{f=><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.state.value} onChange={e=>f.handleChange(e.target.checked)}/>Disponible para la venta</label>}</form.Field>
 {error&&<p role="alert" className="error">{error}</p>}<div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={cerrar}>Cancelar</button><button className="btn-primary" type="submit">Guardar</button></div>
 </form></Modal>;
}
