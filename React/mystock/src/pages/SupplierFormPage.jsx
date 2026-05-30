import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import SupplierForm from '../components/SupplierForm';
import { createSupplier, updateSupplier, getSupplierById } from '../services/api';

export default function SupplierFormPage({ mode }) {
  const navigate = useNavigate();
  const { m_id } = useParams();
  const [initialValues, setInitialValues] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (mode === 'edit' && m_id) {
      getSupplierById(m_id)
        .then(setInitialValues)
        .catch(e => setLoadError(e.message));
    }
  }, [mode, m_id]);

  const handleSubmit = async (payload) => {
    if (mode === 'edit') {
      await updateSupplier(m_id, payload);
    } else {
      await createSupplier(payload);
    }
    navigate('/suppliers');
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
        <p style={{ padding: "2rem", color: "#dc2626" }}>Failed to load supplier: {loadError}</p>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageIntro
        title={mode === 'edit' ? 'Edit Supplier' : 'New Supplier'}
        action={<Link to="/suppliers" className="btn btn-secondary">← Back to Suppliers</Link>}
      />
      <SupplierForm mode={mode} initialValues={initialValues ?? {}} onSubmit={handleSubmit} />
    </div>
  );
}
