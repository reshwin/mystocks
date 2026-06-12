import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import ProductForm from '../components/ProductForm';
import { createProduct, updateProduct, getProductById } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProductFormPage({ mode }) {
  const navigate = useNavigate();
  const { m_id } = useParams();
  const { user } = useAuth();
  const role = user?.role ?? '';
  const [initialValues, setInitialValues] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (mode === 'edit' && m_id) {
      getProductById(m_id)
        .then(setInitialValues)
        .catch(e => setLoadError(e.message));
    }
  }, [mode, m_id]);

  const handleSubmit = async (payload) => {
    if (mode === 'edit') {
      await updateProduct(m_id, payload);
    } else {
      await createProduct(payload);
    }
    navigate('/components');
  };

  if (mode === 'edit' && !initialValues && !loadError) {
    return (
      <div className="page-stack">
        <p style={{ padding: "2rem", color: "var(--color-text-muted)" }}>Loading…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page-stack">
        <p style={{ padding: "2rem", color: "#dc2626" }}>Failed to load product: {loadError}</p>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageIntro
        title={mode === 'edit' ? 'Edit Component' : 'New Component'}
        action={<Link to="/components" className="btn btn-secondary">← Back to Components</Link>}
      />
      <ProductForm mode={mode} initialValues={initialValues ?? {}} onSubmit={handleSubmit} role={role} />
    </div>
  );
}
