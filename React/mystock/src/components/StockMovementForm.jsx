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

export default function StockMovementForm({ products, onSubmit, onCancel }) {
  const [form, setForm] = useState(defaultForm);

  const productOptions = products.map(p => ({ value: p.m_id, label: capitalize(p.m_name) }));

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

      <div className="field" style={{ marginBottom: 14 }}>
        <label>Component</label>
        <Select
          options={productOptions}
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
        <input
          type="text"
          name="m_project"
          value={form.m_project}
          onChange={handleChange}
          placeholder="Project name…"
        />
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
