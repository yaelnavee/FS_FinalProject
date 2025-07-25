import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user, data.token);
      } else {
        setError(data.message || 'שגיאה בהתחברות');
      }
    } catch (error) {
      setError('שגיאה בחיבור לשרת');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>התחברות</h2>
        
        <div className="demo-users">
          <h4>משתמשים לדוגמה:</h4>
          <p><strong>עובד:</strong> manager / password123</p>
          <p><strong>לקוח:</strong> customer1 / password123</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>שם משתמש:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>סיסמה:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/register">אין לך חשבון? הירשם כאן</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;