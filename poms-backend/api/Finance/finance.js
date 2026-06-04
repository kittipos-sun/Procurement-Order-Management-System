const express = require('express');
const router = express.Router();
const financeData = require('../../dummy/finance.json');

// Get financial dashboard data
router.get('/', (req, res) => {
  try {
    res.json({
      financialData: financeData.financialData,
      debts: financeData.debts,
      monthlyItems: financeData.monthlyItems
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch financial data' });
  }
});

module.exports = router;