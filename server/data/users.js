const bcrypt = require('bcryptjs');

// יצירת סיסמאות מוצפנות
const createHashedPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

// משתמשים לדוגמה - עם סיסמאות מוצפנות נכונות
const users = [
  {
    id: 1,
    username: 'manager',
    email: 'manager@pizza.com',
    password: createHashedPassword('password123'), // password123
    role: 'employee',
    name: 'מנהל הפיצריה'
  },
  {
    id: 2,
    username: 'worker1',
    email: 'worker1@pizza.com',
    password: createHashedPassword('password123'), // password123
    role: 'employee',
    name: 'עובד 1'
  },
  {
    id: 3,
    username: 'customer1',
    email: 'customer@gmail.com',
    password: createHashedPassword('password123'), // password123
    role: 'customer',
    name: 'לקוח רגיל'
  }
];

module.exports = { users };