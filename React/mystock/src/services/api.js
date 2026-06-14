import axios from "axios";
import { getStoredToken } from "../context/AuthContext";

const BASE = import.meta.env.VITE_API_BASE;

// Attach the stored JWT to every axios request so the API can authorize
// the caller (writes require the admin/manager role).
axios.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Same Bearer header for the fetch-based calls (the deletes).
const authHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Field normalizers — handle both m_name (C# property matches DB column)
// and name (standard C# PascalCase → camelCase serialization).

const normSupplier = s => ({
  m_id:   s.m_id   ?? s.id,
  m_name: s.m_name ?? s.name,
  m_web:  s.m_web  ?? s.web ?? null,
});

const normProduct = p => ({
  m_id:            p.id,
  m_name:          p.name,
  typeId:          p.typeId          ?? null,
  m_type:          p.type,
  m_type_sub:      p.typeSub,
  m_pins:          p.pins,
  m_rack_location: p.rackLocation,
  m_link:          p.link,
  m_description:   p.description,
  stockPurchased:  p.stockPurchased  ?? null,
  stockIn:         p.stockIn         ?? null,
  stockOut:        p.stockOut        ?? null,
});

// ── Suppliers ──────────────────────────────────────────────────────────────

export async function getSuppliers() {
  const res = await fetch(`${BASE}/api/suppliers/items`);
  if (!res.ok) throw new Error("Failed to fetch suppliers");
  const data = await res.json();
  return data.map(normSupplier);
}

export async function getSupplierById(id) {
  const res = await fetch(`${BASE}/api/suppliers/${id}`);
  if (!res.ok) throw new Error("Failed to fetch supplier");
  return normSupplier(await res.json());
}

export async function createSupplier(payload) {
  const res = await axios.post(`${BASE}/api/suppliers/create`, payload);
  return res.data;
}

export async function updateSupplier(id, payload) {
  const res = await axios.put(`${BASE}/api/suppliers/update/${id}`, payload);
  return res.data;
}

export async function deleteSupplier(id) {
  const res = await fetch(`${BASE}/api/suppliers/delete/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

// ── Products ───────────────────────────────────────────────────────────────

export async function getProducts() {
  const res = await fetch(`${BASE}/api/products/items`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data.map(normProduct);
}

export async function getProductById(id) {
  const res = await fetch(`${BASE}/api/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return normProduct(await res.json());
}

export async function getProductTypes() {
  const res = await fetch(`${BASE}/api/producttypes/types`);
  if (!res.ok) throw new Error("Failed to fetch product types");
  return res.json();
}

export async function getProductSubTypes(type) {
  const res = await fetch(`${BASE}/api/producttypes/subtypes/${encodeURIComponent(type)}`);
  if (!res.ok) throw new Error("Failed to fetch product sub-types");
  const data = await res.json();
  return data.map(st => ({
    id:      st.id      ?? st.m_id,
    type:    st.type    ?? st.m_type,
    typeSub: st.typeSub ?? st.m_type_sub ?? null,
  }));
}

// Returns all [{id, type, typeSub}] rows — used by the product form
// to build both the Type and SubType dropdowns in a single fetch.
export async function getProductTypeItems() {
  const res = await fetch(`${BASE}/api/producttypes/items`);
  if (!res.ok) throw new Error("Failed to fetch product type items");
  const data = await res.json();
  return data.map(st => ({
    id:      st.id      ?? st.m_id,
    type:    st.type    ?? st.m_type,
    typeSub: st.typeSub ?? st.m_type_sub ?? null,
  }));
}

export async function createProduct(payload) {
  const res = await axios.post(`${BASE}/api/products/create`, payload);
  return res.data;
}

export async function updateProduct(id, payload) {
  const res = await axios.put(`${BASE}/api/products/update/${id}`, payload);
  return res.data;
}

export async function deleteProduct(id) {
  const res = await fetch(`${BASE}/api/products/delete/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

export async function patchRackLocation(id, rackLocation) {
  const res = await axios.patch(`${BASE}/api/products/${id}/rack`, { rackLocation });
  return res.data;
}

// ── Purchases ──────────────────────────────────────────────────────────────

export async function getComponents() {
  const res = await fetch(`${BASE}/api/products/items`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch components");
  const data = await res.json();
  // Map to the {id, name} shape PurchaseForm expects
  return data.map(p => ({
    id:   p.m_id   ?? p.id,
    name: p.m_name ?? p.name,
  }));
}

export async function getPurchaseById(m_id) {
  const res = await fetch(`${BASE}/api/purchase/purchasebyid?m_id=${m_id}`);
  if (!res.ok) throw new Error("Failed to fetch purchase");
  return res.json();
}

// Purchase rows for one product — [{id, date, dateReceived, orderNo, qty, supplier}]
export async function getPurchasesByProduct(productId) {
  const res = await fetch(`${BASE}/api/purchase/byproduct?productId=${productId}&t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch purchases for product");
  return res.json();
}

// "" / null → null, otherwise a real number. The form inputs yield strings,
// but the API's double? fields can't bind from JSON strings (would 400).
const toNum = v => (v === "" || v == null ? null : Number(v));

const normPurchasePayload = payload => ({
  ...payload,
  m_id_supplier: Number(payload.m_id_supplier),
  items: (payload.items ?? []).map(it => ({
    ...it,
    m_qty:    toNum(it.m_qty),
    m_rate:   toNum(it.m_rate),
    m_gst:    toNum(it.m_gst),
    m_amount: toNum(it.m_amount),
  })),
});

export async function createPurchase(payload) {
  const res = await axios.post(`${BASE}/api/purchase/create`, normPurchasePayload(payload));
  return res.data;
}

export async function updatePurchase(m_id, payload) {
  const res = await axios.put(`${BASE}/api/purchase/update/${m_id}`, normPurchasePayload(payload));
  return res.data;
}

export async function deletePurchase(id) {
  const res = await fetch(`${BASE}/api/purchase/delete/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

// ── Stock Movements ────────────────────────────────────────────────────────

const normMovement = m => ({
  m_id:          m.m_id          ?? m.mId          ?? m.id,
  m_product_id:  m.m_product_id  ?? m.mProductId   ?? m.productId,
  m_type:        m.m_type        ?? m.mType         ?? m.type,
  m_direction:   m.m_direction   ?? m.mDirection    ?? m.direction,
  m_qty:         m.m_qty         ?? m.mQty          ?? m.qty,
  m_date:        m.m_date        ?? m.mDate         ?? m.date,
  m_purchase_id: m.m_purchase_id ?? m.mPurchaseId   ?? m.purchaseId   ?? null,
  m_project:     m.m_project     ?? m.mProject      ?? m.project      ?? null,
  m_notes:       m.m_notes       ?? m.mNotes        ?? m.notes        ?? null,
  m_user_id:     m.m_user_id     ?? m.mUserId       ?? m.userId,
  m_user_name:   m.m_user_name   ?? m.mUserName     ?? m.userName ?? m.user ?? null,
});

export async function getStockMovements({ page = 1, pageSize = 20, productId = '' } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  if (productId) params.append('productId', productId);
  const res = await fetch(`${BASE}/api/stock/movements?${params}&t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch stock movements');
  const json = await res.json();
  return { data: (json.data ?? json).map(normMovement), total: json.total ?? json.length ?? 0 };
}

export async function createStockMovement(payload) {
  const res = await axios.post(`${BASE}/api/stock/movements`, payload);
  return res.data;
}
