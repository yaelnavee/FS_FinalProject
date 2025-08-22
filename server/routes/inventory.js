const express = require('express');
const db = require('../db');
const { authenticateToken, requireEmployee } = require('../middleware/auth');

const router = express.Router();

// קבלת כל פריטי המלאי
router.get('/', authenticateToken, requireEmployee, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM inventory ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'שגיאה בקבלת מלאי' });
  }
});

// הוספת פריט מלאי חדש
router.post('/', authenticateToken, requireEmployee, async (req, res) => {
  const { name, quantity, unit, min_stock } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO inventory (name, quantity, unit, min_stock) VALUES (?, ?, ?, ?)',
      [name, quantity, unit, min_stock]
    );

    res.status(201).json({ 
      id: result.insertId, 
      name, 
      quantity, 
      unit, 
      min_stock 
    });
  } catch (error) {
    console.error('Error adding inventory item:', error);
    res.status(500).json({ message: 'שגיאה בהוספת פריט למלאי' });
  }
});

// עדכון כמות מלאי
router.put('/:id', authenticateToken, requireEmployee, async (req, res) => {
  const { id } = req.params;
  const { quantity, min_stock } = req.body;

  try {
    await db.execute(
      'UPDATE inventory SET quantity = ?, min_stock = ? WHERE id = ?',
      [quantity, min_stock, id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'שגיאה בעדכון מלאי' });
  }
});

// מחיקת פריט מלאי
router.delete('/:id', authenticateToken, requireEmployee, async (req, res) => {
  try {
    await db.execute('DELETE FROM inventory WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ message: 'שגיאה במחיקת פריט' });
  }
});

// קבלת פריטים עם מלאי נמוך
router.get('/low-stock', authenticateToken, requireEmployee, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM inventory WHERE quantity <= min_stock ORDER BY name'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ message: 'שגיאה בקבלת פריטי מלאי נמוך' });
  }
});

module.exports = router;