const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { router: authRouter } = require('./api/Auth/auth.js');
const userRouter = require('./api/Auth/userRouter.js');
const { router : purchaseRequestsRoute } = require('./api/PurchaseRequest/purchaseRequests.js');
const purchaseOrdersRoute = require('./api/PurchaseOrder/purchaseOrders.js');
const assetReceiptsRoute = require('./api/AssetReceipt/assetReceipts.js');
const notificationsRoute = require('./api/Notification/notifications.js');
const financeRouter = require('./api/Finance/finance');
const { initializeStore } = require('./db/mysqlStore');

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // อนุญาตทั้ง localhost และ 127.0.0.1
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors()); 
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('POMS API');
})
app.use('/api/notifications', notificationsRoute);
app.use('/api/purchase-requests', purchaseRequestsRoute);
app.use('/api/purchase-orders', purchaseOrdersRoute);
app.use('/api/asset-receipts', assetReceiptsRoute);
app.use('/api/finance', financeRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
//
const port = Number(process.env.API_PORT || 3000);
initializeStore()
  .then(() => app.listen(port, () => console.log(`Server running on http://localhost:${port}`)))
  .catch((error) => { console.error('Database initialization failed:', error); process.exit(1); });
