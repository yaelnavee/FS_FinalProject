import React, { useState } from 'react';
import MenuView from './MenuView';
import CartView from './CartView';
import OrderHistory from './OrderHistory';

const CustomerDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('menu');
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const addMultipleToCart = (item, quantity) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  // פונקציה להזמנה חוזרת
  const reorderFromHistory = async (order) => {
    try {
      // קבלת התפריט הנוכחי כדי לוודא שהפריטים עדיין קיימים
      const response = await fetch('http://localhost:5000/api/menu');
      const currentMenu = await response.json();

      // מיפוי הפריטים מההזמנה הקודמת לתפריט הנוכחי
      const itemsToAdd = [];
      
      order.items.forEach(orderItem => {
        // חיפוש הפריט בתפריט הנוכחי לפי שם (כי אין לנו pizza_id בהיסטוריה)
        const menuItem = currentMenu.find(item => 
          item.name === orderItem.name && item.available
        );
        
        if (menuItem) {
          itemsToAdd.push({
            ...menuItem,
            quantity: orderItem.quantity
          });
        }
      });

      if (itemsToAdd.length === 0) {
        alert('לא ניתן להזמין מחדש - הפריטים לא זמינים יותר');
        return;
      }

      // הוספת הפריטים לעגלה
      itemsToAdd.forEach(item => {
        addMultipleToCart(item, item.quantity);
      });

      // מעבר לטאב של העגלה
      setActiveTab('cart');

      // הודעה למשתמש
      const unavailableItems = order.items.length - itemsToAdd.length;
      if (unavailableItems > 0) {
        alert(`הוספו ${itemsToAdd.length} פריטים לעגלה. ${unavailableItems} פריטים לא זמינים כרגע.`);
      } else {
        alert(`כל הפריטים מההזמנה הקודמת נוספו לעגלה בהצלחה!`);
      }

    } catch (error) {
      console.error('Error reordering:', error);
      alert('שגיאה בהזמנה חוזרת');
    }
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'menu':
        return <MenuView onAddToCart={addToCart} />;
      case 'cart':
        return (
          <CartView 
            cart={cart} 
            onUpdateQuantity={updateQuantity} 
            onRemoveItem={removeFromCart} 
            totalPrice={getTotalPrice()}
            onClearCart={clearCart}
          />
        );
      case 'orders':
        return <OrderHistory onReorder={reorderFromHistory} />;
      default:
        return <MenuView onAddToCart={addToCart} />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>ברוך הבא {user.name}!</h2>
        <p>זמן להזמין פיצה טעימה 🍕</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'menu' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('menu')}
        >
          🍕 תפריט
        </button>
        <button 
          className={activeTab === 'cart' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('cart')}
        >
          🛒 סל קניות ({cart.length})
        </button>
        <button 
          className={activeTab === 'orders' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('orders')}
        >
          📋 ההזמנות שלי
        </button>
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CustomerDashboard;