interface Props {
  tipo: 'carga' | 'error' | 'vacio';
  mensaje?: string;
  reintentar?: () => void;
}

export default function Estados({ tipo, mensaje, reintentar }: Props) {
  if (tipo === 'carga') {
    return (
      <div role="status" className="space-y-3 p-6">
        {[1, 2, 3].map((item) => <div key={item} className="h-12 animate-pulse rounded-lg bg-gray-100" />)}
        <p className="text-sm text-gray-500">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} className="p-10 text-center text-sm text-gray-600">
      <p>{mensaje || (tipo === 'vacio' ? 'Todavía no hay registros.' : 'No se pudo cargar el listado.')}</p>
      {tipo === 'error' && reintentar && <button className="btn-secondary mt-4" onClick={reintentar}>Reintentar</button>}
    </div>
  );
}
