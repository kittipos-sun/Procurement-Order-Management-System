const express = require('express');
const router = express.Router();
const fs = require('../../db/mysqlStore');
const path = require('path');

const getFinanceData = () => JSON.parse(fs.readFileSync(
  path.join(__dirname, '../../dummy/finance.json'),
  'utf8'
));

// Get financial dashboard data
router.get('/', (req, res) => {
  try {
    const financeData = getFinanceData();
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
