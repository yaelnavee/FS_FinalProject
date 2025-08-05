const db = require('../db');

exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items, total, customerDetails } = req.body;

  const { phone, address, notes } = customerDetails;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'אין פריטים בהזמנה' });
  }

  try {
    // יצירת הזמנה בטבלת orders
    const [orderResult] = await db.execute(
      'INSERT INTO orders (user_id, total_price, phone, address, notes) VALUES (?, ?, ?, ?, ?)',
      [userId, total, phone, address, notes]
    );

    const orderId = orderResult.insertId;

    // הוספת פריטים בטבלת order_items
    for (const item of items) {
      const [pizzaRows] = await db.execute('SELECT price FROM pizzas WHERE id = ?', [item.pizza_id]);
      if (pizzaRows.length === 0) throw new Error('פיצה לא קיימת');

      const unitPrice = pizzaRows[0].price;

      await db.execute(
        'INSERT INTO order_items (order_id, pizza_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [orderId, item.pizza_id, item.quantity, unitPrice]
      );
    }

    res.status(201).json({ 
      message: 'ההזמנה בוצעה בהצלחה',
      orderId,
      total,
      orderDetails: { phone, address, notes }
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: 'שגיאה ביצירת ההזמנה' });
  }
};


// exports.getUserOrders = async (req, res) => {
//   const userId = req.user.id;

//   try {
//     const [orders] = await db.execute(
//       'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
//       [userId]
//     );

//     const [items] = await db.execute(
//       `SELECT order_items.*, pizzas.name 
//        FROM order_items 
//        JOIN pizzas ON order_items.pizza_id = pizzas.id
//        WHERE order_id IN (${orders.map(o => o.id).join(',') || 0})`
//     );

//     // קיבוץ לפי הזמנה
//     const ordersWithItems = orders.map(order => ({
//       ...order,
//       items: items.filter(i => i.order_id === order.id)
//     }));

//     res.json(ordersWithItems);
//   } catch (err) {
//     console.error('Get orders error:', err);
//     res.status(500).json({ message: 'שגיאה בשליפת ההזמנות' });
//   }

// };

// exports.getAllOrders = async (req, res) => {
//   try {
//     const [orders] = await db.execute(`
//       SELECT o.id, o.status, o.total_price AS total, o.order_time, o.phone, o.address, o.notes, 
//              u.name AS customerName
//       FROM orders o
//       JOIN users u ON o.user_id = u.id
//       ORDER BY o.order_time DESC
//     `);

//     const ordersWithItems = await Promise.all(
//       orders.map(async (order) => {
//         const [items] = await db.execute(`
//           SELECT oi.quantity, oi.unit_price AS price, p.name
//           FROM order_items oi
//           JOIN pizzas p ON oi.pizza_id = p.id
//           WHERE oi.order_id = ?
//         `, [order.id]);

//         return { ...order, items };
//       })
//     );

//     res.json(ordersWithItems); 
//   } catch (err) {
//     console.error('Error fetching all orders:', err);
//     res.status(500).json({ message: 'שגיאה בקבלת ההזמנות' });
//   }
// };

exports.getUserOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const [orders] = await db.execute(
      `SELECT id, status, total_price AS total, order_time, phone, address, notes
       FROM orders
       WHERE user_id = ?
       ORDER BY order_time DESC`,
      [userId]
    );

    if (orders.length === 0) {
      return res.json([]);
    }

    const orderIds = orders.map(o => o.id);
    const placeholders = orderIds.map(() => '?').join(',');

    const [items] = await db.execute(
      `
      SELECT order_id, quantity, unit_price AS price, pizzas.name
      FROM order_items 
      JOIN pizzas ON order_items.pizza_id = pizzas.id
      WHERE order_id IN (${placeholders})
      `,
      orderIds
    );

    const ordersWithItems = orders.map(order => ({
      id: order.id,
      orderTime: order.order_time,
      total: order.total,
      status: order.status,
      phone: order.phone,
      address: order.address,
      notes: order.notes,
      items: items.filter(i => i.order_id === order.id)
    }));

    res.json(ordersWithItems);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'שגיאה בשליפת ההזמנות' });
  }
};



exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['pending', 'preparing', 'ready', 'delivered'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'סטטוס לא תקין' });
  }

  try {
    await db.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'שגיאה בעדכון סטטוס' });
  }
};

