-- יצירת בסיס הנתונים
CREATE DATABASE IF NOT EXISTS PizzaShopDB;
USE PizzaShopDB;

-- טבלת משתמשים
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('customer', 'employee') DEFAULT 'customer'
);

-- טבלת תפריט
CREATE TABLE IF NOT EXISTS pizzas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(6,2) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  image_url VARCHAR(255),
  available BOOLEAN DEFAULT true
);

-- טבלת הזמנות
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total_price DECIMAL(8,2),
  status ENUM('pending', 'preparing', 'ready', 'delivered') DEFAULT 'pending',
  phone VARCHAR(20),
  address TEXT,
  notes TEXT,
  order_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- פריטים בהזמנה
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  pizza_id INT,
  quantity INT,
  unit_price DECIMAL(6,2),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (pizza_id) REFERENCES pizzas(id)
);

-- טבלת מלאי
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  quantity DECIMAL(6,2),
  unit VARCHAR(20),
  min_stock DECIMAL(6,2)
);

-- CREATE TABLE IF NOT EXISTS pizza_ingredients (
--   `id` int(11) NOT NULL,
--   `pizza_id` int(11) NOT NULL,
--   `inventory_id` int(11) NOT NULL,
--   `quantity_needed` decimal(8,2) NOT NULL DEFAULT 1.00,
--   `created_at` timestamp NOT NULL DEFAULT current_timestamp()
-- );
