const express = require('express');
const db = require('../db');
const { authenticateToken, requireEmployee } = require('../middleware/auth');

const router = express.Router();

//  קבלת כל הפיצות
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM pizzas');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ message: 'שגיאה בקבלת תפריט' });
  }
});

// הוספת פיצה (רק לעובדים)
router.post('/', authenticateToken, requireEmployee, async (req, res) => {
  const { name, price, description, category, image_url } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO pizzas (name, price, description, category, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, price, description, category, image_url]
    );

    res.status(201).json({ id: result.insertId, name, price, description, category, image_url, available: true });
  } catch (error) {
    console.error('Error adding pizza:', error);
    res.status(500).json({ message: 'שגיאה בהוספת פריט' });
  }
});

//  מחיקת פיצה
router.delete('/:id', authenticateToken, requireEmployee, async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM pizzas WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting pizza:', error);
    res.status(500).json({ message: 'שגיאה במחיקה' });
  }
});

//  שינוי זמינות
router.put('/:id/toggle', authenticateToken, requireEmployee, async (req, res) => {
  try {
    await db.execute(
      'UPDATE pizzas SET available = NOT available WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error toggling availability:', error);
    res.status(500).json({ message: 'שגיאה בעדכון זמינות' });
  }
});

module.exports = router;
