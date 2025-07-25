import React, { useState } from 'react';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'בצק פיצה', quantity: 50, unit: 'יחידות', minStock: 10 },
    { id: 2, name: 'רוטב עגבניות', quantity: 5, unit: 'ק"ג', minStock: 2 },
    { id: 3, name: 'גבינת מוצרלה', quantity: 8, unit: 'ק"ג', minStock: 3 },
    { id: 4, name: 'פפרוני', quantity: 2, unit: 'ק"ג', minStock: 1 },
    { id: 5, name: 'פלפלים', quantity: 3, unit: 'ק"ג', minStock: 2 }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity >= 0) {
      setInventory(inventory.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const isLowStock = (item) => item.quantity <= item.minStock;

  return (
    <div className="inventory-management">
      <h3>ניהול מלאי</h3>
      
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
        {inventory.map(item => (
          <div key={item.id} className={`inventory-item ${isLowStock(item) ? 'low-stock' : ''}`}>
            <div className="item-info">
              <h4>{item.name}</h4>
              <span className="min-stock">מלאי מינימום: {item.minStock} {item.unit}</span>
            </div>
            
            <div className="quantity-controls">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                -
              </button>
              <span className="quantity">
                {item.quantity} {item.unit}
              </span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                +
              </button>
            </div>
            
            <div className="stock-status">
              {isLowStock(item) ? (
                <span className="low">מלאי נמוך</span>
              ) : (
                <span className="good">תקין</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryManagement;