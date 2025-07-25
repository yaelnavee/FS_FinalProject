import React, { useState } from 'react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      customerName: 'יוסי כהן',
      items: [
        { name: 'פיצה מרגריטה', quantity: 2, price: 45 },
        { name: 'קולה', quantity: 1, price: 8 }
      ],
      total: 98,
      status: 'pending',
      orderTime: '14:30',
      phone: '050-1234567'
    },
    {
      id: 2,
      customerName: 'שרה לוי',
      items: [
        { name: 'פיצה פפרוני', quantity: 1, price: 52 }
      ],
      total: 52,
      status: 'preparing',
      orderTime: '14:45',
      phone: '052-9876543'
    }
  ]);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'ממתין';
      case 'preparing': return 'בהכנה';
      case 'ready': return 'מוכן';
      case 'delivered': return 'נמסר';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'preparing': return 'status-preparing';
      case 'ready': return 'status-ready';
      case 'delivered': return 'status-delivered';
      default: return '';
    }
  };

  return (
    <div className="order-management">
      <h3>ניהול הזמנות</h3>
      
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <h4>הזמנה #{order.id}</h4>
              <span className="order-time">{order.orderTime}</span>
              <span className={`order-status ${getStatusClass(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
            
            <div className="order-details">
              <p><strong>לקוח:</strong> {order.customerName}</p>
              <p><strong>טלפון:</strong> {order.phone}</p>
              
              <div className="order-items">
                <strong>פריטים:</strong>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    {item.name} x{item.quantity} - ₪{item.price * item.quantity}
                  </div>
                ))}
              </div>
              
              <div className="order-total">
                <strong>סה"כ: ₪{order.total}</strong>
              </div>
            </div>
            
            <div className="order-actions">
              {order.status === 'pending' && (
                <button onClick={() => updateOrderStatus(order.id, 'preparing')}>
                  התחל הכנה
                </button>
              )}
              {order.status === 'preparing' && (
                <button onClick={() => updateOrderStatus(order.id, 'ready')}>
                  סמן כמוכן
                </button>
              )}
              {order.status === 'ready' && (
                <button onClick={() => updateOrderStatus(order.id, 'delivered')}>
                  סמן כנמסר
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;