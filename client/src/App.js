import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import CustomerDashboard from './components/customer/CustomerDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // בדיקה אם יש טוקן שמור ב-localStorage
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>טוען...</h2>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>🍕הפיצריה שלנו</h1>
          {user && (
            <div className="user-info">
              <span>שלום, {user.name}!</span>
              <button onClick={handleLogout} className="logout-btn">
                התנתק
              </button>
            </div>
          )}
        </header>

        <main>
          <Routes>
            <Route 
              path="/login" 
              element={
                user ? 
                  <Navigate to={user.role === 'employee' ? '/employee' : '/customer'} /> :
                  <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/register" 
              element={
                user ? 
                  <Navigate to={user.role === 'employee' ? '/employee' : '/customer'} /> :
                  <Register onRegister={handleLogin} />
              } 
            />
            <Route 
              path="/employee" 
              element={
                user && user.role === 'employee' ? 
                  <EmployeeDashboard user={user} /> : 
                  <Navigate to="/login" />
              } 
            />
            <Route 
              path="/customer" 
              element={
                user && user.role === 'customer' ? 
                  <CustomerDashboard user={user} /> : 
                  <Navigate to="/login" />
              } 
            />
            <Route 
              path="/" 
              element={
                user ? 
                  <Navigate to={user.role === 'employee' ? '/employee' : '/customer'} /> :
                  <Navigate to="/login" />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;