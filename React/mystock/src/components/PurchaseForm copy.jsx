import { useMemo, useState } from 'react';
import { capitalize } from "../utils/common";

const defaultValues = {
  m_id_supplier: '',
  m_order_no: '',
  m_slno: '',
  m_date: '',
  m_item: '',
  m_type: '',
  m_date_received: '',
  m_package: '',
  m_pins: '',
  m_qty: '',
  m_rate: '',
  m_gst: '',
  m_amount: '',
  m_unit: '',
  m_supplier_id: '',
  m_courier: '',
  m_tracking: '',
  m_remarks: '',
  m_for_project: '',
  m_description: '',
  m_buy_link: ''
};

const fieldOrder = [
  ['m_id_supplier', 'select'],
  ['m_order_no', 'text'],
  ['m_slno', 'number'],
  ['m_date', 'date'],
  ['m_item', 'text'],
  ['m_type', 'text'],
  ['m_date_received', 'date'],
  ['m_package', 'text'],
  ['m_pins', 'number'],
  ['m_qty', 'number'],
  ['m_rate', 'number'],
  ['m_gst', 'number'],
  ['m_amount', 'number'],
  ['m_unit', 'text'],
  ['m_supplier_id', 'text'],
  ['m_courier', 'text'],
  ['m_tracking', 'text'],
  ['m_remarks', 'text'],
  ['m_for_project', 'text'],
  ['m_description', 'textarea'],
  ['m_buy_link', 'text']
];

export default function PurchaseFormXXX({ initialValues, suppliers, onSubmit, mode }) {
  const [formData, setFormData] = useState({ ...defaultValues, ...initialValues });

  const computedAmount = useMemo(() => {
    const qty = Number(formData.m_qty || 0);
    const rate = Number(formData.m_rate || 0);
    const gst = Number(formData.m_gst || 0);
    return qty * (rate + gst);
  }, [formData.m_qty, formData.m_rate, formData.m_gst]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...formData,
      m_amount: formData.m_amount || computedAmount
    };
    onSubmit(payload);
  };

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="card-header">
        <div>
          <h3>{mode === 'edit' ? 'Update Purchase' : 'Create Purchase'}</h3>
          <p>Uses exact tbl_purchase field names for easier C# Core API integration.</p>
        </div>
        <span className="pill">Unique key: m_id_supplier + m_order_no + m_slno</span>
      </div>

      <div className="form-grid">
        {fieldOrder.map(([fieldName, fieldType]) => {
          const full = fieldName === 'm_description' || fieldName === 'm_buy_link';

          if (fieldType === 'select') {
            return (
              <div className={`field ${full ? 'full' : ''}`} key={fieldName}>
                <label htmlFor={fieldName}>{fieldName}</label>
                <select
                  id={fieldName}
                  name={fieldName}
                  value={formData[fieldName]}
                  onChange={handleChange}
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.m_id} value={supplier.m_id} title='{supplier.id}'>
                      {capitalize(supplier.name)}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (fieldType === 'textarea') {
            return (
              <div className="field full" key={fieldName}>
                <label htmlFor={fieldName}>{fieldName}</label>
                <textarea
                  id={fieldName}
                  name={fieldName}
                  value={formData[fieldName]}
                  onChange={handleChange}
                />
              </div>
            );
          }

          return (
            <div className={`field ${full ? 'full' : ''}`} key={fieldName}>
              <label htmlFor={fieldName}>{fieldName}</label>
              <input
                id={fieldName}
                name={fieldName}
                type={fieldType}
                value={formData[fieldName]}
                onChange={handleChange}
              />
            </div>
          );
        })}
      </div>

      <div className="form-footer">
        <div className="summary-box">
          <span className="summary-label">Calculated preview</span>
          <strong>m_amount: {computedAmount.toFixed(2)}</strong>
        </div>
        <button className="btn btn-primary" type="submit">
          {mode === 'edit' ? 'Update Purchase' : 'Save Purchase'}
        </button>
      </div>
    </form>
  );
}