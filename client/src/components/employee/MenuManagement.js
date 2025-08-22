import React, { useEffect, useState } from 'react';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'פיצות',
    description: '',
    image_url: ''
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(err => console.error('שגיאה בקבלת תפריט:', err));
  }, []);


  const handleAddItem = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('את צריכה להתחבר כעובדת');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newItem)
      });

      if (response.ok) {
        const addedItem = await response.json();
        setMenuItems([...menuItems, addedItem]);
        setNewItem({ name: '', price: '', category: 'פיצות', description: '', image_url: '' });
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
          <button type="submit">הוסף</button>
        </div>
      </form>

      <div className="menu-items">
        <h4>מנות התפריט</h4>
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