import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import ActionButtons from '../components/ActionButtons';
import { getSuppliers, deleteSupplier } from '../services/api';

const PAGE_SIZE = 15;

export default function SuppliersPage() {
  const navigate = useNavigate();
  const [allRows, setAllRows] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    getSuppliers()
      .then(setAllRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = allRows.filter(r =>
    !search ||
    r.m_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.m_web?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete supplier "${name}"?`)) return;
    try {
      await deleteSupplier(id);
      load();
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  };

  return (
    <div className="page-stack">
      <PageIntro
        title="Suppliers"
        action={
          <button className="btn btn-primary" onClick={() => navigate('/suppliers/new')}>
            + New Supplier
          </button>
        }
      />

      <section className="card content-card" style={{ borderRadius: "6px" }}>
        <div className="card-header">
          <div className="card-toolbar">
            <div>
              <h3>Suppliers</h3>
              <p>{allRows.length} supplier{allRows.length !== 1 ? 's' : ''} registered.</p>
            </div>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search suppliers…"
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
                <th style={{ width: "50px" }}>#</th>
                <th>Name</th>
                <th>Website</th>
                <th style={{ width: "100px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
                    Loading…
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
                    No suppliers found.
                  </td>
                </tr>
              ) : pageData.map(row => (
                <tr key={row.m_id}>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "0.82rem" }}>{row.m_id}</td>
                  <td><strong>{row.m_name}</strong></td>
                  <td>
                    {row.m_web ? (
                      <a
                        href={row.m_web.startsWith('http') ? row.m_web : 'https://' + row.m_web}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--color-primary)", fontSize: "0.88rem" }}
                      >
                        {row.m_web}
                      </a>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)" }}>—</span>
                    )}
                  </td>
                  <td>
                    <ActionButtons
                      onEdit={() => navigate(`/suppliers/edit/${row.m_id}`)}
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
