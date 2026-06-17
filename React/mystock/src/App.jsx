import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import EditorRoute from './components/EditorRoute';
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
        <Route index element={<Navigate to="/components" replace />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/new" element={<EditorRoute redirectTo="/suppliers"><SupplierFormPage mode="create" /></EditorRoute>} />
        <Route path="suppliers/edit/:m_id" element={<EditorRoute redirectTo="/suppliers"><SupplierFormPage mode="edit" /></EditorRoute>} />
        <Route path="components" element={<ProductsPage />} />
        <Route path="components/new" element={<EditorRoute redirectTo="/components"><ProductFormPage mode="create" /></EditorRoute>} />
        <Route path="components/edit/:m_id" element={<EditorRoute redirectTo="/components"><ProductFormPage mode="edit" /></EditorRoute>} />
        <Route path="purchase" element={<PurchaseListPage />} />
        <Route path="purchase/new" element={<EditorRoute redirectTo="/purchase"><PurchaseFormPage mode="create" /></EditorRoute>} />
        <Route path="purchase/edit/:m_id" element={<EditorRoute redirectTo="/purchase"><PurchaseFormPage mode="edit" /></EditorRoute>} />
        <Route path="stock" element={<StockMovementsPage />} />
        <Route path="stock/new" element={<EditorRoute redirectTo="/stock"><StockMovementFormPage /></EditorRoute>} />
      </Route>
    </Routes>
  );
}