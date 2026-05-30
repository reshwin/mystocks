import { useEffect, useState } from "react";
import { getPurchases } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Purchases() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    const res = await getPurchases(page, pageSize);
    setData(res.data.data);
    setTotal(res.data.totalCount);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h2>Purchases</h2>

      <button onClick={() => navigate("/purchase/new")}>
        New Purchase
      </button>

      <table border="1">
        <thead>
          <tr>
            <th>Order No</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map(p => (
            <tr key={p.m_id}>
              <td>{p.m_order_no}</td>
              <td>{p.m_item}</td>
              <td>{p.m_qty}</td>
              <td>{p.m_rate}</td>
              <td>
                <button onClick={() => navigate(`/purchase/edit/${p.m_id}`)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div style={{ marginTop: 20 }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}