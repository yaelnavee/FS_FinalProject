import React, { useState } from 'react';

const OrderHistory = () => {
  const [orders] = useState([
    {
      id: 1,
      date: '2024-01-15',
      time: '19:30',
      items: [
        { name: 'פיצה מרגריטה', quantity: 1, price: 45 },
        { name: 'קולה', quantity: 2, price: 8 }
      ],
      total: 61,
      status: 'delivered',
      deliveryAddress: 'רחוב הרצל 25, תל אביב'
    },
    {
      id: 2,
      date: '2024-01-10',
      time: '20:15',
      items: [
        { name: 'פיצה פפרוני', quantity: 2, price: 52 }
      ],
      total: 104,
      status: 'delivered',
      deliveryAddress: 'רחוב הרצל 25, תל אביב'
    },
    {
      id: 3,
      date: '2024-01-08',
      time: '18:45',
      items: [
        { name: 'פיצה 4 גבינות', quantity: 1, price: 58 },
        { name: 'מקלות שום', quantity: 1, price: 15 },
        { name: 'מים', quantity: 1, price: 5 }
      ],
      total: 78,
      status: 'delivered',
      deliveryAddress: 'רחוב הרצל 25, תל אביב'
    }
  ]);

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'ממתין לאישור';
      case 'preparing': return 'בהכנה';
      case 'ready': return 'מוכן למשלוח';
      case 'on_way': return 'בדרך אליך';
      case 'delivered': return 'נמסר';
      case 'cancelled': return 'בוטל';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'preparing': return 'status-preparing';
      case 'ready': return 'status-ready';
      case 'on_way': return 'status-on-way';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const reorderItems = (order) => {
    // בעתיד נוסיף פונקציונליות להזמנה חוזרת
    alert(`הזמנה חוזרת של הזמנה #${order.id} - סה"כ ₪${order.total}`);
  };

  return (
    <div className="order-history">
      <h3>ההזמנות שלי</h3>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>אין הזמנות קודמות</p>
          <p>כשתבצע הזמנות, הן יופיעו כאן</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h4>הזמנה #{order.id}</h4>
                  <div className="order-datetime">
                    <span className="order-date">{order.date}</span>
                    <span className="order-time">{order.time}</span>
                  </div>
                </div>
                <span className={`order-status ${getStatusClass(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              
              <div className="order-details">
                <div className="delivery-info">
                  <strong>כתובת משלוח:</strong> {order.deliveryAddress}
                </div>
                
                <div className="order-items">
                  <strong>פריטים:</strong>
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">₪{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                
                <div className="order-footer">
                  <div className="order-total">
                    <strong>סה"כ: ₪{order.total}</strong>
                  </div>
                  
                  {order.status === 'delivered' && (
                    <div className="order-actions">
                      <button 
                        className="reorder-btn"
                        onClick={() => reorderItems(order)}
                      >
                        הזמן שוב
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;