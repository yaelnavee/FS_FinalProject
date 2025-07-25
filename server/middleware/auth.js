const jwt = require('jsonwebtoken');
const { users } = require('../data/users');

// Middleware לאימות טוקן
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'נדרש טוקן גישה' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'טוקן לא תקף' });
    }

    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(403).json({ message: 'משתמש לא נמצא' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    };
    
    next();
  });
};

// Middleware לבדיקת הרשאות עובד
const requireEmployee = (req, res, next) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'נדרשת הרשאת עובד' });
  }
  next();
};

// Middleware לבדיקת הרשאות לקוח
const requireCustomer = (req, res, next) => {
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