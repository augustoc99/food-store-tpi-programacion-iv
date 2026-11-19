import type { Categoria } from '@/features/categorias/types/category.types';
export interface Producto {
 id: number; categoria_id: number; nombre: string; descripcion: string; precio_base: number;
 imagen_url: string; stock: number; disponible: boolean; activo: boolean; categoria: Categoria;
}
export type ProductoInput = Omit<Producto, 'id' | 'activo' | 'categoria'>;
export type ProductosPaginados = { total: number; items: Producto[] };
