const { pool } = require('./mysqlStore');

async function createRelationalSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      user_id VARCHAR(64) PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(150) NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS purchase_requests (
      purchase_request_id VARCHAR(32) PRIMARY KEY,
      company VARCHAR(150), department VARCHAR(150), position VARCHAR(150),
      created_by VARCHAR(150), phone VARCHAR(50), description TEXT,
      status VARCHAR(50) NOT NULL, total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
      request_date DATE NULL, required_date DATE NULL, approver VARCHAR(150),
      purchasing_officer VARCHAR(150), approve_date DATETIME NULL, is_approved BOOLEAN NOT NULL DEFAULT FALSE,
      created_at DATETIME NULL, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS purchase_request_items (
      item_id VARCHAR(64) PRIMARY KEY,
      purchase_request_id VARCHAR(32) NOT NULL,
      description VARCHAR(500), unit VARCHAR(80), unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
      quantity DECIMAL(12,2) NOT NULL DEFAULT 0, remarks TEXT, total_item_price DECIMAL(12,2) NOT NULL DEFAULT 0,
      CONSTRAINT fk_pr_item_request FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(purchase_request_id) ON DELETE CASCADE,
      INDEX idx_pr_items_request (purchase_request_id)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS purchase_orders (
      purchase_order_id VARCHAR(32) PRIMARY KEY,
      purchase_request_id VARCHAR(32) NOT NULL,
      company VARCHAR(150), department VARCHAR(150), created_by VARCHAR(150), phone VARCHAR(50),
      seller_name VARCHAR(150), seller_contact VARCHAR(100), seller_address VARCHAR(500), seller_tax_id VARCHAR(100),
      payment_terms VARCHAR(100), delivery_terms VARCHAR(150), description TEXT, required_date DATE NULL,
      status VARCHAR(50) NOT NULL, total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
      approved BOOLEAN NOT NULL DEFAULT FALSE, approved_by VARCHAR(150), approved_at DATETIME NULL,
      tracking_number VARCHAR(150), notes TEXT, created_at DATETIME NULL, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_po_request FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(purchase_request_id)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS purchase_order_items (
      item_id VARCHAR(64) PRIMARY KEY,
      purchase_order_id VARCHAR(32) NOT NULL,
      description VARCHAR(500), unit VARCHAR(80), unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
      quantity DECIMAL(12,2) NOT NULL DEFAULT 0, discount DECIMAL(12,2) NOT NULL DEFAULT 0,
      total_item_price DECIMAL(12,2) NOT NULL DEFAULT 0, received_quantity DECIMAL(12,2) NOT NULL DEFAULT 0, notes TEXT,
      CONSTRAINT fk_po_item_order FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(purchase_order_id) ON DELETE CASCADE,
      INDEX idx_po_items_order (purchase_order_id)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS asset_receipts (
      receipt_id VARCHAR(32) PRIMARY KEY,
      purchase_order_id VARCHAR(32), purchase_request_id VARCHAR(32), received_date DATE NULL,
      reference_number VARCHAR(150), status VARCHAR(50), total_received DECIMAL(12,2) NOT NULL DEFAULT 0,
      created_at DATETIME NULL, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_receipt_order FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(purchase_order_id) ON DELETE SET NULL
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS asset_receipt_items (
      item_id VARCHAR(64) PRIMARY KEY,
      receipt_id VARCHAR(32) NOT NULL,
      purchase_order_item_id VARCHAR(64), description VARCHAR(500), quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
      CONSTRAINT fk_receipt_item_receipt FOREIGN KEY (receipt_id) REFERENCES asset_receipts(receipt_id) ON DELETE CASCADE,
      INDEX idx_receipt_items_receipt (receipt_id)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS notifications (
      notification_id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64), message TEXT, priority VARCHAR(30), is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at DATETIME NULL, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
    ) ENGINE=InnoDB`
  ];
  for (const sql of statements) await pool.query(sql);
}

const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const d = value => value ? new Date(value) : null;

async function syncUsers(rows) {
  for (const u of rows || []) await pool.query(`INSERT INTO users (user_id, username, password_hash, display_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE username=VALUES(username), password_hash=VALUES(password_hash), display_name=VALUES(display_name), role=VALUES(role)`, [u.userId, u.username, u.password, u.display_name || u.username, u.role || 'User', d(u.createdAt)]);
}

async function syncPurchaseRequests(data) {
  for (const [id, pr] of Object.entries(data || {})) {
    await pool.query(`INSERT INTO purchase_requests (purchase_request_id, company, department, position, created_by, phone, description, status, total_price, request_date, required_date, approver, purchasing_officer, approve_date, is_approved, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=VALUES(status), total_price=VALUES(total_price), description=VALUES(description), required_date=VALUES(required_date), approve_date=VALUES(approve_date), is_approved=VALUES(is_approved)`, [id, pr.company, pr.department, pr.position, pr.createdBy, pr.phone, pr.description, pr.status || 'Pending', n(pr.totalPrice), d(pr.requestDate), d(pr.requiredDate), pr.approver, pr.purchasingOfficer, d(pr.approveDate), Boolean(pr.isApproved), d(pr.createdAt)]);
    await pool.query('DELETE FROM purchase_request_items WHERE purchase_request_id = ?', [id]);
    for (const item of pr.item || []) await pool.query(`INSERT INTO purchase_request_items (item_id, purchase_request_id, description, unit, unit_price, quantity, remarks, total_item_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [item.itemId, id, item.description, item.unit, n(item.unitPrice), n(item.quantity), item.remarks, n(item.totalItemPrice)]);
  }
}

async function syncPurchaseOrders(data) {
  for (const [id, po] of Object.entries(data || {})) {
    const seller = po.sellerInfo || {};
    const approval = po.approvalStatus || {};
    await pool.query(`INSERT INTO purchase_orders (purchase_order_id, purchase_request_id, company, department, created_by, phone, seller_name, seller_contact, seller_address, seller_tax_id, payment_terms, delivery_terms, description, required_date, status, total_price, approved, approved_by, approved_at, tracking_number, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=VALUES(status), total_price=VALUES(total_price), approved=VALUES(approved), approved_by=VALUES(approved_by), approved_at=VALUES(approved_at), tracking_number=VALUES(tracking_number), notes=VALUES(notes)`, [id, po.purchaseRequestId, po.company, po.department, po.createdBy, po.phone, seller.name || po.sellerName, seller.contact || po.sellerContact, seller.address || po.sellerAddress, seller.taxId, po.paymentTerms, po.deliveryTerms, po.description, d(po.requiredDate), po.status || 'Pending', n(po.totalPrice), Boolean(approval.approved), approval.approvedBy, d(approval.approvedAt), po.trackingNumber, po.notes, d(po.createdAt)]);
    await pool.query('DELETE FROM purchase_order_items WHERE purchase_order_id = ?', [id]);
    for (const item of po.items || []) await pool.query(`INSERT INTO purchase_order_items (item_id, purchase_order_id, description, unit, unit_price, quantity, discount, total_item_price, received_quantity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [item.itemId || `${id}-${item.description}`, id, item.description, item.unit, n(item.unitPrice), n(item.quantity), n(item.discount), n(item.totalItemPrice), n(item.receivedQuantity), item.notes]);
  }
}

async function syncAssetReceipts(data) {
  for (const [id, receipt] of Object.entries(data || {})) {
    await pool.query(`INSERT INTO asset_receipts (receipt_id, purchase_order_id, purchase_request_id, received_date, reference_number, status, total_received, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=VALUES(status), total_received=VALUES(total_received), received_date=VALUES(received_date)`, [id, receipt.purchaseOrderId, receipt.purchaseRequestId, d(receipt.receivedDate), receipt.referenceNumber, receipt.status, n(receipt.totalReceived), d(receipt.createdAt)]);
    await pool.query('DELETE FROM asset_receipt_items WHERE receipt_id = ?', [id]);
    for (const item of receipt.items || []) await pool.query('INSERT INTO asset_receipt_items (item_id, receipt_id, purchase_order_item_id, description, quantity) VALUES (?, ?, ?, ?, ?)', [item.itemId || `${id}-${item.description}`, id, item.purchaseOrderItemId, item.description, n(item.quantity || item.receivedQuantity)]);
  }
}

async function syncRelational(collection, data) {
  if (collection === 'users') return syncUsers(data);
  if (collection === 'purchase_requests') return syncPurchaseRequests(data);
  if (collection === 'purchase_orders') return syncPurchaseOrders(data);
  if (collection === 'asset_receipts') return syncAssetReceipts(data);
  return undefined;
}

module.exports = { createRelationalSchema, syncRelational };
