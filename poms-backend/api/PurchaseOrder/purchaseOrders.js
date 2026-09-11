const express = require('express');
const router = express.Router();
const fs = require('../../db/mysqlStore');
const path = require('path');
const { services } = require('../PurchaseRequest/purchaseRequests');
const dbPath = path.join(__dirname, '../../dummy/po.json');

// Helper functions
const getData = () => {
  const rawData = fs.readFileSync(dbPath);
  return JSON.parse(rawData);
};

const writeData = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Enhanced PO Functions
async function poCreate(data) {
  const db = getData();
  
  const pr = await services.prGetById(data.purchaseRequestId);
  if (!pr) throw new Error('Purchase Request not found');
  if (pr.status !== "Approved") throw new Error('PR must be Approved');

  const maxId = Object.keys(db).reduce((max, key) => {
    const num = parseInt(key.replace('PO', ''));
    return num > max ? num : max;
  }, 0);
  const createId = 'PO' + String(maxId + 1).padStart(3, '0');

  await services.prStatus(data.purchaseRequestId, 2);

  db[createId] = {
    purchaseOrderId: createId,
    purchaseRequestId: data.purchaseRequestId,
    company: pr.company,
    department: pr.department,
    createdBy: pr.createdBy,
    phone: pr.phone,
    createdAt: new Date().toISOString(),
    sellerInfo: {
      name: data.sellerName,
      contact: data.sellerContact,
      address: data.sellerAddress,
      taxId: data.sellerTaxId || ""
    },
    paymentTerms: data.paymentTerms || "Net 30",
    deliveryTerms: data.deliveryTerms || "",
    description: data.description || `PO สำหรับ PR ${data.purchaseRequestId}`,
    requiredDate: pr.requiredDate,
    status: "Pending",
    approvalStatus: {
      approved: false,
      approvedBy: "",
      approvedAt: ""
    },
    totalPrice: pr.totalPrice,
    items: pr.item.map(item => ({
      itemId: item.itemId,
      code: item.code || "",
      description: item.description,
      unit: item.unit,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      discount: item.discount || 0,
      totalItemPrice: item.totalItemPrice,
      receivedQuantity: 0,
      notes: ""
    })),
    notes: data.notes || "",
    trackingNumber: "",
    updatedAt: new Date().toISOString()
  };

  writeData(db);
  return createId;
}

async function poGetAll() {
  const db = await getData();
  return Object.values(db).map(po => ({
    ...po,
    sellerName: po.sellerInfo?.name || po.sellerName || '',
    sellerContact: po.sellerInfo?.contact || '',
    sellerAddress: po.sellerInfo?.address || ''
  }));
}

async function poGetById(id) {
  const db = await getData();
  if (!db[id]) return null;
  
  const po = db[id];
  return {
    ...po,
    sellerName: po.sellerInfo?.name || po.sellerName || '',
    sellerContact: po.sellerInfo?.contact || '',
    sellerAddress: po.sellerInfo?.address || ''
  };
}

async function poUpdate(id, updateData) {
  const db = getData();
  
  if (!db[id]) throw new Error('Purchase Order not found');

  // Handle items update
  if (updateData.items) {
    updateData.items = updateData.items.map(item => ({
      ...db[id].items.find(i => i.itemId === item.itemId) || {},
      ...item
    }));
    
    

  }
  console.log(updateData);
  db[id].totalPrice = updateData.itemPrice
  // Handle approval
  if (updateData.approvalStatus) {
    updateData.approvalStatus = {
      ...db[id].approvalStatus,
      ...updateData.approvalStatus,
      approvedAt: updateData.approvalStatus.approved ? new Date().toISOString() : ""
    };
  }

  const updatedPO = {
    ...db[id],
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  db[id] = updatedPO;
  writeData(db);
  return db[id];
}

// Routes
router.post('/', async (req, res) => {
  try {
    const requiredFields = ['purchaseRequestId', 'sellerName', 'sellerContact'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const poId = await poCreate(req.body);
    res.status(201).json({ 
      success: true,
      purchaseOrderId: poId,
      message: 'สร้างใบสั่งซื้อสำเร็จแล้ว'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: 'เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    let data = await poGetAll();
    
    // Filtering
    if (req.query.status) data = data.filter(po => po.status === req.query.status);
    if (req.query.department) data = data.filter(po => po.department === req.query.department);
    
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบสั่งซื้อ'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await poGetById(req.params.id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบใบสั่งซื้อที่ระบุ'
      });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบสั่งซื้อ'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const allowedFields = [
      'sellerInfo', 'paymentTerms', 'deliveryTerms', 
      'description', 'status', 'items', 'notes',
      'approvalStatus', 'requiredDate', 'trackingNumber',
      'itemPrice'
    ];
    
    const updateData = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
      console.log(req.body);
      updateData.totalPrice = req.body.totalPrice
    const updatedPo = await poUpdate(req.params.id, updateData);
    res.status(200).json({
      success: true,
      data: updatedPo,
      message: 'อัปเดตใบสั่งซื้อสำเร็จแล้ว'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'เกิดข้อผิดพลาดในการอัปเดตใบสั่งซื้อ'
    });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes, trackingNumber } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'ต้องระบุสถานะใหม่'
      });
    }

    const updateData = { 
      status,
      updatedAt: new Date().toISOString()
    };
    
    if (notes) updateData.notes = notes;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    const updatedPo = await poUpdate(req.params.id, updateData);
    res.status(200).json({
      success: true,
      data: updatedPo,
      message: 'อัปเดตสถานะใบสั่งซื้อสำเร็จแล้ว'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะใบสั่งซื้อ'
    });
  }
});

module.exports = router;
