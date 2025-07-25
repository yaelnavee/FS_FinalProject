import React, { useState } from 'react';
import MenuManagement from './MenuManagement';
import OrderManagement from './OrderManagement';
import InventoryManagement from './InventoryManagement';

const EmployeeDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('menu');

  const renderTabContent = () => {
    switch(activeTab) {
      case 'menu':
        return <MenuManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'inventory':
        return <InventoryManagement />;
      default:
        return <MenuManagement />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>דשבורד עובדים - {user.name}</h2>
        <p>ברוך הבא למערכת הניהול של הפיצריה</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'menu' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('menu')}
        >
          📋 ניהול תפריט
        </button>
        <button 
          className={activeTab === 'orders' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('orders')}
        >
          📦 ניהול הזמנות
        </button>
        <button 
          className={activeTab === 'inventory' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('inventory')}
        >
          📊 ניהול מלאי
        </button>
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default EmployeeDashboard;