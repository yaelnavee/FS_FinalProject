import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'customer'
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

    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות לא תואמות');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onRegister(data.user, data.token);
      } else {
        setError(data.message || 'שגיאה ברישום');
      }
    } catch (error) {
      setError('שגיאה בחיבור לשרת');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>הרשמה</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>שם מלא:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

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
            <label>אימייל:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
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
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>אימות סיסמה:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>סוג משתמש:</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="customer">לקוח</option>
              <option value="employee">עובד</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'נרשם...' : 'הירשם'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">יש לך כבר חשבון? התחבר כאן</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;