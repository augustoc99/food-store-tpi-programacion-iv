import { useForm } from '@tanstack/react-form';
import type { Categoria, CategoriaInput } from '../types/category.types';
import Modal from '@/shared/components/Modal';

interface Props {
  actual: Categoria | null;
  guardar: (datos: CategoriaInput) => Promise<void>;
  cerrar: () => void;
  error: string | null;
}

export default function CategoriaModal({ actual, guardar, cerrar, error }: Props) {
  const form = useForm({
    defaultValues: { nombre: actual?.nombre ?? '', descripcion: actual?.descripcion ?? '' },
    onSubmit: async ({ value }) => guardar({ nombre: value.nombre.trim(), descripcion: value.descripcion }),
  });

  return (
    <Modal titulo={actual ? 'Editar categoría' : 'Nueva categoría'} cerrar={cerrar}>
      <form noValidate onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); void form.handleSubmit(); }} className="space-y-4">
        <form.Field name="nombre" validators={{ onBlur: ({ value }) => value.trim().length < 2 ? 'Ingresá al menos 2 caracteres.' : undefined, onSubmit: ({ value }) => value.trim().length < 2 ? 'Ingresá al menos 2 caracteres.' : undefined }}>
          {(field) => (
            <div>
              <label className="etiqueta" htmlFor="categoria-nombre">Nombre *</label>
              <input id="categoria-nombre" className="field" maxLength={100} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} />
              {field.state.meta.errors.length > 0 && <p role="alert" className="mt-1 text-sm text-red-700">{field.state.meta.errors.join(', ')}</p>}
            </div>
          )}
        </form.Field>
        <form.Field name="descripcion">
          {(field) => (
            <div>
              <label className="etiqueta" htmlFor="categoria-descripcion">Descripción</label>
              <textarea id="categoria-descripcion" className="field" rows={3} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} />
            </div>
          )}
        </form.Field>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={cerrar} className="btn-secondary">Cancelar</button>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, submitting]) => (
              <button type="submit" className="btn-primary" disabled={!canSubmit || submitting}>
                {submitting ? 'Guardando...' : 'Guardar'}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}
