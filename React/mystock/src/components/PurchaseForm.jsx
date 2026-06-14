import { useState,useEffect } from "react";
import { capitalize } from "../utils/common";
import Select from "react-select";


const defaultItem = {
  m_item: null,
  m_qty: "",
  m_rate: "",
  m_gst: "",
  m_amount: "",
  m_description: "",
  m_buy_link: ""
};

const getToday = () => new Date().toISOString().split("T")[0];

const defaultForm = {
  m_order_no: "",
  m_id_supplier: 0,
  m_date: getToday(),
  m_date_received:null,
  m_courier: "",
  m_tracking: "",
  items: [{ ...defaultItem }]
  //items: [defaultItem]
};





export default function PurchaseForm({ onSubmit, suppliers, components, initialValues, mode }) {
  const [form, setForm] = useState(defaultForm);


  useEffect(() => {
    if (initialValues && initialValues.items) {
      console.log(initialValues)
      setForm({
        ...defaultForm,     // ensures missing fields are filled
        ...initialValues
      });
    }
  }, [initialValues]);


  // 🔹 Handle main form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Handle item field changes
  const handleItemChange = (index, field, value) => {
    console.log("handleItemChange:"+field+"____"+value);
    const updated = [...form.items];
    updated[index][field] = value;

    setForm((prev) => ({
      ...prev,
      items: updated
    }));
  };

  // ➕ Add new row
  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...defaultItem }]
    }));
  };

  // ❌ Remove row
  const removeItem = (index) => {
    const updated = form.items.filter((_, i) => i !== index);

    setForm((prev) => ({
      ...prev,
      items: updated.length ? updated : [defaultItem]
    }));
  };

  // 💾 Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Required header fields.
    if (!form.m_id_supplier || Number(form.m_id_supplier) === 0) {
      alert("Please select a supplier before saving.");
      return;
    }
    if (!form.m_order_no || String(form.m_order_no).trim() === "") {
      alert("Please enter an order number before saving.");
      return;
    }

    // Block save if any row has no item selected — ask the user to
    // remove the empty row instead of saving a blank entry.
    const emptyRows = form.items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.m_item || String(item.m_item).trim() === "");

    if (emptyRows.length > 0) {
      const rowNums = emptyRows.map(({ index }) => index + 1).join(", ");
      alert(`Item is empty in row ${rowNums}. Please select an item or remove the row before saving.`);
      return;
    }

    // Optional: add slno before sending
    const payload = {
      ...form,
      items: form.items.map((item, index) => ({
        ...item,
        m_slno: index + 1
      }))
    };

    console.log("Submitting:", payload);
    onSubmit && onSubmit(payload);
  };
  const fieldName = "";
  const full = fieldName === 'm_description' || fieldName === 'm_buy_link';

  const options = components.map(s => ({
    value: s.id,
    label: capitalize(s.name)   // careful: your field is m_name
  }));
console.log("options")
console.log(options)
  const handleSelectChange = (index, field, selected) => {
    handleItemChange(index, field, selected?.value || "");
  };
  return (
    <form onSubmit={handleSubmit} style={{ padding: 12, maxWidth: 920 }}>


      {/* 🔹 Header Section */}
      <div style={{ marginBottom: 15 }}>



        <table className="PurchaeFormHead" border="0" cellPadding="2" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Order No</th>
              <th>Supplier</th>
              <th>Order Date</th>
              <th>Received On</th>
              <th>Courier</th>
              <th>Tracking No</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                <input
                  name="m_order_no"
                  placeholder="Order No"
                  value={form.m_order_no ?? ""}
                  onChange={handleChange}
                />
              </td>
              <td>
                <select
                  id="m_id_supplier"
                  name="m_id_supplier"
value={form.m_id_supplier ?? ""}   // ✅ important
                  onChange={handleChange}
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id} title='{supplier.id}'>
                      {capitalize(supplier.name)}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="date"
                  name="m_date"
  value={form.m_date ? form.m_date.split("T")[0] : ""}
                  //value={form.m_date ?? ""}
                  onChange={handleChange}
                />
              </td>
              <td>
                <input
                  type="date"
                  name="m_date_received"
