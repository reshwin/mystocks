export const suppliers = [
  { m_id: 1, m_name: 'Mouser Electronics', m_web: 'https://www.mouser.in' },
  { m_id: 2, m_name: 'DigiKey', m_web: 'https://www.digikey.in' },
  { m_id: 3, m_name: 'Element14', m_web: 'https://in.element14.com' },
  { m_id: 4, m_name: 'Robu', m_web: 'https://robu.in' }
];

export const products = [
  {
    m_id: 11,
    m_name: 'STM32G071RBT6',
    m_type: 'MCU',
    m_type_sub: 'STM32G0',
    m_pins: 64,
    m_rack_location: 'A1-R3',
    m_link: 'https://www.mouser.in',
    m_description: '32-bit MCU for controller board.'
  },
  {
    m_id: 12,
    m_name: 'W25Q128JVSSIQ',
    m_type: 'Flash',
    m_type_sub: 'NOR',
    m_pins: 8,
    m_rack_location: 'B2-R1',
    m_link: 'https://www.digikey.in',
    m_description: 'External flash memory.'
  },
  {
    m_id: 13,
    m_name: 'BL0942',
    m_type: 'Energy Meter',
    m_type_sub: 'AFE',
    m_pins: 24,
    m_rack_location: 'C4-R2',
    m_link: 'https://in.element14.com',
    m_description: 'Energy metering IC.'
  }
];

export const purchases = [
  {
    m_id: 101,
    m_id_supplier: 1,
    m_order_no: 'PO-2026-041',
    m_slno: 1,
    m_date: '2026-04-10',
    m_item: 'STM32G071RBT6',
    m_type: 'MCU',
    m_date_received: '2026-04-14',
    m_package: 'LQFP64',
    m_pins: 64,
    m_qty: 25,
    m_rate: 248,
    m_gst: 44.64,
    m_amount: 7321,
    m_unit: 'Nos',
    m_supplier_id: 'MOU-8891',
    m_courier: 'DHL',
    m_tracking: 'DHL77881233',
    m_remarks: 'For control board batch',
    m_for_project: 'BMS',
    m_description: 'STM32 controller stock order.',
    m_buy_link: 'https://www.mouser.in'
  },
  {
    m_id: 102,
    m_id_supplier: 2,
    m_order_no: 'PO-2026-042',
    m_slno: 1,
    m_date: '2026-04-11',
    m_item: 'W25Q128JVSSIQ',
    m_type: 'Flash',
    m_date_received: '2026-04-15',
    m_package: 'SOIC8',
    m_pins: 8,
    m_qty: 40,
    m_rate: 96,
    m_gst: 17.28,
    m_amount: 4531.2,
    m_unit: 'Nos',
    m_supplier_id: 'DIG-2811',
    m_courier: 'FedEx',
    m_tracking: 'FDX9917124',
    m_remarks: 'Flash stock refill',
    m_for_project: 'Logger',
    m_description: 'NOR flash for data logger boards.',
    m_buy_link: 'https://www.digikey.in'
  }
];