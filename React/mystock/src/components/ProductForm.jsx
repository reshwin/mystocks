import { useEffect, useState } from 'react';
import { getProductTypeItems } from '../services/api';

const makeFormData = (init) => ({
  m_name:          init?.m_name          ?? '',
  m_id_type:       init?.typeId          ?? null,
  m_pins:          init?.m_pins  != null  ? init.m_pins : '',
  m_rack_location: init?.m_rack_location ?? '',
  m_link:          init?.m_link          ?? '',
  m_description:   init?.m_description   ?? '',
});

export default function ProductForm({ initialValues, onSubmit, mode }) {
  const [formData, setFormData]     = useState(makeFormData(initialValues));
  const [selectedType, setSelectedType] = useState(initialValues?.m_type ?? '');
  const [allItems, setAllItems]     = useState([]);  // [{id, type, typeSub}] — full list

  // Single fetch on mount — drives both dropdowns
  useEffect(() => {
    getProductTypeItems()
      .then(setAllItems)
      .catch(console.error);
  }, []);

  // Distinct type names for the first dropdown
  const types = [...new Set(allItems.map(i => i.type))].sort();

  // All rows that belong to the selected type (includes null-subtype rows)
  const subtypes = allItems.filter(i => i.type === selectedType);

  // Auto-set m_id_type whenever subtypes resolves to exactly one option
  useEffect(() => {
    if (subtypes.length === 1 && subtypes[0].id != null) {
      setFormData(prev => ({ ...prev, m_id_type: subtypes[0].id }));
    }
  }, [subtypes.length, selectedType]);

  const handleChange = ({ target: { name, value, type: inputType } }) =>
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'number' && value !== '' ? Number(value) : value,
    }));

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setFormData(prev => ({ ...prev, m_id_type: null }));
  };

  const handleSubTypeChange = (e) => {
    const raw = Number(e.target.value);
    const id = e.target.value !== '' && !Number.isNaN(raw) ? raw : null;
    setFormData(prev => ({ ...prev, m_id_type: id }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      m_pins: formData.m_pins === '' ? null : Number(formData.m_pins),
    };
    console.log('[ProductForm] submit payload:', payload);
    onSubmit(payload);
  };

  const subTypeValue = formData.m_id_type != null ? String(formData.m_id_type) : '';

  // Label for an option: show typeSub if present, otherwise show type
  const optionLabel = (st) => st.typeSub ?? st.type;

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="card-header">
        <div>
          <h3>{mode === 'edit' ? 'Update Component' : 'New Component'}</h3>
          <p>Fill in the product details below.</p>
        </div>
      </div>

      <div className="form-grid">

        <div className="field full">
          <label htmlFor="m_name">Product Name</label>
          <input
            id="m_name" name="m_name" type="text"
            value={formData.m_name}
            onChange={handleChange}
            placeholder="e.g. STM32G071RBT6"
            required
          />
        </div>

        {/* Type — first dropdown */}
        <div className="field">
          <label htmlFor="type_select">Type</label>
          <select id="type_select" value={selectedType} onChange={handleTypeChange}>
            <option value="">— Select type —</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Sub-type — filtered from the same loaded list */}
        <div className="field">
          <label htmlFor="subtype_select">Sub-type</label>
          <select
            id="subtype_select"
            value={subTypeValue}
            onChange={handleSubTypeChange}
            disabled={!selectedType || subtypes.length === 0}
          >
            <option value="">— Select sub-type —</option>
            {subtypes.map(st => (
              <option key={st.id} value={String(st.id)}>
                {optionLabel(st)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="m_pins">Pin Count</label>
          <input
            id="m_pins" name="m_pins" type="number"
            value={formData.m_pins}
            onChange={handleChange}
            placeholder="e.g. 64"
          />
        </div>

        <div className="field">
          <label htmlFor="m_rack_location">Rack Location</label>
          <input
            id="m_rack_location" name="m_rack_location" type="text"
            value={formData.m_rack_location}
            onChange={handleChange}
            placeholder="e.g. A1-R3"
          />
        </div>

        <div className="field full">
          <label htmlFor="m_link">Product Link</label>
          <input
            id="m_link" name="m_link" type="url"
            value={formData.m_link}
            onChange={handleChange}
            placeholder="https://…"
          />
        </div>

        <div className="field full">
          <label htmlFor="m_description">Description</label>
          <textarea
            id="m_description" name="m_description"
            value={formData.m_description}
            onChange={handleChange}
            placeholder="Short description of the component"
          />
        </div>

      </div>

      <div className="form-footer">
        <button className="btn btn-primary" type="submit">
          {mode === 'edit' ? 'Update Component' : 'Save Component'}
        </button>
      </div>
    </form>
  );
}
