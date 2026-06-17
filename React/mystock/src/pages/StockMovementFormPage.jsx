import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import StockMovementForm from '../components/StockMovementForm';
import { getProducts, getProjects, createStockMovement } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StockMovementFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [projects, setProjects] = useState([]);

  // Where to return on save / cancel / back — set by whoever opened this page
  // (the Stock menu or the Components stock modal). Defaults to the stock list.
  const from = location.state?.from ?? '/stock';
  const backLabel = from === '/components' ? 'Back to Components' : 'Back to Movements';
  const initialProduct = location.state?.product ?? null;

  useEffect(() => {
    getProducts().then(res => setProducts(Array.isArray(res) ? res : (res.data ?? [])));
    getProjects().then(setProjects).catch(console.error);
  }, []);

  const handleSubmit = async (payload) => {
    await createStockMovement({ ...payload, m_user_id: user?.id ?? 1 });
    navigate(from);
  };

  return (
    <div className="page-stack">
      <PageIntro
        title="Add Stock Movement"
        action={
          <Link to={from} className="btn btn-secondary" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
            {backLabel}
          </Link>
        }
      />

      <section className="card content-card" style={{ borderRadius: 6 }}>
        <div className="card-header">
          <div>
            <h3>New Movement</h3>
            <p>Record opening stock, consumption, return, write-off or transfer.</p>
          </div>
        </div>
        <StockMovementForm
          products={products}
          projects={projects}
          initialProduct={initialProduct}
          onSubmit={handleSubmit}
          onCancel={() => navigate(from)}
        />
      </section>
    </div>
  );
}
