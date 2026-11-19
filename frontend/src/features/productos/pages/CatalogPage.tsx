import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategorias } from '@/features/categorias/hooks/useCategories';
import { useCartStore } from '@/store/cartStore';
import { useProductos } from '../hooks/useProducts';
import { Empty, ErrorNotice, Loading, Pager } from '@/shared/components/Pages';
const money = (v: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v);
export function CatalogPage() {
 const [search, setSearch] = useState('');
 const [category, setCategory] = useState('');
 const [skip, setSkip] = useState(0);
 const cats = useCategorias();
 const query = useProductos({ skip, limit: 8, ...(search ? { search } : {}), ...(category ? { categoria_id: Number(category) } : {}) });
 const add = useCartStore((s) => s.agregar);
 return <section><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-fern">Sabores a un clic</p><h1 className="page-title">Elegí tu próximo pedido</h1>
   <p className="text-gray-600">Productos frescos para disfrutar sin complicaciones.</p></div><Link className="btn-primary" to="/carrito">Ver carrito</Link></div>
  <div className="panel mb-6 flex flex-wrap gap-4 p-5"><label className="flex-1 text-sm font-semibold">Buscar producto<input className="field mt-1" placeholder="Ej. Hamburguesa" value={search} onChange={(e) => {setSearch(e.target.value);setSkip(0);}} /></label>
   <label className="min-w-[200px] text-sm font-semibold">Categoría<select className="field mt-1" value={category} onChange={(e) => {setCategory(e.target.value);setSkip(0);}}><option value="">Todas</option>{cats.data?.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label></div>
  {query.isPending ? <Loading/> : query.isError ? <ErrorNotice error={query.error}/> : query.data.items.length === 0 ? <Empty>No encontramos productos con esos filtros.</Empty>
   : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{query.data.items.map((p) => <article key={p.id} className="panel flex flex-col overflow-hidden"><div className="grid h-32 place-content-center bg-mist text-5xl">{p.imagen_url ? <img src={p.imagen_url} alt={p.nombre} className="h-32 w-full object-cover"/> : '🍽️'}</div>
   <div className="flex flex-1 flex-col p-4"><p className="text-xs font-semibold uppercase text-fern">{p.categoria.nombre}</p><h2 className="mt-1 font-bold">{p.nombre}</h2><p className="mt-2 flex-1 text-sm text-gray-600">{p.descripcion}</p><p className="mt-3 font-bold">{money(p.precio_base)}</p>
   <p className="my-2 text-xs">{p.stock > 0 && p.disponible ? `${p.stock} en stock` : 'Agotado'}</p><button className="btn-primary" disabled={!p.disponible || p.stock===0} onClick={() => add(p)}>Agregar al carrito</button></div></article>)}</div>}
  {query.data && <Pager skip={skip} limit={8} total={query.data.total} setSkip={setSkip}/>}
 </section>;
}
