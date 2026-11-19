import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, registering } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await register(value);
        navigate('/login', { replace: true });
      } catch (err) {
        setError((err as Error).message);
      }
    },
  });

  return (
    <section className="panel mx-auto max-w-md p-8">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <p className="mb-6 mt-2 text-sm text-gray-600">Las nuevas cuentas se registran con rol usuario.</p>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="username" validators={{ onChange: ({ value }) => /^[A-Za-z0-9_.-]{3,80}$/.test(value) ? undefined : '3 a 80 caracteres: letras, números, _, . o -' }}>
          {(field) => (
            <div>
              <label className="etiqueta" htmlFor="reg-username">Usuario</label>
              <input id="reg-username" className="field" autoComplete="username" required minLength={3} maxLength={80} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} />
            </div>
          )}
        </form.Field>
        <form.Field name="full_name" validators={{ onChange: ({ value }) => value.trim() ? undefined : 'Ingresá el nombre' }}>
          {(field) => (
            <div>
              <label className="etiqueta" htmlFor="reg-fullname">Nombre completo</label>
              <input id="reg-fullname" className="field" required value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} />
            </div>
          )}
        </form.Field>
        <form.Field name="email" validators={{ onChange: ({ value }) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? undefined : 'Ingresá un email válido' }}>
          {(field) => (
            <div>
              <label className="etiqueta" htmlFor="reg-email">Correo electrónico</label>
              <input id="reg-email" className="field" type="email" required autoComplete="email" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} />
            </div>
          )}
        </form.Field>
        <form.Field name="password" validators={{ onChange: ({ value }) => value.length >= 8 ? undefined : 'Mínimo 8 caracteres' }}>
          {(field) => (
            <div>
              <label className="etiqueta" htmlFor="reg-password">Contraseña (mínimo 8 caracteres)</label>
              <input id="reg-password" className="field" type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} />
            </div>
          )}
        </form.Field>
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        <button className="btn-primary w-full" type="submit" disabled={registering}>
          {registering ? 'Registrando…' : 'Crear cuenta'}
        </button>
      </form>
      <Link className="mt-5 inline-block text-sm font-semibold underline" to="/login">Volver al login</Link>
    </section>
  );
}
