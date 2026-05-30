import { useState,useEffect } from "react";
import { capitalize } from "../utils/common";
import Select from "react-select";


const defaultItem = {
  m_item: null,
  m_qty: "",
  m_rate: "",
  m_gst: "",
  m_amount: ""
};

const getToday = () => new Date().toISOString().split("T")[0];

const defaultForm = {
  m_order_no: "",
  m_id_supplier: 0,
  m_date: getToday(),
  m_date_received:null,
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
    <form onSubmit={handleSubmit} style={{ padding: 20 }}>


      {/* 🔹 Header Section */}
      <div style={{ marginBottom: 15 }}>



        <table className="PurchaeFormHead" border="0" cellPadding="5" style={{ width: "40%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Order No</th>
              <th>Supplier</th>
              <th>Order Date</th>
              <th>Received On</th>
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
                  style={{ padding: "2px", borderRadius: "4px", marginRight: "10px", border: "1px solid #ccc" }}
                />
              </td>
              <td>
                <select
                  id="m_id_supplier"
                  name="m_id_supplier"
value={form.m_id_supplier ?? ""}   // ✅ important
                  onChange={handleChange}
                  style={{ padding: "2px", borderRadius: "4px", marginRight: "10px", border: "1px solid #ccc" }}
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
                  style={{ padding: "2px", borderRadius: "4px", marginRight: "10px", border: "1px solid #ccc" }}
                />
              </td>
              <td>
                <input
                  type="date"
                  name="m_date_received"
value={form.m_date_received ? form.m_date_received.split("T")[0] : ""}
                  //value={form.m_date_received ?? ""}
                  onChange={handleChange}
                  style={{ padding: "2px", borderRadius: "4px", marginRight: "10px", border: "1px solid #ccc" }}
                />
              </td>
            </tr>

          </tbody>
        </table>




      </div>

      {/* 🔹 Items Table */}
      <table className="PurchaeFormData" border="1" cellPadding="5" style={{ width: "100%", tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "20%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
        </colgroup>
        <thead>

          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>GST</th>
            <th>Amount</th>
            <th>Product ID</th>
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
                <button type="button" onClick={() => removeItem(index)} disabled={mode === 'edit' || index === 0}>
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ➕ Add Item */}
      <button type="button" onClick={addItem} style={{ marginTop: 10 }}>
        + Add Item
      </button>

      {/* 💾 Submit */}
      <div style={{ marginTop: 20 }}>
        <button type="submit">Save Purchase</button>
      </div>
    </form>
  );
}