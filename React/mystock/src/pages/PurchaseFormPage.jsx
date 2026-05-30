import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import PurchaseForm from '../components/PurchaseForm';
import {
  createPurchase,
  getPurchaseById,
  getSuppliers,getComponents,
  updatePurchase
} from '../services/api';

export default function PurchaseFormPage({ mode }) {
  const { m_id } = useParams();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [components, setComponents] = useState([]);
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    // Map to the {id, name} shape PurchaseForm expects
    getSuppliers().then(data =>
      setSuppliers(data.map(s => ({ id: s.m_id, name: s.m_name })))
    );
    getComponents().then(setComponents);

    if (mode === 'edit' && m_id) {
      getPurchaseById(m_id).then(setInitialValues);
    }
  }, [mode, m_id]);

  const handleSubmit = async (payload) => {
    console.log(mode+"__"+m_id);
    if (mode === 'edit' && m_id) {
      await updatePurchase(m_id, payload);
    } else {
      await createPurchase(payload);
    }

    navigate('/purchase');
  };

  if (mode === 'edit' && !initialValues) {
    return (
      <div className="page-stack">
        <PageIntro
          title="Update Purchase"
          description="Loading purchase record from tbl_purchase."
          action={
            <Link to="/purchase" className="btn btn-secondary" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
              Back to Purchase
            </Link>
          }
        />
        <section className="card content-card">
          <div className="card-header">
            <div>
              <h3>Loading...</h3>
              <p>Please wait while purchase data is loaded.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageIntro
        title={mode === 'edit' ? 'Update Purchase' : 'New Purchase'}
        description="Create a new record in tbl_purchase."
        action={
          <Link to="/purchase" className="btn btn-secondary" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
            Back to Purchase
          </Link>
        }
      />

      <PurchaseForm
        initialValues={initialValues || {}}
        suppliers={suppliers}
        components={components}
        onSubmit={handleSubmit}
        mode={mode}
      />
    </div>
  );
}