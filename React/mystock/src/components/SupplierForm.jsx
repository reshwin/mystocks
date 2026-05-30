import { useState } from 'react';

const defaultValues = {
  m_name: '',
  m_web: ''
};

const sanitize = obj =>
  Object.fromEntries(Object.entries(obj ?? {}).map(([k, v]) => [k, v ?? '']));

export default function SupplierForm({ initialValues, onSubmit, mode }) {
  const [formData, setFormData] = useState({ ...defaultValues, ...sanitize(initialValues) });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="card-header">
        <div>
          <h3>{mode === 'edit' ? 'Update Supplier' : 'New Supplier'}</h3>
          <p>Form for tbl_suppliers using the same field names.</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="field full">
          <label htmlFor="m_name">Supplier Name</label>
          <input
            id="m_name"
            name="m_name"
            type="text"
            value={formData.m_name}
            onChange={handleChange}
            placeholder="e.g. Mouser Electronics"
            required
          />
        </div>

        <div className="field full">
          <label htmlFor="m_web">Website</label>
          <input
            id="m_web"
            name="m_web"
            type="url"
            value={formData.m_web}
            onChange={handleChange}
            placeholder="https://…"
          />
        </div>
      </div>

      <div className="form-footer">
        <button className="btn btn-primary" type="submit">
          {mode === 'edit' ? 'Update Supplier' : 'Save Supplier'}
        </button>
      </div>
    </form>
  );
}