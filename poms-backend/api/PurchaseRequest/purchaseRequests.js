const express = require('express');
const router = express.Router();
const fs = require('../../db/mysqlStore');
const path = require('path');

const dbPath = path.join(__dirname, '../../dummy/pr.json');

const getData = () => {
  const rawData = fs.readFileSync(dbPath);
  return JSON.parse(rawData);
};

const writeData = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function prCreate(data) {
  const db = getData();

  const totalPrice = data.items.reduce((total, item) => {
    return total + (item.unitPrice * item.quantity);
  }, 0);

  const maxId = Object.keys(db).reduce((max, key) => {
    const num = parseInt(key.replace('PR', ''));
    return num > max ? num : max;
  }, 0);

  const createId = 'PR' + String(maxId + 1).padStart(3, '0');

  db[createId] = {
    "company": data.company,
    "department": data.department,
    "position": data.position,
    "createdBy": data.requesterName,
    "phone": data.phone,
    "createdAt": new Date().toISOString(),
    "requestDate": data.requestDate,
    "requiredDate": data.requiredDate,
    "description": `คำขอซื้อจากแผนก ${data.department}`,
    "status": "Pending",
    "totalPrice": totalPrice,
    "requester": data.requester,
    "approver": "",
    "purchasingOfficer": data.purchasingOfficer,
    "approveDate": "",
    "isApproved": false,
    "item": data.items.map((item, index) => ({
      "itemId": createId + "-" + String(index + 1).padStart(3, '0'),
      "description": item.description,
      "unit": item.unit,
      "unitPrice": item.unitPrice,
      "quantity": item.quantity,
      "remarks": item.remarks || "",
      "totalItemPrice": item.unitPrice * item.quantity
    }))
  };

  writeData(db);
  return createId;
}

async function prGetAll() {
  const db = await getData();
  const data = Object.entries(db).map(([key, value]) => ({
    "purchaseRequestId": key,
    "company": value.company,
    "department": value.department,
    "createdBy": value.createdBy,
    "phone": value.phone,
    "createdAt": value.createdAt,
    "description": value.description,
    "status": value.status,
    "totalPrice": value.totalPrice,
    "requestDate": value.requestDate,
    "requiredDate": value.requiredDate,
    "itemCount": value.item.length
  }));
  return data;
}

async function prGetById(id) {
  const db = await getData();
  if (!db[id]) return null;

  return {
    "purchaseRequestId": id,
    ...db[id]
  };
}

async function prGetItemById(id) {
  const db = await getData();
  if (!db[id]) return null;
  return [...db[id].item];
}

async function prUpdate(id, data) {
  const db = getData();
  if (!db[id]) return null;

  const allowedFields = [
    'department', 'position', 'phone', 'description',
    'requiredDate', 'purchasingOfficer', 'items'
  ];

  const updateData = {};
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  Object.assign(db[id], updateData);

  if (data.items) {
    db[id].item = data.items.map((item, index) => ({
      "itemId": id + "-" + String(index + 1).padStart(3, '0'),
      "description": item.description,
      "unit": item.unit,
      "unitPrice": item.unitPrice,
      "quantity": item.quantity,
      "remarks": item.remarks || "",
      "totalItemPrice": item.unitPrice * item.quantity
    }));

    db[id].totalPrice = db[id].item.reduce((total, item) => {
      return total + item.totalItemPrice;
    }, 0);
  }

  writeData(db);
  return id;
}

async function prStatus(id, status) {
  const db = getData();
  if (!db[id]) return null;

  db[id].status = 
    status === 1 ? "Approved" : 
    status === 0 ? "Rejected" : 
    status === 2 ? "รอสั่งซื้อ" : 
    db[id].status;

  db[id].approveDate = new Date().toISOString();
  db[id].isApproved = status === 1;

  writeData(db);
  return id;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/', async (req, res) => {
  try {
    const {
      company,
      department,
      position,
      requesterName,
      phone,
      requiredDate,
      requestDate,
      purchasingOfficer,
      items
    } = req.body;

    if (!department || !position || !requesterName || !phone || !requiredDate || !items) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['department', 'position', 'requesterName', 'phone', 'requiredDate', 'items']
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Items must be a non-empty array'
      });
    }

    const prData = {
      company,
      department,
      position,
      requesterName,
      phone,
      requiredDate,
      requestDate: requestDate || new Date().toISOString().split('T')[0],
      purchasingOfficer,
      items
    };

    const prId = await prCreate(prData);
    res.status(201).json({
      success: true,
      purchaseRequestId: prId,
      message: 'สร้างใบขอซื้อสำเร็จแล้ว'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, department } = req.query;
    let prData = await prGetAll();

    if (status) {
      prData = prData.filter(pr => pr.status === status);
    }

    if (department) {
      prData = prData.filter(pr => pr.department === department);
    }

    res.status(200).json(prData);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำขอซื้อ'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ต้องระบุ ID ของคำขอซื้อ'
      });
    }

    const data = await prGetById(id);
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอซื้อที่ระบุ'
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำขอซื้อ'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (!id || !data) {
      return res.status(400).json({
        success: false,
        message: 'ต้องระบุ ID และข้อมูลสำหรับการอัปเดต'
      });
    }

    if (data.items && (!Array.isArray(data.items) || data.items.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'รายการสินค้าต้องเป็นอาร์เรย์และไม่ว่างเปล่า'
      });
    }

    const updatedPr = await prUpdate(id, data);
    if (updatedPr) {
      res.status(200).json(await prGetById(id));
    } else {
      res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอซื้อที่ระบุ'
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'เกิดข้อผิดพลาดในการอัปเดตคำขอซื้อ'
    });
  }
});

router.put('/status/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!id || status === undefined) {
      return res.status(400).json({
        success: false,
        message: 'ต้องระบุ ID และสถานะ'
      });
    }

    if (![0, 1].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'สถานะต้องเป็น 0 (Pending) หรือ 1 (Approved)'
      });
    }

    const updatedPr = await prStatus(id, status);
    if (updatedPr) {
      res.status(200).json(await prGetById(id));
    } else {
      res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอซื้อที่ระบุ'
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะคำขอซื้อ'
    });
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
  router,
  services: {
    prGetById,
    prGetItemById,
    prStatus,
    prUpdate
  }
};