value={form.m_date_received ? form.m_date_received.split("T")[0] : ""}
                  //value={form.m_date_received ?? ""}
                  onChange={handleChange}
                />
              </td>
              <td>
                <input
                  name="m_courier"
                  placeholder="Courier"
                  value={form.m_courier ?? ""}
                  onChange={handleChange}
                />
              </td>
              <td>
                <input
                  name="m_tracking"
                  placeholder="Tracking No"
                  value={form.m_tracking ?? ""}
                  onChange={handleChange}
                />
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* Separator between header and item list */}
      <hr style={{ border: 0, borderTop: "1px solid var(--color-border)", margin: "10px 0 14px" }} />

      {/* 🔹 Items Table */}
      <table className="PurchaeFormData" border="1" cellPadding="2" style={{ width: "100%", tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "18%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "7%" }} />
        </colgroup>
        <thead>

          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>GST</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Buy Link</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {form.items.map((item, index) => (
            <tr key={index}>
              <td>
                {(() => {
                  const matched = item.m_item
                    ? options.find(o => o.label === item.m_item)
                    : null;
                  // If the stored name has no match in tbl_products, show it
                  // as a synthetic option so the field isn't blank.
                  const selectValue = matched
                    ?? (item.m_item ? { value: item.m_item, label: item.m_item, __unregistered: true } : null);

                  return (
                    <Select
                      options={options}
                      value={selectValue}
                      onChange={(selected) =>
                        handleItemChange(index, "m_item", selected?.label ?? null)
                      }
                      placeholder="Select item..."
                      isClearable
                      styles={{
                        singleValue: (base, state) =>
                          state.data.__unregistered
                            ? { ...base, color: '#c2410c', fontStyle: 'italic' }
                            : base,
                      }}
                    />
                  );
                })()}
              </td>


              <td>
                <input
                  type="number"
                  value={item.m_qty ?? ""}
                  onChange={(e) =>
                    handleItemChange(index, "m_qty", e.target.value)
                  }
                  placeholder="Qty"
                />
              </td>

              <td>
                <input
                  type="number"
                  value={item.m_rate ?? ""}
                  onChange={(e) =>
                    handleItemChange(index, "m_rate", e.target.value)
                  }
                  placeholder="Rate"
                />
              </td>


              <td>
                <input
                  type="number"
                  value={item.m_gst ?? ""}
                  onChange={(e) =>
                    handleItemChange(index, "m_gst", e.target.value)
                  }
                  placeholder="GST"
                />
              </td>

              <td>
                <input
                  type="number"
                  value={item.m_amount ?? ""}
                  onChange={(e) =>
                    handleItemChange(index, "m_amount", e.target.value)
                  }
                  placeholder="Amount"
                />
              </td>

              <td>
                <input
                  type="text"
                  value={item.m_description ?? ""}
                  onChange={(e) =>
                    handleItemChange(index, "m_description", e.target.value)
                  }
                  placeholder="Description"
                  title={item.m_description ?? ""}
                  maxLength={200}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </td>

              <td>
                <input
                  type="text"
                  value={item.m_buy_link ?? ""}
                  onChange={(e) =>
                    handleItemChange(index, "m_buy_link", e.target.value)
                  }
                  placeholder="Buy link"
                  title={item.m_buy_link ?? ""}
                  maxLength={200}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </td>



              <td style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={mode === 'edit' || index === 0}
                  title="Remove item"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: mode === 'edit' || index === 0 ? "not-allowed" : "pointer",
                    color: mode === 'edit' || index === 0 ? "#ccc" : "#dc2626",
                    padding: 4,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ➕ Add Item */}
      <button
        type="button"
        onClick={addItem}
        className="btn btn-secondary"
        style={{ marginTop: 10, fontSize: 13, padding: "5px 12px", color: "var(--color-primary)", borderColor: "var(--color-primary)" }}
      >
        + Add Item
      </button>

      {/* 💾 Submit */}
      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--color-border)", paddingTop: 14 }}>
        <button type="submit" className="btn btn-primary" style={{ fontSize: 14, padding: "8px 22px" }}>
          {mode === 'edit' ? 'Update Purchase' : 'Save Purchase'}
        </button>
      </div>
    </form>
  );
}