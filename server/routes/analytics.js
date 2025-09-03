const express = require('express');
const db = require('../db');
const { authenticateToken, requireEmployee } = require('../middleware/auth');

const router = express.Router();

// סטטיסטיקות כלליות
router.get('/overview', authenticateToken, requireEmployee, async (req, res) => {
  try {
    // הזמנות היום
    const [todayOrders] = await db.execute(`
      SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue
      FROM orders 
      WHERE DATE(order_time) = DATE(NOW())
    `);

    // הזמנות השבוע
    const [weekOrders] = await db.execute(`
      SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue
      FROM orders 
      WHERE WEEK(order_time) = WEEK(NOW()) AND YEAR(order_time) = YEAR(NOW())
    `);

    // הזמנות החודש
    const [monthOrders] = await db.execute(`
      SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue
      FROM orders 
      WHERE MONTH(order_time) = MONTH(NOW()) AND YEAR(order_time) = YEAR(NOW())
    `);

    // הזמנות לפי סטטוס היום
    const [statusBreakdown] = await db.execute(`
      SELECT status, COUNT(*) as count
      FROM orders 
      WHERE DATE(order_time) = DATE(NOW())
      GROUP BY status
    `);

    // ממוצע ערך הזמנה
    const [avgOrder] = await db.execute(`
      SELECT AVG(total_price) as average
      FROM orders 
      WHERE DATE(order_time) = DATE(NOW())
    `);

    res.json({
      today: {
        orders: todayOrders[0].count,
        revenue: todayOrders[0].revenue
      },
      week: {
        orders: weekOrders[0].count,
        revenue: weekOrders[0].revenue
      },
      month: {
        orders: monthOrders[0].count,
        revenue: monthOrders[0].revenue
      },
      statusBreakdown,
      averageOrderValue: avgOrder[0].average || 0
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ message: 'שגיאה בקבלת סטטיסטיקות' });
  }
});

// פיצות פופולריות
router.get('/popular-items', authenticateToken, requireEmployee, async (req, res) => {
  try {
    const [popularItems] = await db.execute(`
      SELECT p.name, SUM(oi.quantity) as total_sold, 
             SUM(oi.quantity * oi.unit_price) as total_revenue
      FROM order_items oi
      JOIN pizzas p ON oi.pizza_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    res.json(popularItems);
  } catch (error) {
    console.error('Error fetching popular items:', error);
    res.status(500).json({ message: 'שגיאה בקבלת פריטים פופולריים' });
  }
});

// הכנסות יומיות (7 ימים אחרונים)
router.get('/daily-revenue', authenticateToken, requireEmployee, async (req, res) => {
  try {
    const [dailyRevenue] = await db.execute(`
      SELECT 
        DATE(order_time) as date,
        COUNT(*) as orders,
        COALESCE(SUM(total_price), 0) as revenue
      FROM orders 
      WHERE DATE(order_time) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(order_time)
      ORDER BY date DESC
    `);

    res.json(dailyRevenue);
  } catch (error) {
    console.error('Error fetching daily revenue:', error);
    res.status(500).json({ message: 'שגיאה בקבלת הכנסות יומיות' });
  }
});

// הזמנות לפי שעות היום
router.get('/hourly-orders', authenticateToken, requireEmployee, async (req, res) => {
  try {
    const [hourlyData] = await db.execute(`
      SELECT 
        HOUR(order_time) as hour,
        COUNT(*) as orders
      FROM orders 
      WHERE DATE(order_time) = DATE(NOW())
      GROUP BY HOUR(order_time)
      ORDER BY hour
    `);

    res.json(hourlyData);
  } catch (error) {
    console.error('Error fetching hourly orders:', error);
    res.status(500).json({ message: 'שגיאה בקבלת נתוני שעות' });
  }
});

// מלאי נמוך
router.get('/low-stock-alerts', authenticateToken, requireEmployee, async (req, res) => {
  try {
    const [lowStock] = await db.execute(`
      SELECT name, quantity, unit, min_stock
      FROM inventory 
      WHERE quantity <= min_stock
      ORDER BY (quantity - min_stock) ASC
    `);

    res.json(lowStock);
  } catch (error) {
    console.error('Error fetching low stock:', error);
    res.status(500).json({ message: 'שגיאה בקבלת התראות מלאי' });
  }
});

// הזמנות שממתינות זמן רב
router.get('/pending-alerts', authenticateToken, requireEmployee, async (req, res) => {
  try {
    const [pendingOrders] = await db.execute(`
      SELECT id, total_price, order_time,
             TIMESTAMPDIFF(MINUTE, order_time, NOW()) as minutes_waiting
      FROM orders 
      WHERE status IN ('pending', 'preparing') 
      AND TIMESTAMPDIFF(MINUTE, order_time, NOW()) > 30
      ORDER BY minutes_waiting DESC
    `);

    res.json(pendingOrders);
  } catch (error) {
    console.error('Error fetching pending alerts:', error);
    res.status(500).json({ message: 'שגיאה בקבלת התראות ממתינות' });
  }
});

module.exports = router;