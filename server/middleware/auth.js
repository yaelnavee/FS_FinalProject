const jwt = require('jsonwebtoken');
const db = require('../db'); // db שימוש במסד הנתונים

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'נדרש טוקן גישה' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // ✨ שליפת המשתמש מה־DB לפי ה־id מהטוקן
    const [rows] = await db.execute(
      'SELECT id, username, role, name FROM users WHERE id = ?',
      [decoded.userId]
    );

    console.log('User from DB:', rows[0]);///////////////////////////////////////////////////////בדיקה

    if (rows.length === 0) {
      return res.status(403).json({ message: 'משתמש לא נמצא' });
    }

    req.user = rows[0]; // 👈 שמירה ב־req.user

    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(403).json({ message: 'טוקן לא תקף' });
  }
};

const requireEmployee = (req, res, next) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'נדרשת הרשאת עובד' });
  }
  next();
};

const requireCustomer = (req, res, next) => {
  console.log('הרול של המשתמש ב־req.user:', req.user);
  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'נדרשת הרשאת לקוח' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireEmployee,
  requireCustomer
};
