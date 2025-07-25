import React, { useState } from 'react';

const MenuView = ({ menuItems, onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  
  const categories = ['הכל', 'פיצות', 'שתייה', 'תוספות'];
  
  const filteredItems = selectedCategory === 'הכל' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

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
            <div className="item-image">{item.image}</div>
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
      </div>
    </div>
  );
};

export default MenuView;