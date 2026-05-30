import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import ActionButtons from '../components/ActionButtons';
import { getProducts, deleteProduct } from '../services/api';

const PAGE_SIZE = 15;

export default function ProductsPage() {
  const navigate = useNavigate();
  const [allRows, setAllRows] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="page-stack">
      <PageIntro
        title="Components"
        action={
          <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
            + New Component
          </button>
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
            >
              <option value="">All types</option>
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
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
                    No products found.
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
                    style={{ textAlign: "center", fontVariantNumeric: "tabular-nums", fontWeight: row.stockPurchased > 0 ? 600 : undefined, color: row.stockPurchased > 0 ? "var(--color-primary)" : "var(--color-text-muted)", cursor: row.stockPurchased != null ? "default" : undefined }}
                    title={row.stockPurchased != null ? `Purchased: ${row.stockPurchased ?? '—'}  |  In: ${row.stockIn ?? '—'}  |  Out: ${row.stockOut ?? '—'}` : undefined}
                  >
                    {row.stockPurchased != null ? (row.stockPurchased + (row.stockIn ?? 0) - (row.stockOut ?? 0)) : '—'}
                  </td>
                  <td style={{ textAlign: "center" }}>{row.m_pins}</td>
                  <td>
                    <code style={{ fontSize: "0.82rem", background: "var(--color-surface-2)", padding: "1px 5px", borderRadius: "4px" }}>
                      {row.m_rack_location}
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
                    <ActionButtons
                      onEdit={() => navigate(`/products/edit/${row.m_id}`)}
                      onDelete={() => handleDelete(row.m_id, row.m_name)}
                      deleteDisabled
                    />
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
    </div>
  );
}
