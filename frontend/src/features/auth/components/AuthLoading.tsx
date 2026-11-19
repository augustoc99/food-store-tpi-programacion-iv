interface Props {
  message?: string;
}

export default function AuthLoading({ message = 'Verificando sesión…' }: Props) {
  return (
    <div role="status" className="panel p-8 text-center">
      <span className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
