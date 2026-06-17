import { useEffect, useState } from 'react';
import Select from 'react-select';
import { capitalize } from '../utils/common';

const getToday = () => new Date().toISOString().split('T')[0];

// direction is determined by type — transfer is the only one the user can pick
const directionForType = {
  opening:     'in',
  consumption: 'out',
  return:      'in',
  writeoff:    'out',
  transfer:    null, // user chooses
};

const defaultForm = {
  m_product_id: '',
  m_type:       'opening',
  m_direction:  'in',
  m_qty:        '',
  m_date:       getToday(),
  m_purchase_id: '',
  m_project:    '',
  m_notes:      '',
};

export default function StockMovementForm({ products, projects = [], initialProduct, onSubmit, onCancel }) {
  const [form, setForm] = useState(defaultForm);

  // Product Type / Sub-type act as cascading filters to narrow the Component list.
  const [productType, setProductType] = useState('');
  const [productSubType, setProductSubType] = useState('');

  // Pre-fill Type / Sub-type / Component when opened for a specific component.
  useEffect(() => {
    if (initialProduct) {
      setProductType(initialProduct.m_type ?? '');
      setProductSubType(initialProduct.m_type_sub ?? '');
      setForm(prev => ({ ...prev, m_product_id: initialProduct.m_id ?? '' }));
    }
  }, [initialProduct]);

  const types = [...new Set(products.map(p => p.m_type).filter(Boolean))].sort();
  const subTypes = [...new Set(
    products
      .filter(p => !productType || p.m_type === productType)
      .map(p => p.m_type_sub)
      .filter(Boolean)
  )].sort();

  const filteredProducts = products.filter(p =>
    (!productType || p.m_type === productType) &&
    (!productSubType || p.m_type_sub === productSubType)
  );

  const productOptions = filteredProducts.map(p => ({ value: p.m_id, label: capitalize(p.m_name) }));
  const selectedProductOption = productOptions.find(o => o.value === form.m_product_id) ?? null;

  const handleProductTypeChange = (e) => {
    setProductType(e.target.value);
    setProductSubType('');
    setForm(prev => ({ ...prev, m_product_id: '' }));
  };

  const handleProductSubTypeChange = (e) => {
    setProductSubType(e.target.value);
    setForm(prev => ({ ...prev, m_product_id: '' }));
  };

  const handleTypeChange = (type) => {
    const dir = directionForType[type];
    setForm(prev => ({
      ...prev,
      m_type:      type,
      m_direction: dir ?? prev.m_direction,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      m_product_id:  Number(form.m_product_id),
      m_qty:         Number(form.m_qty),
      m_purchase_id: form.m_purchase_id ? Number(form.m_purchase_id) : null,
    };
    onSubmit(payload);
  };

  const autoDirection = directionForType[form.m_type];

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', maxWidth: 520 }}>

      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div className="field" style={{ flex: 1 }}>
          <label>Type <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(filter)</span></label>
          <select
            value={productType}
            onChange={handleProductTypeChange}
            className="field-select"
          >
            <option value="">All types</option>
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="field" style={{ flex: 1 }}>
          <label>Sub-type <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(filter)</span></label>
          <select
            value={productSubType}
            onChange={handleProductSubTypeChange}
            className="field-select"
            disabled={subTypes.length === 0}
          >
            <option value="">All sub-types</option>
            {subTypes.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field" style={{ marginBottom: 14 }}>
        <label>Component</label>
        <Select
          options={productOptions}
          value={selectedProductOption}
          onChange={opt => setForm(prev => ({ ...prev, m_product_id: opt?.value ?? '' }))}
          placeholder="Select component…"
          isClearable
          required
        />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div className="field" style={{ flex: 1 }}>
          <label>Type</label>
          <select
            name="m_type"
            value={form.m_type}
            onChange={e => handleTypeChange(e.target.value)}
            className="field-select"
          >
            <option value="opening">Opening stock</option>
            <option value="consumption">Consumption</option>
            <option value="return">Return</option>
            <option value="writeoff">Write-off</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        <div className="field" style={{ flex: 1 }}>
          <label>Direction</label>
          {autoDirection ? (
            <div style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', color: autoDirection === 'in' ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: '0.9rem' }}>
              {autoDirection === 'in' ? '↑ In' : '↓ Out'}
            </div>
          ) : (
            <select name="m_direction" value={form.m_direction} onChange={handleChange} className="field-select">
              <option value="in">↑ In</option>
              <option value="out">↓ Out</option>
            </select>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div className="field" style={{ flex: 1 }}>
          <label>Quantity</label>
          <input
            type="number"
            name="m_qty"
            value={form.m_qty}
            onChange={handleChange}
            placeholder="0"
            min="0.001"
            step="any"
            required
          />
        </div>

        <div className="field" style={{ flex: 1 }}>
          <label>Date</label>
          <input
            type="date"
            name="m_date"
            value={form.m_date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="field" style={{ marginBottom: 14 }}>
        <label>Project <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
        <select
          name="m_project"
          value={form.m_project}
          onChange={handleChange}
          className="field-select"
        >
          <option value="">— None —</option>
          {projects.map(p => (
            <option key={p.id} value={p.name}>{capitalize(p.name)}</option>
          ))}
        </select>
      </div>

      <div className="field" style={{ marginBottom: 20 }}>
        <label>Notes <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
        <input
          type="text"
          name="m_notes"
          value={form.m_notes}
          onChange={handleChange}
          placeholder="Any remarks…"
        />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn btn-primary">Save</button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}
