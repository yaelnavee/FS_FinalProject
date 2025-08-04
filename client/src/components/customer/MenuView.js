import React, { useEffect, useState } from 'react';

const MenuView = ({ onAddToCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('הכל');

  useEffect(() => {
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(err => console.error('שגיאה בקבלת תפריט:', err));
  }, []);

  
  const categories = ['הכל', 'פיצות', 'שתייה', 'תוספות'];
  
  const filteredItems = selectedCategory === 'הכל' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory && item.available);

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
        {filteredItems.map(item => (
          <div key={item.id} className="menu-item-card">
            {/* <div className="item-image">
              {item.image_url ? <img src={item.image_url} alt={item.name} /> : '🧀'}
            </div> */}
            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <div className="item-footer">
                <span className="item-price">₪{item.price}</span>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => onAddToCart(item)}
                >
                  הוסף לסל
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <p>לא נמצאו פריטים בקטגוריה זו</p>
        )}
      </div>
    </div>
  );
};

export default MenuView;