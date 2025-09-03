import React, { useState, useEffect } from 'react';
import './analystics.css';

const AnalyticsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [popularItems, setPopularItems] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [pendingAlerts, setPendingAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
    // רענון אוטומטי כל 5 דקות
    const interval = setInterval(fetchAllData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [overviewRes, popularRes, revenueRes, stockRes, pendingRes] = await Promise.all([
        fetch('http://localhost:5000/api/analytics/overview', { headers }),
        fetch('http://localhost:5000/api/analytics/popular-items', { headers }),
        fetch('http://localhost:5000/api/analytics/daily-revenue', { headers }),
        fetch('http://localhost:5000/api/analytics/low-stock-alerts', { headers }),
        fetch('http://localhost:5000/api/analytics/pending-alerts', { headers })
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (popularRes.ok) setPopularItems(await popularRes.json());
      if (revenueRes.ok) setDailyRevenue(await revenueRes.json());
      if (stockRes.ok) setLowStock(await stockRes.json());
      if (pendingRes.ok) setPendingAlerts(await pendingRes.json());

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">טוען נתונים...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-dashboard-header">
        <h3>📊 דשבורד ניתוח נתונים</h3>
        <button onClick={fetchAllData} className="analytics-refresh-btn">
          🔄 רענן נתונים
        </button>
      </div>

      {/* התראות דחופות */}
      {(lowStock.length > 0 || pendingAlerts.length > 0) && (
        <div className="analytics-alerts-section">
          <h4>⚠️ התראות דחופות</h4>
          
          {lowStock.length > 0 && (
            <div className="analytics-alert-card analytics-low-stock-alert">
              <h5>📦 מלאי נמוך ({lowStock.length} פריטים)</h5>
              {lowStock.slice(0, 3).map((item, index) => (
                <div key={index} className="analytics-alert-item">
                  {item.name}: {item.quantity} {item.unit} (מינימום: {item.min_stock})
                </div>
              ))}
              {lowStock.length > 3 && <div>ועוד {lowStock.length - 3} פריטים...</div>}
            </div>
          )}

          {pendingAlerts.length > 0 && (
            <div className="analytics-alert-card analytics-pending-alert">
              <h5>⏰ הזמנות שממתינות זמן רב ({pendingAlerts.length})</h5>
              {pendingAlerts.slice(0, 3).map((order, index) => (
                <div key={index} className="analytics-alert-item">
                  הזמנה #{order.id}: ממתינה {order.minutes_waiting} דקות
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* סטטיסטיקות עיקריות */}
      {overview && (
        <div className="analytics-stats-grid">
          <div className="analytics-stat-card today">
            <h4>📅 היום</h4>
            <div className="analytics-stat-value">{overview.today.orders} הזמנות</div>
            <div className="analytics-stat-revenue">₪{overview.today.revenue}</div>
          </div>

          <div className="analytics-stat-card week">
            <h4>📈 השבוע</h4>
            <div className="analytics-stat-value">{overview.week.orders} הזמנות</div>
            <div className="analytics-stat-revenue">₪{overview.week.revenue}</div>
          </div>

          <div className="analytics-stat-card month">
            <h4>🏆 החודש</h4>
            <div className="analytics-stat-value">{overview.month.orders} הזמנות</div>
            <div className="analytics-stat-revenue">₪{overview.month.revenue}</div>
          </div>

          <div className="analytics-stat-card average">
            <h4>💰 ממוצע הזמנה</h4>
            <div className="analytics-stat-value">₪{overview.averageOrderValue ? Number(overview.averageOrderValue).toFixed(2) : '0.00'}</div>
          </div>
        </div>
      )}

      {/* פיצות פופולריות */}
      <div className="analytics-popular-items-section">
        <h4>🍕 הפיצות הפופולריות השבוע</h4>
        <div className="analytics-popular-items-list">
          {popularItems.slice(0, 5).map((item, index) => (
            <div key={index} className="analytics-popular-item">
              <div className="analytics-item-rank">#{index + 1}</div>
              <div className="analytics-item-info">
                <div className="analytics-item-name">{item.name}</div>
                <div className="analytics-item-stats">
                  {item.total_sold} יחידות • ₪{item.total_revenue}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* הכנסות יומיות */}
      <div className="analytics-revenue-chart-section">
        <h4>📊 הכנסות 7 ימים אחרונים</h4>
        <div className="analytics-simple-chart">
          {dailyRevenue.map((day, index) => (
            <div key={index} className="analytics-chart-day">
              <div className="analytics-day-label">
                {new Date(day.date).toLocaleDateString('he-IL', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="analytics-day-bar">
                <div 
                  className="analytics-bar-fill"
                  style={{ 
                    height: `${Math.max(20, (day.revenue / Math.max(...dailyRevenue.map(d => d.revenue))) * 100)}px` 
                  }}
                  title={`₪${day.revenue} • ${day.orders} הזמנות`}
                />
              </div>
              <div className="analytics-day-value">₪{day.revenue}</div>
            </div>
          ))}
        </div>
      </div>

      {/* סטטוס הזמנות היום */}
      {overview && overview.statusBreakdown && (
        <div className="analytics-status-breakdown">
          <h4>📋 סטטוס הזמנות היום</h4>
          <div className="analytics-status-grid">
            {overview.statusBreakdown.map((status, index) => (
              <div key={index} className={`analytics-status-item analytics-status-${status.status}`}>
                <div className="analytics-status-name">
                  {status.status === 'pending' && '⏳ ממתין'}
                  {status.status === 'preparing' && '👨‍🍳 בהכנה'}
                  {status.status === 'ready' && '✅ מוכן'}
                  {status.status === 'delivered' && '🚚 נמסר'}
                </div>
                <div className="analytics-status-count">{status.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;