import React, { useEffect, useState } from 'react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching user orders:', err);
    }
  };

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
          {orders.map(order => {
            const date = new Date(order.order_time);
            const formattedDate = date.toLocaleDateString('he-IL');
            const formattedTime = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h4>הזמנה #{order.id}</h4>
                    <div className="order-datetime">
                      <span className="order-date">{formattedDate}</span>
                      <span className="order-time">{formattedTime}</span>
                    </div>
                  </div>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                
                <div className="order-details">
                  <div className="delivery-info">
                    <strong>כתובת משלוח:</strong> {order.address}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
