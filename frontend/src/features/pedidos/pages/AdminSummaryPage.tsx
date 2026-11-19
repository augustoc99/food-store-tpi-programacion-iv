import { useQuery } from '@tanstack/react-query';
import { pedidosApi } from '../api/pedidosApi';
import { money } from '../components/OrderCard';
import { Loading, ErrorNotice } from '@/shared/components/Pages';
export function AdminSummaryPage() {
 const query = useQuery({queryKey:['resumen'],queryFn:pedidosApi.resumen});
 const labels:Record<string,string>={pendientes:'Pendientes',en_preparacion:'En preparación',entregados:'Entregados',cancelados:'Cancelados',pedidos_hoy:'Pedidos hoy',ingresos_entregados:'Ingresos por entregas'};
 return <section><h1 className="page-title">Resumen del negocio</h1>{query.isPending?<Loading/>:query.isError?<ErrorNotice error={query.error}/>:<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(query.data).map(([key,value])=><div className="panel p-6" key={key}><p className="text-sm font-semibold text-gray-600">{labels[key]}</p><p className="mt-3 text-3xl font-extrabold">{key==='ingresos_entregados'?money(value):value}</p></div>)}</div>}</section>;
}
