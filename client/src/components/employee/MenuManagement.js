import React, { useEffect, useState } from 'react';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'פיצות',
    description: '',
    image_url: ''
  });

  useEffect(() => {
    fetchMenuItems();
    fetchAvailableIngredients();
  }, []);

  const fetchMenuItems = () => {
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(err => console.error('שגיאה בקבלת תפריט:', err));
  };

  const fetchAvailableIngredients = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/inventory/ingredients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setAvailableIngredients(data))
      .catch(err => console.error('שגיאה בקבלת רכיבים:', err));
  };

  const handleAddIngredient = () => {
    setSelectedIngredients([...selectedIngredients, { inventory_id: '', quantity_needed: 1 }]);
  };

  const handleRemoveIngredient = (index) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index, field, value) => {
    const updated = selectedIngredients.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    );
    setSelectedIngredients(updated);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('את צריכה להתחבר כעובדת');
      return;
    }

    // סינון רכיבים שנבחרו (להסיר רכיבים ריקים)
    const validIngredients = selectedIngredients.filter(
      ingredient => ingredient.inventory_id && ingredient.quantity_needed > 0
    );

    try {
      const response = await fetch('http://localhost:5000/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newItem,
          ingredients: validIngredients
        })
      });

      if (response.ok) {
        const addedItem = await response.json();
        setMenuItems([...menuItems, addedItem]);
        setNewItem({ name: '', price: '', category: 'פיצות', description: '', image_url: '' });
        setSelectedIngredients([]);
        alert('המנה נוספה בהצלחה!');
      } else {
        const error = await response.json();
        alert('שגיאה בהוספה: ' + error.message);
      }
    } catch (err) {
      console.error('שגיאה בהוספת מנה:', err);
      alert('שגיאה כללית');
    }
  };

  const toggleAvailability = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/menu/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setMenuItems(menuItems.map(item =>
          item.id === id ? { ...item, available: !item.available } : item
        ));
      } else {
        alert('שגיאה בעדכון זמינות');
      }
    } catch (err) {
      console.error('שגיאה בעדכון זמינות:', err);
      alert('שגיאה');
    }
  };

  const deleteItem = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setMenuItems(menuItems.filter(item => item.id !== id));
      } else {
        alert('שגיאה במחיקה');
      }
    } catch (err) {
      console.error('שגיאת מחיקה:', err);
      alert('שגיאה');
    }
  };

  const getAvailabilityDisplay = (item) => {
    if (!item.available) return { text: 'מוסתר', class: 'hidden' };
    if (item.stock_available === 0) return { text: 'אזל מהמלאי', class: 'out-of-stock' };
    return { text: 'זמין', class: 'available' };
  };

  return (
    <div className="menu-management">
      <h3>ניהול תפריט</h3>
      
      <form onSubmit={handleAddItem} className="add-item-form">
        <h4>הוספת מנה חדשה</h4>
        
        <div className="form-row">
          <input
            type="text"
            placeholder="שם המנה"
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="מחיר"
            value={newItem.price}
            onChange={(e) => setNewItem({...newItem, price: e.target.value})}
            required
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
          >
            <option value="פיצות">פיצות</option>
            <option value="שתייה">שתייה</option>
            <option value="תוספות">תוספות</option>
          </select>
        </div>

        <div className="form-row">
          <input
            type="text"
            placeholder="תיאור המנה (אופציונלי)"
            value={newItem.description}
            onChange={(e) => setNewItem({...newItem, description: e.target.value})}
          />
        </div>

        {/* בחירת רכיבים */}
        <div className="ingredients-section">
          <h5>רכיבי המנה</h5>
          {selectedIngredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              <select
                value={ingredient.inventory_id}
                onChange={(e) => updateIngredient(index, 'inventory_id', e.target.value)}
                required
              >
                <option value="">בחר רכיב</option>
                {availableIngredients.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.unit}) - במלאי: {item.quantity}
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                placeholder="כמות נדרשת"
                min="0.1"
                step="0.1"
                value={ingredient.quantity_needed}
                onChange={(e) => updateIngredient(index, 'quantity_needed', parseFloat(e.target.value))}
                required
              />
              
              <button 
                type="button" 
                onClick={() => handleRemoveIngredient(index)}
                className="remove-ingredient-btn"
              >
                הסר
              </button>
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={handleAddIngredient}
            className="add-ingredient-btn"
          >
            הוסף רכיב
          </button>
        </div>

        <div className="form-actions">
          <button type="submit">הוסף מנה</button>
        </div>
      </form>

      <div className="menu-items">
        <h4>מנות התפריט</h4>
        {menuItems.map(item => {
          const availability = getAvailabilityDisplay(item);
          return (
            <div key={item.id} className={`menu-item ${!item.available ? 'unavailable' : ''}`}>
              <span className="item-name">{item.name}</span>
              <span className="item-category">{item.category}</span>
              <span className="item-price">₪{item.price}</span>
              <span className={`item-status ${availability.class}`}>
                {availability.text}
              </span>
              <div className="item-actions">
                <button onClick={() => toggleAvailability(item.id)}>
                  {item.available ? 'הסתר' : 'הצג'}
                </button>
                <button onClick={() => deleteItem(item.id)} className="delete-btn">
                  מחק
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MenuManagement;