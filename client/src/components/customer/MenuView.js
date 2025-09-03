import React, { useEffect, useState } from 'react';

const MenuView = ({ onAddToCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

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
    ? menuItems.filter(item => item.available)
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

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    // הסרת ההודעה אחרי 3 שניות
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleAddToCart = (item) => {
    onAddToCart(item);
    addToast(`${item.name} נוסף לסל הקניות!`, 'success');
  };

  // קומפוננטת Toast פנימית
  const Toast = ({ message, type, onClose, index }) => (
    <div 
      className={`toast toast-${type}`}
      style={{ top: `${20 + (index * 70)}px` }}
    >
      <div className="toast-icon">
        {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );

  if (loading) {
    return <div className="loading">טוען תפריט...</div>;
  }

  return (
    <>
      {/* Toast Messages */}
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          index={index}
          onClose={() => removeToast(toast.id)}
        />
      ))}

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
            <div className="no-items-message">
              <h3>לא נמצאו מנות זמינות בקטגוריה זו</h3>
              <p>נסה לבחור קטגוריה אחרת או חזור מאוחר יותר</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .toast {
          position: fixed;
          right: 20px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          color: white;
          font-weight: 500;
          font-size: 14px;
          min-width: 300px;
          animation: slideInRight 0.3s ease-out;
        }

        .toast-success {
          background: linear-gradient(135deg, #28a745, #20c997);
        }

        .toast-error {
          background: linear-gradient(135deg, #dc3545, #e74c3c);
        }

        .toast-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .toast-message {
          flex: 1;
          line-height: 1.4;
        }

        .toast-close {
          background: none;
          border: none;
          color: inherit;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s ease;
          opacity: 0.7;
        }

        .toast-close:hover {
          background-color: rgba(255, 255, 255, 0.2);
          opacity: 1;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .toast {
            right: 10px;
            left: 10px;
            min-width: auto;
          }
        }
      `}</style>
    </>
  );
};

export default MenuView;