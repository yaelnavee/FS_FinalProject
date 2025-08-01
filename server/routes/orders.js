const express = require('express');
const router = express.Router();
const { authenticateToken, requireCustomer } = require('../middleware/auth');
const ordersController = require('../controllers/ordersController');

router.post('/', authenticateToken, requireCustomer, ordersController.createOrder);
router.get('/', authenticateToken, requireCustomer, ordersController.getUserOrders);



module.exports = router;

// const express = require('express');
// const router = express.Router();

// console.log("orders.js router loaded!");

// // ריספונס פשוט לקבלת POST
// router.post('/', (req, res) => {
//   console.log("📦 Got POST to /api/orders! Body:", req.body);
//   res.status(201).json({ message: "Order received!", receivedBody: req.body });
// });

// module.exports = router;


