const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, '../../dummy/db.json');

const getData = () => {
  const rawData = fs.readFileSync(dbPath);
  return JSON.parse(rawData);
};

const writeData = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// ดึงการแจ้งเตือนทั้งหมด
router.get("/", (req, res) => {
  try {
    const db = getData();
    res.status(200).json(db.notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว
router.put("/", (req, res) => {
  try {
    const db = getData();
    
    // อัปเดตการแจ้งเตือนทั้งหมดเป็นอ่านแล้ว
    db.notifications.forEach(notification => {
      notification.read = true;
    });
    
    writeData(db);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ทำเครื่องหมายการแจ้งเตือนเฉพาะรายการว่าอ่านแล้ว
router.put("/:id", (req, res) => {
  try {
    const db = getData();
    const notificationId = req.params.id;
    
    // หาการแจ้งเตือนโดยใช้ notificationId
    const notification = db.notifications.find(
      n => n.notificationId === notificationId
    );
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // อัปเดตสถานะเป็นอ่านแล้ว
    notification.read = true;
    writeData(db);
    
    res.status(200).json({ 
      message: "Notification marked as read",
      notification: notification
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;