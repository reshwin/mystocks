import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import StockMovementForm from '../components/StockMovementForm';
import { getProducts, createStockMovement } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StockMovementFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(res => setProducts(Array.isArray(res) ? res : (res.data ?? [])));
  }, []);

  const handleSubmit = async (payload) => {
    await createStockMovement({ ...payload, m_user_id: user?.id ?? 1 });
    navigate('/stock');
  };

  return (
    <div className="page-stack">
      <PageIntro
        title="Add Stock Movement"
        action={
          <Link to="/stock" className="btn btn-secondary" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
            Back to Movements
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
          onSubmit={handleSubmit}
          onCancel={() => navigate('/stock')}
        />
      </section>
    </div>
  );
}
