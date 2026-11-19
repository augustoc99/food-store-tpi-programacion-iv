import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthLoading from '../components/AuthLoading';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, status, loading, login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        await login(value.username, value.password);
        navigate('/', { replace: true });
      } catch (error) {
        setFormError((error as Error).message);
      }
    },
  });

  if (status === 'checking') {
    return <AuthLoading />;
  }
  if (user) return <Navigate to="/" replace />;

  return (
    <section className="panel mx-auto max-w-md p-8">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <p className="mb-6 mt-2 text-sm text-gray-600">Ingresá a Food Store para acceder al catálogo.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="username" validators={{ onChange: ({ value }) => value.trim() ? undefined : 'Ingresá tu usuario' }}>
          {(field) => (
            <div>
              <label className="etiqueta" htmlFor="login-user">Usuario</label>
              <input
                id="login-user"
                className="field"
                autoComplete="username"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>
        <form.Field name="password" validators={{ onChange: ({ value }) => value ? undefined : 'Ingresá tu contraseña' }}>
          {(field) => (
            <div>
              <label className="etiqueta" htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                className="field"
                autoComplete="current-password"
                type="password"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>
        {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
      <p className="mt-5 text-sm">
        ¿No tenés cuenta? <Link className="font-semibold underline" to="/register">Registrate</Link>
      </p>
    </section>
  );
}
