import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
const nav = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`;
export default function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const count = useCartStore((s) => s.items.reduce((a, i) => a + i.cantidad, 0));
  async function salir() { try { await logout(); navigate('/'); } catch (e) { window.alert((e as Error).message); } }
  return <header className="bg-evergreen text-white shadow-lg">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
      <NavLink to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">🍔 Food Store <span className="text-xs font-normal text-green-100">Pedidos online</span></NavLink>
      <nav className="flex flex-wrap items-center gap-1" aria-label="Navegación principal">
        <NavLink to="/" end className={nav}>Catálogo</NavLink>
        <NavLink to="/carrito" className={nav}>Carrito ({count})</NavLink>
        {status === 'authenticated' && <NavLink to="/mis-pedidos" className={nav}>Mis pedidos</NavLink>}
        {user?.role === 'admin' && <>
          <NavLink to="/admin/resumen" className={nav}>Resumen</NavLink>
          <NavLink to="/admin/categorias" className={nav}>Categorías</NavLink>
          <NavLink to="/admin/productos" className={nav}>Productos</NavLink>
          <NavLink to="/admin/pedidos" className={nav}>Pedidos</NavLink>
          <NavLink to="/admin/usuarios" className={nav}>Usuarios</NavLink>
        </>}
      </nav>
      <div className="flex gap-2 text-sm">{user && status === 'authenticated' ? <>
        <span className="hidden self-center md:block">{user.full_name} · {user.role}</span>
        <button className="rounded-lg border border-white/60 px-3 py-2" onClick={() => void salir()}>Salir</button>
      </> : <><NavLink to="/login" className={nav}>Ingresar</NavLink><NavLink to="/register" className={nav}>Registrarme</NavLink></>}</div>
    </div></header>;
}
