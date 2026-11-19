import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <section className="panel mx-auto max-w-lg p-8 text-center">
      <h1 className="text-3xl font-bold">Acceso denegado</h1>
      <p className="mt-4 text-gray-600">Tu cuenta no dispone de permisos para esta sección.</p>
      <Link className="btn-primary mt-6 inline-flex" to="/">Volver al catálogo</Link>
    </section>
  );
}
