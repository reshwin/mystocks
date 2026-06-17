import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageIntro from '../components/PageIntro';
import ActionButtons from '../components/ActionButtons';
import usePersistentState from '../hooks/usePersistentState';
import { getProducts, deleteProduct, getStockMovements, getPurchasesByProduct, patchRackLocation } from '../services/api';

const PAGE_SIZE = 15;

export default function ProductsPage() {
  const navigate = useNavigate();
  const { user, canEdit } = useAuth();
  const canEditRack = canEdit;
  const [allRows, setAllRows] = useState([]);
  const [search, setSearch] = usePersistentState("components.search", "");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [stockModal, setStockModal] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [movLoading, setMovLoading] = useState(false);

  const [rackEdit, setRackEdit] = useState(null);   // { row, value }
  const [rackSaving, setRackSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getProducts()
      .then(res => {setAllRows(Array.isArray(res) ? res : (res.data ?? []));
        
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Distinct type names, sorted, derived from loaded data
  const types = [...new Set(allRows.map(r => r.m_type).filter(Boolean))].sort();

  const filtered = allRows.filter(r => {
    if (typeFilter && r.m_type !== typeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.m_name?.toLowerCase().includes(q) ||
      r.m_type?.toLowerCase().includes(q) ||
      r.m_type_sub?.toLowerCase().includes(q) ||
      r.m_rack_location?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return;
    try {
      await deleteProduct(id);
      load();
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  };

  const openStockModal = (row) => {
    setStockModal(row);
    setTransactions([]);
    setMovLoading(true);
    Promise.all([
      getStockMovements({ pageSize: 9999, productId: row.m_id }),
      getPurchasesByProduct(row.m_id),
    ])
      .then(([mov, purchases]) => {
        const rows = [
          ...(purchases ?? []).map(p => ({
            key: `p-${p.id}`,
            date: p.date,
            type: 'purchase',
            direction: 'in',
            qty: Number(p.qty ?? 0),
            project: p.supplier,
            notes: `Order ${p.orderNo || '—'}`,
            pending: !p.dateReceived,
          })),
          ...(mov.data ?? []).map(m => ({
            key: `m-${m.m_id}`,
            date: m.m_date,
            createdAt: m.m_created_at,
            type: m.m_type,
            direction: m.m_direction,
            qty: Number(m.m_qty ?? 0),
            project: m.m_project,
            notes: m.m_notes,
            pending: false,
          })),
        ].sort((a, b) => {
          // m_date is date-only, so ties are broken by m_created_at (full
          // timestamp); purchases have no created_at and fall back to the date.
          const byDate = new Date(a.date) - new Date(b.date);
          if (byDate !== 0) return byDate;
          const ca = a.createdAt ? new Date(a.createdAt) : new Date(a.date);
          const cb = b.createdAt ? new Date(b.createdAt) : new Date(b.date);
          return ca - cb;
        });

        // Pending purchases (m_date_received still null) are listed but
        // excluded from the running balance until the item is received.
        let balance = 0;
        for (const t of rows) {
          if (!t.pending) balance += t.direction === 'in' ? t.qty : -t.qty;
          t.balance = balance;
        }
        setTransactions(rows.reverse());
      })
      .catch(console.error)
      .finally(() => setMovLoading(false));
  };

  const saveRack = async () => {
    if (!rackEdit) return;
    setRackSaving(true);
    try {
      await patchRackLocation(rackEdit.row.m_id, rackEdit.value);
      setAllRows(prev => prev.map(r =>
        r.m_id === rackEdit.row.m_id ? { ...r, m_rack_location: rackEdit.value } : r
      ));
      setRackEdit(null);
    } catch (e) {
      alert('Save failed: ' + e.message);
    } finally {
      setRackSaving(false);
    }
  };

  const fmtDate = (val) => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
  };

  return (
    <div className="page-stack">
      <PageIntro
        title="Components"
        action={
          canEdit && (
            <button className="btn btn-primary" onClick={() => navigate('/components/new')}>
              + New Component
            </button>
          )
        }
      />

      <section className="card content-card" style={{ borderRadius: "6px" }}>
        <div className="card-header">
          <div className="card-toolbar">
            <div>
              <h3>Components</h3>
              <p>
                {typeFilter
                  ? `${filtered.length} of ${allRows.length} — filtered by ${typeFilter}`
                  : `${allRows.length} item${allRows.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Type filter dropdown */}
            <select
              className="filter-select"
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              style={typeFilter ? { borderColor: '#dc2626', color: '#dc2626', fontWeight: 'bold' } : undefined}
            >
              <option value="">All types</option>
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search components…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={search ? { borderColor: '#dc2626', color: '#dc2626', fontWeight: 'bold' } : undefined}
              />
              {search && (
                <span
                  className="search-clear"
                  onClick={() => { setSearch(""); setPage(1); }}
                  onMouseEnter={e => e.currentTarget.style.color = "orangered"}
                  onMouseLeave={e => e.currentTarget.style.color = ""}
                >×</span>
              )}
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Sub-type</th>
                <th style={{ textAlign: "center" }}>Stock</th>
                <th style={{ textAlign: "center" }}>Pins</th>
                <th>Rack</th>
                <th>Description</th>
                <th style={{ textAlign: "center" }}>Link</th>
                <th style={{ width: "80px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
                    Loading…
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
                    No components found.
                  </td>
                </tr>
              ) : pageData.map(row => (
                <tr key={row.m_id}>
                  <td><strong>{row.m_name}</strong></td>
                  <td>{row.m_type && <span className="badge">{row.m_type}</span>}</td>
                  <td>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.88rem" }}>
                      {row.m_type_sub}
                    </span>
                  </td>
                  <td
                    style={{ textAlign: "center", fontVariantNumeric: "tabular-nums", fontWeight: row.stockPurchased > 0 ? 600 : undefined, color: row.stockPurchased > 0 ? "var(--color-primary)" : "var(--color-text-muted)", cursor: "pointer", textDecoration: row.stockPurchased != null ? "underline dotted" : undefined }}
                    title={row.stockPurchased != null ? `Purchased: ${row.stockPurchased ?? '—'}  |  In: ${row.stockIn ?? '—'}  |  Out: ${row.stockOut ?? '—'}\nClick to view transactions` : 'Click to view transactions'}
                    onClick={() => openStockModal(row)}
                  >
                    {row.stockPurchased != null ? (row.stockPurchased + (row.stockIn ?? 0) - (row.stockOut ?? 0)) : '—'}
                  </td>
                  <td style={{ textAlign: "center" }}>{row.m_pins}</td>
                  <td
                    style={{ cursor: canEditRack ? "pointer" : "default" }}
                    title={canEditRack ? "Double-click to edit rack location" : undefined}
                    onDoubleClick={canEditRack ? () => setRackEdit({ row, value: row.m_rack_location ?? '' }) : undefined}
                  >
                    <code style={{ fontSize: "0.82rem", background: "var(--color-surface-2)", padding: "1px 5px", borderRadius: "4px", fontWeight: 700 }}>
                      {row.m_rack_location || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                    </code>
                  </td>
                  <td
                    style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--color-text-muted)", fontSize: "0.88rem" }}
                    title={row.m_description}
                  >
                    {row.m_description}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {row.m_link && (
                      <a href={row.m_link} target="_blank" rel="noopener noreferrer" className="link-icon" title="Open product page">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.07 0l3.54-3.54a5 5 0 0 0-7.07-7.07L10 5" />
                          <path d="M14 11a5 5 0 0 0-7.07 0L3.39 14.54a5 5 0 1 0 7.07 7.07L14 19" />
                        </svg>
                      </a>
                    )}
                  </td>
                  <td>
                    {canEdit && (
                      <ActionButtons
                        onEdit={() => navigate(`/components/edit/${row.m_id}`)}
                        onDelete={() => handleDelete(row.m_id, row.m_name)}
                        deleteDisabled
                      />
                    )}
                  </td>
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

      {/* Rack location edit popup */}
      {rackEdit && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setRackEdit(null)}
        >
          <div
            style={{ background: 'var(--color-surface)', borderRadius: 10, padding: '24px', width: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.95rem' }}>Rack Location</p>
            <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{rackEdit.row.m_name}</p>
            <input
              autoFocus
              type="text"
              value={rackEdit.value}
              onChange={e => setRackEdit(prev => ({ ...prev, value: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') saveRack(); if (e.key === 'Escape') setRackEdit(null); }}
              placeholder="e.g. A1-R3"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.95rem', boxSizing: 'border-box', marginBottom: 14 }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setRackEdit(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveRack} disabled={rackSaving}>
                {rackSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock transaction modal */}
      {stockModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setStockModal(null)}
        >
          <div
            style={{ background: 'var(--color-surface)', borderRadius: 10, width: '680px', maxWidth: '95vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '1rem' }}>{stockModal.m_name}</strong>
                <span style={{ marginLeft: 12, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Purchased: {stockModal.stockPurchased ?? 0} &nbsp;|&nbsp; In: {stockModal.stockIn ?? 0} &nbsp;|&nbsp; Out: {stockModal.stockOut ?? 0} &nbsp;|&nbsp;
                  <strong style={{ color: 'var(--color-primary)' }}>Balance: {(stockModal.stockPurchased ?? 0) + (stockModal.stockIn ?? 0) - (stockModal.stockOut ?? 0)}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {canEdit && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate('/stock/new', { state: { from: '/components', product: { m_id: stockModal.m_id, m_name: stockModal.m_name, m_type: stockModal.m_type, m_type_sub: stockModal.m_type_sub } } })}
                    style={{ fontSize: '0.8rem', padding: '5px 12px', whiteSpace: 'nowrap' }}
                  >
                    + Add Movement
                  </button>
                )}
                <button onClick={() => setStockModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1 }}>×</button>
              </div>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {movLoading ? (
                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</p>
              ) : transactions.length === 0 ? (
                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No transactions recorded.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-surface-2)', position: 'sticky', top: 0 }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Type</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600 }}>Dir</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Qty</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Balance</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Project / Supplier</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.key} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '7px 12px', whiteSpace: 'nowrap' }}>{fmtDate(t.date)}</td>
                        <td style={{ padding: '7px 12px' }}>
                          <span
                            className="badge"
                            style={{
                              textTransform: 'capitalize',
                              ...(t.type === 'purchase' && { background: 'var(--color-primary)', color: '#fff' }),
                            }}
                          >
                            {t.type}
                          </span>
                          {t.pending && (
                            <span style={{ marginLeft: 6, fontSize: '0.75rem', color: '#d97706', fontStyle: 'italic' }}>pending</span>
                          )}
                        </td>
                        <td style={{ padding: '7px 12px', textAlign: 'center', fontWeight: 700, color: t.pending ? '#d97706' : t.direction === 'in' ? '#16a34a' : '#dc2626' }}>
                          {t.direction === 'in' ? '↑' : '↓'}
                        </td>
                        <td style={{ padding: '7px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: t.pending ? '#d97706' : t.direction === 'in' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                          {t.direction === 'in' ? '+' : '−'}{t.qty}
                        </td>
                        <td style={{ padding: '7px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{t.balance}</td>
                        <td style={{ padding: '7px 12px', color: 'var(--color-text-muted)' }}>{t.project}</td>
                        <td style={{ padding: '7px 12px', color: 'var(--color-text-muted)' }}>{t.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
