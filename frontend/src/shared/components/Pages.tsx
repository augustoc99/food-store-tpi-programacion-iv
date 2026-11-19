import type { ReactNode } from 'react';
export function Loading() { return <div className="grid grid-cols-2 gap-4"><div className="skeleton h-44"/><div className="skeleton h-44"/></div>; }
export function Empty({ children }: {children: ReactNode}) { return <p className="panel p-10 text-center text-gray-600">{children}</p>; }
export function ErrorNotice({ error }: { error: Error }) { return <p role="alert" className="error">{error.message}</p>; }
export function Pager({ skip, limit, total, setSkip }: { skip: number; limit: number; total: number; setSkip: (n: number) => void }) {
 return <div className="mt-6 flex items-center justify-center gap-4 text-sm"><button className="btn-secondary" disabled={skip === 0} onClick={() => setSkip(Math.max(0,skip-limit))}>Anterior</button>
 <span>{total === 0 ? 0 : Math.floor(skip/limit)+1} / {Math.max(1,Math.ceil(total/limit))} · {total} productos</span>
 <button className="btn-secondary" disabled={skip+limit>=total} onClick={() => setSkip(skip+limit)}>Siguiente</button></div>;
}
