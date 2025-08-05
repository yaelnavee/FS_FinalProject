const express = require('express');
const router = express.Router();
const { authenticateToken, requireCustomer, requireEmployee } = require('../middleware/auth');
const ordersController = require('../controllers/ordersController');

router.post('/', authenticateToken, requireCustomer, ordersController.createOrder);
router.get('/', authenticateToken, requireCustomer, ordersController.getUserOrders);
//רק לעובדים
router.get('/all', authenticateToken, requireEmployee, ordersController.getAllOrders);
router.put('/:id/status', authenticateToken, requireEmployee, ordersController.updateOrderStatus);





module.exports = router;



