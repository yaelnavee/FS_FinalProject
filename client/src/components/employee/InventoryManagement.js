import React, { useState, useEffect } from 'react';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: 'ק"ג',
    min_stock: ''
  });

  // יחידות מידה קבועות
  const units = ['ק"ג', 'ליטר', 'יחידות', 'גרם'];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      } else {
        console.error('Failed to fetch inventory');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, newQuantity, minStock) => {
    if (newQuantity < 0) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          quantity: parseInt(newQuantity),
          min_stock: parseInt(minStock)
        })
      });

      if (response.ok) {
        setInventory(inventory.map(item => 
          item.id === id ? { ...item, quantity: parseInt(newQuantity) } : item
        ));
      } else {
        alert('שגיאה בעדכון מלאי');
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('שגיאה בעדכון מלאי');
    }
  };

  const addNewItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.name || !newItem.quantity || !newItem.unit || !newItem.min_stock) {
      alert('יש למלא את כל השדות');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newItem,
          quantity: parseInt(newItem.quantity),
          min_stock: parseInt(newItem.min_stock)
        })
      });

      if (response.ok) {
        const addedItem = await response.json();
        setInventory([...inventory, addedItem]);
        setNewItem({ name: '', quantity: '', unit: 'ק"ג', min_stock: '' });
      } else {
        alert('שגיאה בהוספת פריט');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('שגיאה בהוספת פריט');
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק פריט זה?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setInventory(inventory.filter(item => item.id !== id));
      } else {
        alert('שגיאה במחיקת פריט');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('שגיאה במחיקת פריט');
    }
  };

  // פונקציה לעדכון מהיר - בקפיצות של 5 או 10
  const quickUpdate = (id, currentQuantity, minStock, increment) => {
    const newQuantity = Math.max(0, currentQuantity + increment);
    updateQuantity(id, newQuantity, minStock);
  };

  const isLowStock = (item) => item.quantity <= item.min_stock;

  if (loading) {
    return <div className="loading">טוען מלאי...</div>;
  }

  return (
    <div className="inventory-management">
      <h3>ניהול מלאי</h3>
      
      <form onSubmit={addNewItem} className="add-item-form">
        <h4>הוספת פריט חדש למלאי</h4>
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
            placeholder="כמות"
            min="0"
            step="1"
            value={newItem.quantity}
            onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
            required
          />
          <select
            value={newItem.unit}
            onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
            required
          >
            {units.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="מלאי מינימום"
            min="0"
            step="1"
            value={newItem.min_stock}
            onChange={(e) => setNewItem({...newItem, min_stock: e.target.value})}
            required
          />
          <button type="submit">הוסף</button>
        </div>
      </form>

      <div className="inventory-alerts">
        {inventory.filter(isLowStock).length > 0 && (
          <div className="alert">
            <h4>⚠️ התראות מלאי נמוך:</h4>
            {inventory.filter(isLowStock).map(item => (
              <div key={item.id} className="low-stock-alert">
                {item.name} - נותרו רק {item.quantity} {item.unit}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="inventory-list">
        {inventory.length === 0 ? (
          <p>אין פריטים במלאי</p>
        ) : (
          inventory.map(item => (
            <div key={item.id} className={`inventory-item ${isLowStock(item) ? 'low-stock' : ''}`}>
              <div className="item-info">
                <h4>{item.name}</h4>
                <span className="min-stock">מלאי מינימום: {item.min_stock} {item.unit}</span>
              </div>
              
              <div className="quantity-controls">
                {/* כפתורי עדכון מהיר */}
                <div className="quick-controls">
                  <button 
                    className="quick-btn"
                    onClick={() => quickUpdate(item.id, item.quantity, item.min_stock, -10)}
                    title="הקטן ב-10"
                  >
                    -10
                  </button>
                  <button 
                    className="quick-btn"
                    onClick={() => quickUpdate(item.id, item.quantity, item.min_stock, -5)}
                    title="הקטן ב-5"
                  >
                    -5
                  </button>
                </div>

                {/* כפתורי +/- רגילים */}
                <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.min_stock)}>
                  -
                </button>
                <span className="quantity">
                  {item.quantity} {item.unit}
                </span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.min_stock)}>
                  +
                </button>

                {/* כפתורי עדכון מהיר */}
                <div className="quick-controls">
                  <button 
                    className="quick-btn"
                    onClick={() => quickUpdate(item.id, item.quantity, item.min_stock, 5)}
                    title="הוסף 5"
                  >
                    +5
                  </button>
                  <button 
                    className="quick-btn"
                    onClick={() => quickUpdate(item.id, item.quantity, item.min_stock, 10)}
                    title="הוסף 10"
                  >
                    +10
                  </button>
                </div>
              </div>
              
              <div className="stock-status">
                {isLowStock(item) ? (
                  <span className="low">מלאי נמוך</span>
                ) : (
                  <span className="good">תקין</span>
                )}
              </div>

              <button 
                className="delete-btn"
                onClick={() => deleteItem(item.id)}
                title="מחק פריט"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;