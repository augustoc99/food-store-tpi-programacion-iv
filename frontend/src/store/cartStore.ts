import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Producto } from '@/features/productos/types/product.types';
export type CartItem = { producto_id: number; nombre: string; precio_unitario: number; cantidad: number; stock: number };
interface CartState {
  items: CartItem[];
  agregar: (product: Producto) => void;
  quitar: (id: number) => void;
  cambiarCantidad: (id: number, quantity: number) => void;
  vaciar: () => void;
  total: () => number;
}
export const useCartStore = create<CartState>()(persist((set, get) => ({
  items: [],
  agregar: (p) => set((s) => {
    if (!p.activo || !p.disponible || p.stock < 1) return s;
    const current = s.items.find((i) => i.producto_id === p.id);
    if (current) return { items: s.items.map((i) => i.producto_id === p.id ?
      { ...i, cantidad: Math.min(i.cantidad + 1, p.stock), stock: p.stock, precio_unitario: p.precio_base } : i) };
    return { items: [...s.items, { producto_id: p.id, nombre: p.nombre,
      precio_unitario: p.precio_base, cantidad: 1, stock: p.stock }] };
  }),
  quitar: (id) => set((s) => ({ items: s.items.filter((i) => i.producto_id !== id) })),
  cambiarCantidad: (id, quantity) => set((s) => ({ items: s.items.map((i) => i.producto_id === id
    ? { ...i, cantidad: Math.max(1, Math.min(i.stock, quantity)) } : i) })),
  vaciar: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.precio_unitario * i.cantidad, 0),
}), { name: 'foodstore-cart', partialize: (s) => ({ items: s.items }) }));
