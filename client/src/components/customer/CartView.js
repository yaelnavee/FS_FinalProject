import React, { useState } from 'react';

const CartView = ({ cart, onUpdateQuantity, onRemoveItem, totalPrice, onClearCart }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    phone: '',
    address: '',
    notes: ''
  });

  const handleCheckout = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    console.log('טוקן נשלח:', token);
    if (!token) {
      alert('את צריכה להתחבר כדי לבצע הזמנה');
      return;
    }

    const orderData = {
      items: cart.map(item => ({
        pizza_id: item.id,
        quantity: item.quantity
        })),
      total: totalPrice, // אופציונלי – בודקים גם בצד שרת
      customerDetails: orderDetails // אופציונלי – אם את שומרת כתובת וכו'
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const data = await response.json();
        
        alert(`ההזמנה נשלחה בהצלחה! מספר הזמנה: ${data.orderId}
              סה"כ לתשלום: ₪${totalPrice}
              זמן הכנה משוער: 30-40 דקות`); 
        onClearCart();
        setShowCheckout(false);
        setOrderDetails({ phone: '', address: '', notes: '' });
      } else {
        const errorData = await response.json();
        alert('שגיאה בשליחת ההזמנה: ' + errorData.message);
      }
    } catch (err) {
      console.error('Order error:', err);
      alert('הייתה שגיאה בשליחת ההזמנה');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h3>הסל שלך ריק</h3>
        <p>הוסף פריטים מהתפריט כדי להתחיל</p>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="checkout-view">
        <h3>פרטי ההזמנה</h3>
        
        <div className="order-summary">
          <h4>סיכום הזמנה:</h4>
          {cart.map(item => (
            <div key={item.id} className="order-item">
              {item.name} x{item.quantity} - ₪{item.price * item.quantity}
            </div>
          ))}
          <div className="order-total">
            <strong>סה"כ לתשלום: ₪{totalPrice}</strong>
          </div>
        </div>

        <form onSubmit={handleCheckout} className="checkout-form">
          <div className="form-group">
            <label>מספר טלפון:</label>
            <input
              type="tel"
              value={orderDetails.phone}
              onChange={(e) => setOrderDetails({...orderDetails, phone: e.target.value})}
              required
              placeholder="050-1234567"
            />
          </div>

          <div className="form-group">
            <label>כתובת למשלוח:</label>
            <textarea
              value={orderDetails.address}
              onChange={(e) => setOrderDetails({...orderDetails, address: e.target.value})}
              required
              placeholder="רחוב, מספר בית, עיר"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>הערות (אופציונלי):</label>
            <textarea
              value={orderDetails.notes}
              onChange={(e) => setOrderDetails({...orderDetails, notes: e.target.value})}
              placeholder="בקשות מיוחדות, הערות למטבח..."
              rows="2"
            />
          </div>

          <div className="checkout-actions">
            <button 
              type="button" 
              onClick={() => setShowCheckout(false)}
              className="back-btn"
            >
              חזור לסל
            </button>
            <button type="submit" className="place-order-btn">
              בצע הזמנה - ₪{totalPrice}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="cart-view">
      <h3>סל הקניות שלך</h3>
      
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <div className="item-info">
              <span className="item-image">{item.image}</span>
              <div className="item-details">
                <h4>{item.name}</h4>
                <span className="item-price">₪{item.price}</span>
              </div>
            </div>
            
            <div className="quantity-controls">
              <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                -
              </button>
              <span className="quantity">{item.quantity}</span>
              <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                +
              </button>
            </div>
            
            <div className="item-total">
              ₪{item.price * item.quantity}
            </div>
            
            <button 
              className="remove-btn"
              onClick={() => onRemoveItem(item.id)}
              title="הסר פריט"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
      
      <div className="cart-footer">
        <div className="cart-summary">
          <div className="cart-total">
            <h3>סה"כ: ₪{totalPrice}</h3>
          </div>
          <div className="cart-actions">
            <button 
              className="clear-cart-btn"
              onClick={onClearCart}
            >
              רוקן סל
            </button>
            <button 
              className="checkout-btn"
              onClick={() => setShowCheckout(true)}
            >
              המשך לתשלום
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;