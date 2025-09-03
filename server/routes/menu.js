const express = require('express');
const db = require('../db');
const { authenticateToken, requireEmployee } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// קבלת כל הפיצות עם בדיקת זמינות לפי מלאי
router.get('/', async (req, res) => {
  try {
    const [pizzas] = await db.execute(`
      SELECT p.*, 
             CASE 
               WHEN p.available = 0 THEN 0
               WHEN COUNT(pi.inventory_id) = 0 THEN 1
               WHEN MIN(CASE WHEN i.quantity >= pi.quantity_needed THEN 1 ELSE 0 END) = 1 THEN 1
               ELSE 0 
             END as stock_available
      FROM pizzas p
      LEFT JOIN pizza_ingredients pi ON p.id = pi.pizza_id
      LEFT JOIN inventory i ON pi.inventory_id = i.id
      GROUP BY p.id
      ORDER BY p.category, p.name
    `);
    res.json(pizzas);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ message: 'שגיאה בקבלת תפריט' });
  }
});

// קבלת פיצה ספציפית עם הרכיבים שלה
router.get('/:id/ingredients', authenticateToken, requireEmployee, async (req, res) => {
  try {
    const [ingredients] = await db.execute(`
      SELECT pi.*, i.name as ingredient_name, i.unit, i.quantity as stock_quantity
      FROM pizza_ingredients pi
      JOIN inventory i ON pi.inventory_id = i.id
      WHERE pi.pizza_id = ?
      ORDER BY i.name
    `, [req.params.id]);
    
    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching pizza ingredients:', error);
    res.status(500).json({ message: 'שגיאה בקבלת רכיבי המנה' });
  }
});

// הוספת פיצה עם תמונה ורכיבים
router.post('/', authenticateToken, requireEmployee, upload.single('image'), async (req, res) => {
  const { name, price, description, category, ingredients } = req.body;
  
  // URL של התמונה שהועלתה
  const image_url = req.file ? `/uploads/images/${req.file.filename}` : null;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // הוספת הפיצה
    const [pizzaResult] = await connection.execute(
      'INSERT INTO pizzas (name, price, description, category, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, price, description, category, image_url]
    );

    const pizzaId = pizzaResult.insertId;

    // הוספת הרכיבים
    if (ingredients) {
      let parsedIngredients;
      try {
        parsedIngredients = typeof ingredients === 'string' ? 
          JSON.parse(ingredients) : ingredients;
      } catch (e) {
        parsedIngredients = [];
      }

      if (Array.isArray(parsedIngredients) && parsedIngredients.length > 0) {
        for (const ingredient of parsedIngredients) {
          if (ingredient.inventory_id && ingredient.quantity_needed > 0) {
            await connection.execute(
              'INSERT INTO pizza_ingredients (pizza_id, inventory_id, quantity_needed) VALUES (?, ?, ?)',
              [pizzaId, ingredient.inventory_id, ingredient.quantity_needed]
            );
          }
        }
      }
    }

    await connection.commit();
    
    res.status(201).json({ 
      id: pizzaId, 
      name, 
      price, 
      description, 
      category, 
      image_url,
      available: true
    });
  } catch (error) {
    await connection.rollback();
    
    // מחיקת התמונה שהועלתה אם יש שגיאה
    if (req.file) {
      const imagePath = path.join(__dirname, '..', req.file.path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    console.error('Error adding pizza with ingredients:', error);
    res.status(500).json({ message: 'שגיאה בהוספת מנה' });
  } finally {
    connection.release();
  }
});

// עדכון רכיבי פיצה
router.put('/:id/ingredients', authenticateToken, requireEmployee, async (req, res) => {
  const { ingredients } = req.body;
  const pizzaId = req.params.id;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // מחיקת הרכיבים הקיימים
    await connection.execute('DELETE FROM pizza_ingredients WHERE pizza_id = ?', [pizzaId]);

    // הוספת הרכיבים החדשים
    if (ingredients && ingredients.length > 0) {
      for (const ingredient of ingredients) {
        await connection.execute(
          'INSERT INTO pizza_ingredients (pizza_id, inventory_id, quantity_needed) VALUES (?, ?, ?)',
          [pizzaId, ingredient.inventory_id, ingredient.quantity_needed || 1]
        );
      }
    }

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating pizza ingredients:', error);
    res.status(500).json({ message: 'שגיאה בעדכון רכיבי המנה' });
  } finally {
    connection.release();
  }
});

