import { Route, Routes, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from '@/features/auth';
import { CatalogPage } from '@/features/productos/pages/CatalogPage';
import { CartPage } from '@/features/pedidos/pages/CartPage';
import { CheckoutPage } from '@/features/pedidos/pages/CheckoutPage';
import { MyOrdersPage } from '@/features/pedidos/pages/MyOrdersPage';
import { AdminSummaryPage } from '@/features/pedidos/pages/AdminSummaryPage';
import { AdminOrdersPage } from '@/features/pedidos/pages/AdminOrdersPage';
import { AdminProductsPage } from '@/features/productos/pages/AdminProductsPage';
import { AdminCategoriesPage } from '@/features/categorias/pages/AdminCategoriesPage';
import AdminUsersPage from '@/features/usuarios/pages/AdminUsersPage';
import { MainLayout } from '@/shared/layout/MainLayout';
import UnauthorizedPage from '@/shared/components/UnauthorizedPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRouter() {
  return <MainLayout><Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/carrito" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/mis-pedidos" element={<MyOrdersPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/resumen" element={<AdminSummaryPage />} />
        <Route path="/admin/categorias" element={<AdminCategoriesPage />} />
        <Route path="/admin/productos" element={<AdminProductsPage />} />
        <Route path="/admin/pedidos" element={<AdminOrdersPage />} />
        <Route path="/admin/usuarios" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></MainLayout>;
}
