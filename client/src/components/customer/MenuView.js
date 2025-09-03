import React, { useEffect, useState } from 'react';

const MenuView = ({ onAddToCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(data => {
        setMenuItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('שגיאה בקבלת תפריט:', err);
        setLoading(false);
      });
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

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  if (loading) {
    return <div className="loading">טוען תפריט...</div>;
  }

  return (
    <div className="menu-view">
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
                {/* תמונת המנה */}
                <div className="menu-item-image">
                  {item.image_url ? (
                    <img 
                      src={`http://localhost:5000${item.image_url}`} 
                      alt={item.name}
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <span>🍕</span>
                    </div>
                  )}
                </div>

                <div className="item-details">
                  <h3>{item.name}</h3>
                  
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}

                  <div className="item-category-tag">
                    {item.category}
                  </div>
                  
                  {!available && (
                    <div className="availability-notice">
                      {availabilityMsg}
                    </div>
                  )}
                  
                  <div className="item-footer">
                    <span className="item-price">₪{item.price}</span>
                    <button 
                      className={`add-to-cart-btn ${!available ? 'disabled' : ''}`}
                      onClick={() => available && onAddToCart(item)}
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
          <div className="no-items-message">
            <h3>לא נמצאו מנות זמינות בקטגוריה זו</h3>
            <p>נסה לבחור קטגוריה אחרת או חזור מאוחר יותר</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuView;