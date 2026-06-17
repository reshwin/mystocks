import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import ActionButtons from '../components/ActionButtons';
import { useAuth } from '../context/AuthContext';
import usePersistentState from '../hooks/usePersistentState';
import { deletePurchase } from '../services/api';
import React from "react";
import './PurchaseListPage.css';


export default function PurchaseListPage() {
  const navigate = useNavigate();
  const { canEdit } = useAuth();

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [expandedRow, setExpandedRow] = useState(null);
  const [itemsMap, setItemsMap] = useState({});
  const [search, setSearch] = usePersistentState("purchases.search", "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => search);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [tick, setTick] = useState(0);

  const pageSize = 10;

  useEffect(() => {
    setItemsMap({});
    if (pendingOnly) {
      // Fetch all records and filter client-side (backend doesn't support pending param)
      fetch(`${import.meta.env.VITE_API_BASE}/api/purchase?page=1&pageSize=9999&search=${debouncedSearch}&t=${Date.now()}`, { cache: "no-store" })
        .then(res => res.json())
        .then(res => {
          const all = res.data ?? [];
          const filtered = all.filter(r => !r.dateReceived);
          setData(filtered.slice((page - 1) * pageSize, page * pageSize));
          setTotal(filtered.length);
        })
        .catch(err => console.error(err));
    } else {
      fetch(`${import.meta.env.VITE_API_BASE}/api/purchase?page=${page}&pageSize=${pageSize}&search=${debouncedSearch}&t=${Date.now()}`, { cache: "no-store" })
        .then(res => res.json())
        .then(res => {
          setData(res.data ?? []);
          setTotal(res.total);
        })
        .catch(err => console.error(err));
    }
  }, [page, debouncedSearch, pendingOnly, tick]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const togglePending = () => {
    setPendingOnly(v => !v);
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete purchase record #${id}?`)) return;
    try {
      await deletePurchase(id);
      setExpandedRow(null);
      setTick(t => t + 1);
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  };

  const handleExpand = async (row) => {
    //const key = `${row.supplierId}_${row.orderNo}`;
    const key = row.Id ?? `${row.orderNo}-${row.supplier}`;
    //const key = row.Id;
    // collapse
    if (expandedRow === key) {
      setExpandedRow(null);
      return;
    }

    setExpandedRow(key);


    if (!itemsMap[key] || true) {

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/purchase/items?supplierId=${row.supplierId}&orderNo=${encodeURIComponent(row.orderNo)}&t=${Date.now()}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      setItemsMap(prev => ({
        ...prev,
        [key]: data
      }));
    }
  };



  return (
    <div className="page-stack">
      {/*description="List and manage tbl_purchase records, then open create or edit screens."*/}
      <PageIntro
        title="Purchases"

        action={
          canEdit && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/purchase/new')}
            >
              New Purchase
            </button>
          )
        }
      />
      <section className="card content-card" style={{ borderRadius: "6px" }}>
        <div className="card-header">
          <div className="card-toolbar">
            <div>
              <h3>Purchases</h3>
              <p>Purchase list.</p>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search purchases…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={search ? { borderColor: '#dc2626', color: '#dc2626', fontWeight: 'bold' } : undefined}
              />
              {search && (
                <span
                  className="search-clear"
                  onClick={() => setSearch("")}
                  onMouseEnter={e => e.currentTarget.style.color = "orangered"}
                  onMouseLeave={e => e.currentTarget.style.color = ""}
                >×</span>
              )}
            </div>

            <button
              type="button"
              className={`btn ${pendingOnly ? 'btn-pending-active' : 'btn-outline'}`}
              onClick={togglePending}
              title="Show only orders with no received date"
            >
              Pending{pendingOnly ? ' ×' : ''}
            </button>




          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Order No</th>
              <th>Product / Items</th>
              <th style={{ textAlign: "center" }}>Items</th>
              <th>Ordered</th>
              <th>Received</th>
              <th style={{ width: "80px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>

            {data.map((row, index) => {
              const key = row.Id ?? `${row.orderNo}-${row.supplier}`;
              const pending = !row.dateReceived;
              const unregistered = !row.quantity || row.quantity === 0;

              const fmtDate = (val) => {
                if (!val) return '';
                const d = new Date(val);
                if (isNaN(d.getTime())) return '';
                return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
              };

              return (
                <React.Fragment key={key}>
                  <tr key={index} className={[pending && 'row-pending', unregistered && 'row-unregistered'].filter(Boolean).join(' ')}>
                    <td>{row.supplier}</td>
                    <td>
                      {row.orderNo}
                    </td>


                    <td onDoubleClick={() => handleExpand(row)}>
                      <div className="cell-container">
                        {/* Top row */}
                        <div className="cell-header">
                          <span>{row.product}</span>

                          <span
                            className="expand-icon"
                            onClick={() => handleExpand(row)}
                            onMouseEnter={(e) => e.target.style.color = "orangered"}
                            onMouseLeave={(e) => e.target.style.color = "#888"}
                          >
                            {expandedRow === key ? "−" : "+"}
                          </span>
                        </div>

                        {expandedRow === key && (
                          <div className="cell-expand" style={{ marginLeft: "1em", marginRight: "1em", border: "1px solid #dcdcdc", borderRadius: "5px", maxHeight: "220px", overflowY: "auto", paddingRight: "8px" }}>
                            <table className="inner-table">
                              <colgroup>
                                <col style={{ width: "80%" }} />
                                <col style={{ width: "10%" }} />
                                <col style={{ width: "10%" }} />
                                <col style={{ width: "10%" }} />
                              </colgroup>
                              <thead>
                                <tr>
                                  <th>Item</th>
                                  <th>Link</th>
                                  <th>Rack</th>
                                  <th style={{ textAlign: "right" }}>Qty</th>
                                </tr>
                              </thead>
                              <tbody>
                                {itemsMap[key]?.length === 0 && (
                                  <tr>
                                    <td colSpan="4" style={{ color: '#dc2626', fontStyle: 'italic', padding: '4px 6px', fontSize: '12px' }}>
                                      Items not found in product catalogue
                                    </td>
                                  </tr>
                                )}
                                {itemsMap[key]?.map((item, i) => (
                                  <tr key={`${item.item}-${i}`} title={item.desc}>
                                    <td>{item.item}</td>

                                    <td>
                                      {(item.link != null && item.link.length > 0) && (
                                        <a
                                          href={item.link}   // or your route
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="link-icon"
                                          title="Open product"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                          >
                                            <path d="M10 13a5 5 0 0 0 7.07 0l3.54-3.54a5 5 0 0 0-7.07-7.07L10 5" />
                                            <path d="M14 11a5 5 0 0 0-7.07 0L3.39 14.54a5 5 0 1 0 7.07 7.07L14 19" />
                                          </svg>

                                        </a>
                                      )}
                                    </td>
                                    <td style={{ textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{item.rack}</td>
                                    <td style={{ textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{item.qty}</td>







                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}


                      </div>
                    </td>



                    <td style={{ textAlign: "center", fontVariantNumeric: "tabular-nums", color: unregistered ? '#c2410c' : undefined, fontWeight: unregistered ? 600 : undefined }}>
                      {row.quantity ?? '—'}
                    </td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{fmtDate(row.date)}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>
                      {pending
                        ? <span className="badge-pending">Pending</span>
                        : fmtDate(row.dateReceived)}
                    </td>


                    <td>
                      {canEdit && (
                        <ActionButtons
                          onEdit={() => navigate('/purchase/edit/' + row.id)}
                          onDelete={() => handleDelete(row.id)}
                          deleteDisabled
                        />
                      )}
                    </td>





                  </tr>

                </React.Fragment>
              );
            })}


          </tbody>
        </table>

        <div className="pagination">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
          <span>Page {page} of {totalPages || 1}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next →</button>
        </div>


      </section >
    </div >
  );
}