const db = require('../db');

exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items, total, customerDetails } = req.body;

  const { phone, address, notes } = customerDetails;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'אין פריטים בהזמנה' });
  }

  try {
    // בדיקת זמינות מלאי לפני יצירת ההזמנה
    for (const item of items) {
      const [availability] = await db.execute(`
        SELECT p.name, p.available,
               CASE 
                 WHEN p.available = 0 THEN 0
                 WHEN COUNT(pi.inventory_id) = 0 THEN 1
                 WHEN MIN(CASE WHEN i.quantity >= (pi.quantity_needed * ?) THEN 1 ELSE 0 END) = 1 THEN 1
                 ELSE 0 
               END as stock_available
        FROM pizzas p
        LEFT JOIN pizza_ingredients pi ON p.id = pi.pizza_id
        LEFT JOIN inventory i ON pi.inventory_id = i.id
        WHERE p.id = ?
        GROUP BY p.id
      `, [item.quantity, item.pizza_id]);

      if (availability.length === 0 || !availability[0].available || !availability[0].stock_available) {
        return res.status(400).json({ 
          message: `המנה "${availability[0]?.name || 'לא זמינה'}" אינה זמינה כרגע או שאין מספיק מלאי` 
        });
      }
    }

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

exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.execute(`
      SELECT o.id, o.status, o.total_price AS total, o.order_time, o.phone, o.address, o.notes, 
             u.name AS customerName
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.order_time DESC
    `);

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await db.execute(`
          SELECT oi.quantity, oi.unit_price AS price, p.name
          FROM order_items oi
          JOIN pizzas p ON oi.pizza_id = p.id
          WHERE oi.order_id = ?
        `, [order.id]);

        return { ...order, items };
      })
    );

    res.json(ordersWithItems); 
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ message: 'שגיאה בקבלת ההזמנות' });
  }
};

// פונקציה לעדכון מלאי כשהזמנה מסתיימת
const updateInventoryForOrder = async (orderId) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // קבלת כל הפריטים בהזמנה
    const [orderItems] = await connection.execute(`
      SELECT oi.pizza_id, oi.quantity as order_quantity
      FROM order_items oi
      WHERE oi.order_id = ?
    `, [orderId]);

    // עבור כל פריט בהזמנה, עדכון המלאי
    for (const orderItem of orderItems) {
      // קבלת הרכיבים הנדרשים לפיצה זו
      const [ingredients] = await connection.execute(`
        SELECT pi.inventory_id, pi.quantity_needed, i.name as ingredient_name
        FROM pizza_ingredients pi
        JOIN inventory i ON pi.inventory_id = i.id
        WHERE pi.pizza_id = ?
      `, [orderItem.pizza_id]);

      // עדכון כל רכיב במלאי
      for (const ingredient of ingredients) {
        const totalNeeded = ingredient.quantity_needed * orderItem.order_quantity;
        
        const [updateResult] = await connection.execute(`
          UPDATE inventory 
          SET quantity = GREATEST(0, quantity - ?)
          WHERE id = ?
        `, [totalNeeded, ingredient.inventory_id]);

        console.log(`עודכן מלאי: ${ingredient.ingredient_name} - הופחתו ${totalNeeded} יחידות`);
      }
    }

    await connection.commit();
    console.log(`מלאי עודכן בהצלחה עבור הזמנה ${orderId}`);
    
  } catch (error) {
    await connection.rollback();
    console.error('שגיאה בעדכון מלאי:', error);
    throw error;
  } finally {
    connection.release();
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
    // בדיקת הסטטוס הנוכחי של ההזמנה
    const [currentOrder] = await db.execute(
      'SELECT status FROM orders WHERE id = ?',
      [id]
    );

    if (currentOrder.length === 0) {
      return res.status(404).json({ message: 'הזמנה לא נמצאה' });
    }

    const previousStatus = currentOrder[0].status;

    // עדכון הסטטוס
    await db.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    // אם הסטטוס השתנה ל-"delivered" ולא היה כבר "delivered", עדכון המלאי
    if (status === 'delivered' && previousStatus !== 'delivered') {
      try {
        await updateInventoryForOrder(id);
        console.log(`מלאי עודכן אוטומטית עבור הזמנה ${id}`);
      } catch (inventoryError) {
        console.error('שגיאה בעדכון מלאי אוטומטי:', inventoryError);
        // לא נכשיל את העדכון של הסטטוס גם אם יש בעיה במלאי
      }
    }

    res.json({ success: true, message: 'סטטוס עודכן בהצלחה' });
    
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'שגיאה בעדכון סטטוס' });
  }
};