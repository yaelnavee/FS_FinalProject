import React, { useEffect, useState } from 'react';
import './orderHistory.css';

const OrderHistory = ({ onReorder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'ממתין לאישור';
      case 'preparing': return 'בהכנה';
      case 'ready': return 'מוכן למשלוח';
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
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const handleReorder = (order) => {
    if (onReorder) {
      onReorder(order);
    }
  };

  if (loading) {
    return <div className="loading">טוען הזמנות...</div>;
  }

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
            const date = new Date(order.orderTime || order.order_time);
            const formattedDate = date.toLocaleDateString('he-IL');
            const formattedTime = date.toLocaleTimeString('he-IL', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });

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
                  {order.address && (
                    <div className="delivery-info">
                      <strong>כתובת משלוח:</strong> {order.address}
                    </div>
                  )}
                  
                  <div className="order-items">
                    <strong>פריטים:</strong>
                    {order.items && order.items.map((item, index) => (
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
                    
                    <div className="order-actions">
                      {/* כפתור הזמן שוב זמין לכל ההזמנות שנמסרו */}
                      {order.status === 'delivered' && (
                        <button 
                          className="reorder-btn"
                          onClick={() => handleReorder(order)}
                          title="הוסף את כל הפריטים מההזמנה הזו לעגלת הקניות"
                        >
                          🔄 הזמן שוב
                        </button>
                      )}
                      
                      {/* אפשרות לראות פרטים מלאים */}
                      <button 
                        className="details-btn"
                        onClick={() => alert(`פרטי הזמנה #${order.id}\nטלפון: ${order.phone || 'לא צוין'}\nהערות: ${order.notes || 'אין'}`)}
                        title="פרטים נוספים"
                      >
                        ℹ️ פרטים
                      </button>
                    </div>
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