// עדכון תמונה למנה קיימת
router.put('/:id/image', authenticateToken, requireEmployee, upload.single('image'), async (req, res) => {
  const pizzaId = req.params.id;
  const image_url = req.file ? `/uploads/images/${req.file.filename}` : null;

  if (!image_url) {
    return res.status(400).json({ message: 'לא הועלתה תמונה' });
  }

  try {
    // קבלת התמונה הקודמת למחיקה
    const [oldPizza] = await db.execute('SELECT image_url FROM pizzas WHERE id = ?', [pizzaId]);
    
    // עדכון התמונה החדשה
    await db.execute(
      'UPDATE pizzas SET image_url = ? WHERE id = ?',
      [image_url, pizzaId]
    );
    
    // מחיקת התמונה הקודמת
    if (oldPizza[0]?.image_url) {
      const oldImagePath = path.join(__dirname, '..', oldPizza[0].image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    res.json({ success: true, image_url });
  } catch (error) {
    // מחיקת התמונה החדשה במקרה של שגיאה
    if (req.file) {
      const imagePath = path.join(__dirname, '..', req.file.path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    console.error('Error updating pizza image:', error);
    res.status(500).json({ message: 'שגיאה בעדכון תמונה' });
  }
});

// מחיקת פיצה (כולל מחיקת התמונה)
router.delete('/:id', authenticateToken, requireEmployee, async (req, res) => {
  const pizzaId = req.params.id;
  
  try {
    // קבלת נתוני הפיצה למחיקת התמונה
    const [pizza] = await db.execute('SELECT image_url FROM pizzas WHERE id = ?', [pizzaId]);
    
    // מחיקת הפיצה (הרכיבים יימחקו אוטומטית בגלל CASCADE)
    const [result] = await db.execute('DELETE FROM pizzas WHERE id = ?', [pizzaId]);
    
    // מחיקת קובץ התמונה
    if (pizza[0]?.image_url) {
      const imagePath = path.join(__dirname, '..', pizza[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting pizza:', error);
    res.status(500).json({ message: 'שגיאה במחיקה' });
  }
});

// שינוי זמינות
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

// בדיקת זמינות מנה לפי מלאי
router.get('/:id/availability', async (req, res) => {
  try {
    const [result] = await db.execute(`
      SELECT p.available,
             CASE 
               WHEN p.available = 0 THEN 0
               WHEN COUNT(pi.inventory_id) = 0 THEN 1
               WHEN MIN(CASE WHEN i.quantity >= pi.quantity_needed THEN 1 ELSE 0 END) = 1 THEN 1
               ELSE 0 
             END as stock_available,
             GROUP_CONCAT(
               CASE WHEN i.quantity < pi.quantity_needed 
               THEN CONCAT(i.name, ' (נדרש: ', pi.quantity_needed, ', יש: ', i.quantity, ')') 
               END SEPARATOR ', '
             ) as missing_ingredients
      FROM pizzas p
      LEFT JOIN pizza_ingredients pi ON p.id = pi.pizza_id
      LEFT JOIN inventory i ON pi.inventory_id = i.id
      WHERE p.id = ?
      GROUP BY p.id
    `, [req.params.id]);

    res.json(result[0] || { available: false, stock_available: false });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'שגיאה בבדיקת זמינות' });
  }
});

module.exports = router;