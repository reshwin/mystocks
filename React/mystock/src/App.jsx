import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layout/AppLayout';
import LoginPage from './pages/LoginPage';
import SuppliersPage from './pages/SuppliersPage';
import ProductsPage from './pages/ProductsPage';
import PurchaseListPage from './pages/PurchaseListPage';
import PurchaseFormPage from './pages/PurchaseFormPage';
import SupplierFormPage from './pages/SupplierFormPage';
import ProductFormPage from './pages/ProductFormPage';
import StockMovementsPage from './pages/StockMovementsPage';
import StockMovementFormPage from './pages/StockMovementFormPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/suppliers" replace />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/new" element={<SupplierFormPage mode="create" />} />
        <Route path="suppliers/edit/:m_id" element={<SupplierFormPage mode="edit" />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage mode="create" />} />
        <Route path="products/edit/:m_id" element={<ProductFormPage mode="edit" />} />
        <Route path="purchase" element={<PurchaseListPage />} />
        <Route path="purchase/new" element={<PurchaseFormPage mode="create" />} />
        <Route path="purchase/edit/:m_id" element={<PurchaseFormPage mode="edit" />} />
        <Route path="stock" element={<StockMovementsPage />} />
        <Route path="stock/new" element={<StockMovementFormPage />} />
      </Route>
    </Routes>
  );
}