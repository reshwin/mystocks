import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import { useAuth } from '../context/AuthContext';
import { getStockMovements, getProducts } from '../services/api';
import { capitalize } from '../utils/common';

const PAGE_SIZE = 20;

const TYPE_LABEL = {
  opening:     'Opening',
  consumption: 'Consumption',
  return:      'Return',
  writeoff:    'Write-off',
  transfer:    'Transfer',
};

const fmtDate = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

export default function StockMovementsPage() {
  const navigate = useNavigate();
  const { canEdit } = useAuth();

  const [data,     setData]     = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [products, setProducts] = useState([]);
  const [productFilter, setProductFilter] = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    getProducts().then(res => setProducts(Array.isArray(res) ? res : (res.data ?? [])));
  }, []);

  useEffect(() => {
    setLoading(true);
    getStockMovements({ page, pageSize: PAGE_SIZE, productId: productFilter })
      .then(res => {
        setData(res.data ?? []);
        setTotal(res.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, productFilter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const productName = (id) => {
    const p = products.find(p => p.m_id === id);
    return p ? capitalize(p.m_name) : id;
  };

  return (
    <div className="page-stack">
      <PageIntro
        title="Stock Movements"
        action={
          canEdit && (
            <button className="btn btn-primary" onClick={() => navigate('/stock/new', { state: { from: '/stock' } })}>
              + Add Movement
            </button>
          )
        }
      />

      <section className="card content-card" style={{ borderRadius: 6 }}>
        <div className="card-header">
          <div className="card-toolbar">
            <div>
              <h3>Movements</h3>
              <p>{total} record{total !== 1 ? 's' : ''}</p>
            </div>

            <select
              className="filter-select"
              value={productFilter}
              onChange={e => { setProductFilter(e.target.value); setPage(1); }}
              style={productFilter ? { borderColor: '#dc2626', color: '#dc2626', fontWeight: 'bold' } : undefined}
            >
              <option value="">All components</option>
              {products.map(p => (
                <option key={p.m_id} value={p.m_id}>{capitalize(p.m_name)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Component</th>
                <th>Type</th>
                <th style={{ textAlign: 'center' }}>Dir</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th>Project</th>
                <th>Notes</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Loading…</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No movements found.</td>
                </tr>
              ) : data.map((row, i) => (
                <tr key={row.m_id ?? row.id ?? i}>
                  <td style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{fmtDate(row.m_date)}</td>
                  <td><strong>{productName(row.m_product_id)}</strong></td>
                  <td>
                    <span className="badge">{TYPE_LABEL[row.m_type] ?? row.m_type}</span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: row.m_direction === 'in' ? '#16a34a' : '#dc2626' }}>
                    {row.m_direction === 'in' ? '↑' : '↓'}
                  </td>
                  <td style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {row.m_direction === 'out' && '−'}{Number(row.m_qty)}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>{row.m_project}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>{row.m_notes}</td>
                  <td style={{ fontSize: '0.88rem' }}>{row.m_user_name ?? row.m_user_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next →</button>
          </div>
        )}
      </section>
    </div>
  );
}
