const express = require('express');
const router = express.Router();
const fs = require('../../db/mysqlStore');
const path = require('path');
const { services } = require('../PurchaseRequest/purchaseRequests');

const dbPath = path.join(__dirname, '../dummy/asset.json');

const getData = () => {
  const rawData = fs.readFileSync(dbPath);
  return JSON.parse(rawData);
};

const writeData = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const generateId = (prefix, existingItems) => {
  const ids = existingItems ? Object.keys(existingItems) : [];
  const maxId = ids.reduce((max, id) => {
    const num = parseInt(id.replace(prefix, ''));
    return num > max ? num : max;
  }, 0);
  return prefix + String(maxId + 1).padStart(3, '0');
};

router.post('/', async (req, res) => {
  try {
    const { purchaseOrderId, receivedDate, referenceNumber, notes } = req.body;
    
    if (!purchaseOrderId || !receivedDate || !referenceNumber) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: purchaseOrderId, receivedDate, referenceNumber' 
      });
    }

    const poData = require('../../dummy/po.json')[purchaseOrderId];
    if (!poData) {
      return res.status(404).json({ 
        success: false,
        message: 'Purchase Order not found' 
      });
    }

    const prItems = await services.prGetItemById(poData.purchaseRequestId);
    if (!prItems) {
      return res.status(404).json({ 
        success: false,
        message: 'PR items not found' 
      });
    }

    const db = getData();
    const receiptId = generateId('R', db);

    const receiptItems = prItems.map(item => ({
      itemId: item.itemId,
      receiptItemId: generateId('RI', []),
      description: item.description,
      unit: item.unit,
      orderedQuantity: item.quantity,
      receivedQuantity: item.quantity,
      unitPrice: item.unitPrice,
      totalItemPrice: item.totalItemPrice,
      quality: 10,
      receivedDate,
      details: [{
        detailId: generateId('D', []),
        receivedQuantity: item.quantity,
        receivedDate,
        quality: 10,
        notes: notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: null
      }]
    }));

    const totalReceived = receiptItems.reduce((sum, item) => sum + item.receivedQuantity, 0);

    const newReceipt = {
      receiptId,
      purchaseOrderId,
      purchaseRequestId: poData.purchaseRequestId,
      receivedDate,
      referenceNumber,
      company: poData.company,
      department: poData.department,
      createdBy: poData.createdBy,
      phone: poData.phone,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      status: "Completed",
      totalReceived,
      items: receiptItems
    };

    db[receiptId] = newReceipt;
    writeData(db);

    res.status(201).json({
      success: true,
      receiptId,
      totalReceived,
      itemCount: receiptItems.length,
      message: 'Asset receipt created successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: 'Error creating asset receipt' 
    });
  }
});

router.get('/', (req, res) => {
  try {
    const db = getData();
    const receipts = Object.entries(db).map(([id, receipt]) => ({
      receiptId: id,
      purchaseOrderId: receipt.purchaseOrderId,
      purchaseRequestId: receipt.purchaseRequestId,
      company: receipt.company,
      department: receipt.department,
      receivedDate: receipt.receivedDate,
      status: receipt.status,
      totalReceived: receipt.totalReceived,
      itemCount: receipt.items.length,
      createdAt: receipt.createdAt
    }));
    
    res.status(200).json({
      success: true,
      data: receipts,
      count: receipts.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: 'Error retrieving asset receipts' 
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getData();
    const receipt = db[req.params.id];
    
    if (!receipt) {
      return res.status(404).json({ 
        success: false,
        message: 'Asset receipt not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: receipt
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: 'Error retrieving asset receipt' 
    });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { items, status, notes } = req.body;
    
    const db = getData();
    const receipt = db[id];
    
    if (!receipt) {
      return res.status(404).json({ 
        success: false,
        message: 'Asset receipt not found' 
      });
    }

    if (status && ['Completed', 'Partial', 'Cancelled'].includes(status)) {
      receipt.status = status;
    }

    if (items && Array.isArray(items)) {
      items.forEach(updatedItem => {
        const existingItem = receipt.items.find(item => 
          item.receiptItemId === updatedItem.receiptItemId
        );
        
        if (existingItem) {
          Object.assign(existingItem, updatedItem);
          
          existingItem.details.push({
            detailId: generateId('D', []),
            receivedQuantity: updatedItem.receivedQuantity || existingItem.receivedQuantity,
            receivedDate: updatedItem.receivedDate || new Date().toISOString(),
            quality: updatedItem.quality || existingItem.quality,
            notes: notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: null
          });
        }
      });

      receipt.totalReceived = receipt.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
    }

    receipt.updatedAt = new Date().toISOString();
    writeData(db);
    
    res.status(200).json({ 
      success: true,
      receiptId: id,
      message: 'Asset receipt updated successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: 'Error updating asset receipt' 
    });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const db = getData();
    
    if (!db[req.params.id]) {
      return res.status(404).json({ 
        success: false,
        message: 'Asset receipt not found' 
      });
    }

    delete db[req.params.id];
    writeData(db);
    
    res.status(200).json({ 
      success: true,
      message: 'Asset receipt deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: 'Error deleting asset receipt' 
    });
  }
});

module.exports = router;
