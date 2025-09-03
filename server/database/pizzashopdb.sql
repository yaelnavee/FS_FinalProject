-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: ספטמבר 03, 2025 בזמן 10:23 AM
-- גרסת שרת: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pizzashopdb`
--

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `inventory`
--

CREATE TABLE `inventory` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `min_stock` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `inventory`
--

INSERT INTO `inventory` (`id`, `name`, `quantity`, `unit`, `min_stock`) VALUES
(9, 'בצק פיצה', 48, 'יחידות', 10),
(10, 'רוטב עגבניות', 13, 'ק\"ג', 3),
(11, 'גבינת מוצרלה', 21, 'ק\"ג', 5),
(13, 'פלפלים', 12, 'ק\"ג', 3),
(14, 'בצל', 4, 'ק\"ג', 2),
(15, 'זיתים', 5, 'ק\"ג', 1),
(16, 'פטריות', 5, 'ק\"ג', 2),
(17, 'שמן זית', 3, 'ליטר', 1),
(19, 'מלפפונים', 8, 'ק\"ג', 3);

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_price` decimal(8,2) DEFAULT NULL,
  `status` enum('pending','preparing','ready','delivered') DEFAULT 'pending',
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `order_time` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_price`, `status`, `phone`, `address`, `notes`, `order_time`) VALUES
(1, 3, 50.00, 'delivered', '050-5297888', 'כעעד', 'כענדע', '2025-08-22 11:43:18'),
(2, 4, 50.00, 'delivered', '0505297888', 'xx', '', '2025-08-22 12:10:49'),
(3, 4, 25.00, 'delivered', '0505297888', 'דג', 'שדגב', '2025-08-22 13:31:38'),
(4, 4, 50.00, 'delivered', '0505297888', 'בגב', '', '2025-08-22 16:21:25'),
(5, 4, 105.00, 'delivered', '0505297888', '\'ןגחי', 'קגחי', '2025-09-02 20:40:48'),
(6, 4, 100.00, 'delivered', '0505297888', 'כגג', 'גגג', '2025-09-02 20:42:27'),
(7, 4, 200.00, 'delivered', '0505297888', 'vv', 'ff', '2025-09-02 22:48:17'),
(8, 4, 55.00, 'delivered', '0505297888', 'ככ', '', '2025-09-03 10:53:58'),
(9, 4, 109.00, 'delivered', '050678923', 'ddc', '', '2025-09-03 11:14:36');

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `pizza_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unit_price` decimal(6,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `pizza_id`, `quantity`, `unit_price`) VALUES
(11, 8, 6, 1, 25.00),
(13, 9, 7, 2, 42.00),
(14, 9, 6, 1, 25.00);

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `pizzas`
--

CREATE TABLE `pizzas` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(6,2) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `available` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `pizzas`
--

INSERT INTO `pizzas` (`id`, `name`, `price`, `description`, `category`, `image_url`, `available`) VALUES
(6, 'סלט ישראלי', 25.00, '', 'תוספות', '/uploads/images/pizza-1756885911276-734184620.jpeg', 1),
(7, 'פיצה מרגריטה', 42.00, '', 'פיצות', '/uploads/images/pizza-1756886376068-313098009.jpeg', 1);

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `pizza_ingredients`
--

CREATE TABLE `pizza_ingredients` (
  `id` int(11) NOT NULL,
  `pizza_id` int(11) NOT NULL,
  `inventory_id` int(11) NOT NULL,
  `quantity_needed` decimal(8,2) NOT NULL DEFAULT 1.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `pizza_ingredients`
--

INSERT INTO `pizza_ingredients` (`id`, `pizza_id`, `inventory_id`, `quantity_needed`, `created_at`) VALUES
(11, 6, 14, 1.00, '2025-09-03 07:51:51'),
(12, 6, 17, 1.00, '2025-09-03 07:51:51'),
(13, 6, 19, 1.00, '2025-09-03 07:51:51'),
(14, 7, 9, 1.00, '2025-09-03 07:59:36'),
(15, 7, 10, 1.00, '2025-09-03 07:59:36'),
(16, 7, 11, 1.00, '2025-09-03 07:59:36');

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('customer','employee') DEFAULT 'customer'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `name`, `role`) VALUES
(1, 'ynave', 'yaelnave4@gmail.com', '$2b$10$8g7eqKa4uqbXfPM25rqyyewWtplWkKjRkjPIPKPXHhecSm.fjqNqa', 'יעל נווה', 'employee'),
(2, 'yaeln', 'yaeln@gmail.com', '$2b$10$CFjHVrq99q5N5Uqu/xgHPe8V4ins3kQdQnizIOW0xJe.6wNrpFltq', 'יעל נווה', 'employee'),
(3, 'me', 'yael@gmail.com', '$2b$10$payPrRFaaQ2uJIcnchBs/OMfLtuxTYGTxm82XT8MkaL8gE0piiJly', 'אני', 'customer'),
(4, 'client', 'client@gmail.com', '$2b$10$a7cXLh2s5r4NQYvo6FisFOcgPmaDwlgf/QR56M7rZjyAdxhL3Opnm', 'יעל נווה', 'customer'),
(5, 'worker', 'worker@gmail.com', '$2b$10$WdwiF1OVOruwIL.BSkvysehq8tUjgq45BAJbc3/nXDUZ9scKh7xfi', 'worker', 'employee');

--
-- Indexes for dumped tables
--

--
-- אינדקסים לטבלה `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`);

--
-- אינדקסים לטבלה `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- אינדקסים לטבלה `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `pizza_id` (`pizza_id`);

--
-- אינדקסים לטבלה `pizzas`
--
ALTER TABLE `pizzas`
  ADD PRIMARY KEY (`id`);

--
-- אינדקסים לטבלה `pizza_ingredients`
--
ALTER TABLE `pizza_ingredients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_pizza_ingredient` (`pizza_id`,`inventory_id`),
  ADD KEY `idx_pizza_ingredients_pizza_id` (`pizza_id`),
  ADD KEY `idx_pizza_ingredients_inventory_id` (`inventory_id`);

--
-- אינדקסים לטבלה `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `pizzas`
--
ALTER TABLE `pizzas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `pizza_ingredients`
--
ALTER TABLE `pizza_ingredients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- הגבלות לטבלאות שהוצאו
--

--
-- הגבלות לטבלה `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- הגבלות לטבלה `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`pizza_id`) REFERENCES `pizzas` (`id`);

--
-- הגבלות לטבלה `pizza_ingredients`
--
ALTER TABLE `pizza_ingredients`
  ADD CONSTRAINT `pizza_ingredients_ibfk_1` FOREIGN KEY (`pizza_id`) REFERENCES `pizzas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pizza_ingredients_ibfk_2` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
