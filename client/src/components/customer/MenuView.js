import React, { useEffect, useState } from 'react';

const MenuView = ({ onAddToCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(err => console.error('שגיאה בקבלת תפריט:', err));
  }, []);

  const categories = ['הכל', 'פיצות', 'שתייה', 'תוספות'];
  
  const filteredItems = selectedCategory === 'הכל' 
    ? menuItems.filter(item => item.available) // מציג רק מנות זמינות
    : menuItems.filter(item => item.category === selectedCategory && item.available);

  const isItemAvailable = (item) => {
    return item.available && item.stock_available !== 0;
  };

  const getAvailabilityMessage = (item) => {
    if (!item.available) return 'מנה לא זמינה';
    if (item.stock_available === 0) return 'אזל מהמלאי';
    return '';
  };

  const showToastMessage = (message, duration = 3000) => {
    setToastMessage(message);
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
    }, duration);
  };

  const handleAddToCart = (item) => {
    onAddToCart(item);
    showToastMessage(`${item.name} נוסף לסל בהצלחה!`);
  };

  return (
    <div className="menu-view">
      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <div className="toast-content">
            <span className="toast-icon">✅</span>
            <span className="toast-message">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            className={selectedCategory === category ? 'category-btn active' : 'category-btn'}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {menuItems
          .filter(item => selectedCategory === 'הכל' || item.category === selectedCategory)
          .map(item => {
            const available = isItemAvailable(item);
            const availabilityMsg = getAvailabilityMessage(item);
            
            return (
              <div key={item.id} className={`menu-item-card ${!available ? 'unavailable' : ''}`}>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  
                  {!available && (
                    <div className="availability-notice">
                      {availabilityMsg}
                    </div>
                  )}
                  
                  <div className="item-footer">
                    <span className="item-price">₪{item.price}</span>
                    <button 
                      className={`add-to-cart-btn ${!available ? 'disabled' : ''}`}
                      onClick={() => available && handleAddToCart(item)}
                      disabled={!available}
                    >
                      {available ? 'הוסף לסל' : 'לא זמין'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        }

        {filteredItems.length === 0 && (
          <p>לא נמצאו מנות זמינות בקטגוריה זו</p>
        )}
      </div>
    </div>
  );
};

export default MenuView;