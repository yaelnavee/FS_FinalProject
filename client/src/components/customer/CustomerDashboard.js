import React, { useState } from 'react';
import MenuView from './MenuView';
import CartView from './CartView';
import OrderHistory from './OrderHistory';

const CustomerDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('menu');
  const [cart, setCart] = useState([]);

  const menuItems = [
    { id: 1, name: 'פיצה מרגריטה', price: 45, category: 'פיצות', image: '🍕', description: 'רוטב עגבניות, מוצרלה, בזיליקום' },
    { id: 2, name: 'פיצה פפרוני', price: 52, category: 'פיצות', image: '🍕', description: 'רוטב עגבניות, מוצרלה, פפרוני' },
    { id: 3, name: 'פיצה ירקות', price: 48, category: 'פיצות', image: '🍕', description: 'רוטב עגבניות, מוצרלה, פלפלים, בצל, זיתים' },
    { id: 4, name: 'פיצה 4 גבינות', price: 58, category: 'פיצות', image: '🍕', description: 'מוצרלה, פרמזן, גורגונזולה, ריקוטה' },
    { id: 5, name: 'קולה', price: 8, category: 'שתייה', image: '🥤', description: 'משקה קולה קר' },
    { id: 6, name: 'מים', price: 5, category: 'שתייה', image: '💧', description: 'מים מינרליים' },
    { id: 7, name: 'מקלות שום', price: 15, category: 'תוספות', image: '🥖', description: 'מקלות לחם עם שום וחמאה' }
  ];

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

  const renderTabContent = () => {
    switch(activeTab) {
      case 'menu':
        return <MenuView menuItems={menuItems} onAddToCart={addToCart} />;
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
        return <OrderHistory />;
      default:
        return <MenuView menuItems={menuItems} onAddToCart={addToCart} />;
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