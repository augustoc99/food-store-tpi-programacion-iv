import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  cerrar: () => void;
  children: ReactNode;
}

export default function Modal({ titulo, cerrar, children }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div role="dialog" aria-modal="true" aria-label={titulo} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button type="button" onClick={cerrar} aria-label="Cerrar" className="btn-secondary">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
