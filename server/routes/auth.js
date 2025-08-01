const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // חיבור למסד הנתונים

const router = express.Router();

// 📌 רישום משתמש חדש
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name, role = 'customer' } = req.body;

    // בדיקה אם המשתמש כבר קיים
    const [existing] = await db.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'משתמש כבר קיים' });
    }

    // הצפנת סיסמה
    const hashedPassword = await bcrypt.hash(password, 10);

    // הכנסת המשתמש למסד
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, name, role]
    );

    const userId = result.insertId;

    // יצירת טוקן
    const token = jwt.sign(
      { userId, username, role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'נרשמת בהצלחה',
      token,
      user: { id: userId, username, email, role, name }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'שגיאה ברישום' });
  }
});

// 📌 התחברות
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // שליפת המשתמש מהמסד
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'שם משתמש או סיסמה שגויים' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'שם משתמש או סיסמה שגויים' });
    }

    // יצירת טוקן
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'התחברות בהצלחה',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'שגיאה בהתחברות' });
  }
});

// 📌 אימות טוקן
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'לא נמצא טוקן' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    const [rows] = await db.execute(
      'SELECT id, username, email, name, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'משתמש לא נמצא' });

    res.json({ user: rows[0] });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(401).json({ message: 'טוקן לא תקף' });
  }
});

module.exports = router;
