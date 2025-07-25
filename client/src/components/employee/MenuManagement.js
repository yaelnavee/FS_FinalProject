import React, { useState } from 'react';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'פיצה מרגריטה', price: 45, category: 'פיצות', available: true },
    { id: 2, name: 'פיצה פפרוני', price: 52, category: 'פיצות', available: true },
    { id: 3, name: 'פיצה ירקות', price: 48, category: 'פיצות', available: true },
    { id: 4, name: 'קולה', price: 8, category: 'שתייה', available: true }
  ]);

  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'פיצות'
  });

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.name && newItem.price) {
      const item = {
        id: Date.now(),
        name: newItem.name,
        price: parseFloat(newItem.price),
        category: newItem.category,
        available: true
      };
      setMenuItems([...menuItems, item]);
      setNewItem({ name: '', price: '', category: 'פיצות' });
    }
  };

  const toggleAvailability = (id) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const deleteItem = (id) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  return (
    <div className="menu-management">
      <h3>ניהול תפריט</h3>
      
      <form onSubmit={handleAddItem} className="add-item-form">
        <h4>הוספת פריט חדש</h4>
        <div className="form-row">
          <input
            type="text"
            placeholder="שם הפריט"
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
          <button type="submit">הוסף</button>
        </div>
      </form>

      <div className="menu-items">
        <h4>פריטי התפריט</h4>
        {menuItems.map(item => (
          <div key={item.id} className={`menu-item ${!item.available ? 'unavailable' : ''}`}>
            <span className="item-name">{item.name}</span>
            <span className="item-category">{item.category}</span>
            <span className="item-price">₪{item.price}</span>
            <span className={`item-status ${item.available ? 'available' : 'unavailable'}`}>
              {item.available ? 'זמין' : 'לא זמין'}
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
        ))}
      </div>
    </div>
  );
};

export default MenuManagement;