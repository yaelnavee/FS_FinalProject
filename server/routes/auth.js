const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../data/users');

const router = express.Router();

// רישום משתמש חדש
router.post('/register', async (req, res) => {
  try {
    console.log('Register request:', req.body);
    const { username, email, password, name, role = 'customer' } = req.body;

    // בדיקה אם המשתמש כבר קיים
    const existingUser = users.find(user => 
      user.username === username || user.email === email
    );

    if (existingUser) {
      return res.status(400).json({ message: 'משתמש עם שם משתמש או אימייל זה כבר קיים' });
    }

    // הצפנת סיסמה
    const hashedPassword = await bcrypt.hash(password, 10);

    // יצירת משתמש חדש
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      role,
      name
    };

    users.push(newUser);

    // יצירת טוקן
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        username: newUser.username,
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'משתמש נרשם בהצלחה',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'שגיאה ברישום המשתמש' });
  }
});

// התחברות
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { username, password } = req.body;

    // בדיקה שיש username ו-password
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ message: 'נדרש שם משתמש וסיסמה' });
    }

    // חיפוש המשתמש
    console.log('Looking for user:', username);
    const user = users.find(u => u.username === username);
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'שם משתמש או סיסמה שגויים' });
    }

    // בדיקת סיסמה
    console.log('Checking password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(400).json({ message: 'שם משתמש או סיסמה שגויים' });
    }

    // יצירת טוקן
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', username);
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

// אימות טוקן
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'לא נמצא טוקן' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'משתמש לא נמצא' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'טוקן לא תקף' });
  }
});

module.exports = router;