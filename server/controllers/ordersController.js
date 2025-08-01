const db = require('../db');

exports.createOrder = async (req, res) => {
  console.log("📦 createOrder controller triggered!");
    
  const { items } = req.body; // [{ pizza_id, quantity }]
  const userId = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'אין פריטים להזמנה' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // צור הזמנה חדשה
    const [orderResult] = await conn.execute(
      'INSERT INTO orders (user_id) VALUES (?)',
      [userId]
    );

    const orderId = orderResult.insertId;

    // הכנס פריטים להזמנה
    for (const item of items) {
      const [pizzaRows] = await conn.execute(
        'SELECT price FROM pizzas WHERE id = ?',
        [item.pizza_id]
      );

      if (pizzaRows.length === 0) throw new Error('פיצה לא קיימת');

      const price = pizzaRows[0].price;

      await conn.execute(
        'INSERT INTO order_items (order_id, pizza_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.pizza_id, item.quantity, price]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'הזמנה בוצעה', orderId });
  } catch (err) {
    await conn.rollback();
    console.error('Order creation error:', err);
    res.status(500).json({ message: 'שגיאה ביצירת הזמנה' });
  } finally {
    conn.release();
  }
};

exports.getUserOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const [items] = await db.execute(
      `SELECT order_items.*, pizzas.name 
       FROM order_items 
       JOIN pizzas ON order_items.pizza_id = pizzas.id
       WHERE order_id IN (${orders.map(o => o.id).join(',') || 0})`
    );

    // קיבוץ לפי הזמנה
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: items.filter(i => i.order_id === order.id)
    }));

    res.json(ordersWithItems);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'שגיאה בשליפת ההזמנות' });
  }
};
