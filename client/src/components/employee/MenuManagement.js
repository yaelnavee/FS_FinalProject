import React, { useEffect, useState } from 'react';
import './menuManagment.css';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'פיצות',
    description: ''
  });

  useEffect(() => {
    fetchMenuItems();
    fetchAvailableIngredients();
  }, []);

  const fetchMenuItems = () => {
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(err => console.error('שגיאה בקבלת תפריט:', err));
  };

  const fetchAvailableIngredients = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/inventory/ingredients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setAvailableIngredients(data))
      .catch(err => console.error('שגיאה בקבלת רכיבים:', err));
  };

  const handleAddIngredient = () => {
    setSelectedIngredients([...selectedIngredients, { inventory_id: '', quantity_needed: 1 }]);
  };

  const handleRemoveIngredient = (index) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index, field, value) => {
    const updated = selectedIngredients.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    );
    setSelectedIngredients(updated);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // בדיקת סוג הקובץ
      if (!file.type.startsWith('image/')) {
        alert('אנא בחר קובץ תמונה בלבד');
        return;
      }

      // בדיקת גודל הקובץ (5MB מקסימום)
      if (file.size > 5 * 1024 * 1024) {
        alert('הקובץ גדול מדי. מקסימום 5MB');
        return;
      }

      setSelectedImage(file);
      
      // יצירת תצוגה מקדימה
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // איפוס שדה הקובץ
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('את צריכה להתחבר כעובדת');
      return;
    }

    // יצירת FormData להעלאת קבצים
    const formData = new FormData();
    formData.append('name', newItem.name);
    formData.append('price', newItem.price);
    formData.append('category', newItem.category);
    formData.append('description', newItem.description);
    
    // הוספת התמונה אם נבחרה
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    // הוספת הרכיבים
    const validIngredients = selectedIngredients.filter(
      ingredient => ingredient.inventory_id && ingredient.quantity_needed > 0
    );
    formData.append('ingredients', JSON.stringify(validIngredients));

    try {
      const response = await fetch('http://localhost:5000/api/menu', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // לא לשים Content-Type כי FormData מגדיר אותו אוטומטית
        },
        body: formData
      });

      if (response.ok) {
        const addedItem = await response.json();
        setMenuItems([...menuItems, addedItem]);
        
        // איפוס הטופס
        setNewItem({ name: '', price: '', category: 'פיצות', description: '' });
        setSelectedIngredients([]);
        handleRemoveImage();
        
        alert('המנה נוספה בהצלחה!');
      } else {
        const error = await response.json();
        alert('שגיאה בהוספה: ' + error.message);
      }
    } catch (err) {
      console.error('שגיאה בהוספת מנה:', err);
      alert('שגיאה כללית');
    }
  };

  const toggleAvailability = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/menu/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setMenuItems(menuItems.map(item =>
          item.id === id ? { ...item, available: !item.available } : item
        ));
      } else {
        alert('שגיאה בעדכון זמינות');
      }
    } catch (err) {
      console.error('שגיאה בעדכון זמינות:', err);
      alert('שגיאה');
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('האם את בטוחה שברצונך למחוק מנה זו?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setMenuItems(menuItems.filter(item => item.id !== id));
        alert('המנה נמחקה בהצלחה');
      } else {
        alert('שגיאה במחיקה');
      }
    } catch (err) {
      console.error('שגיאת מחיקה:', err);
      alert('שגיאה');
    }
  };

  const getAvailabilityDisplay = (item) => {
    if (!item.available) return { text: 'מוסתר', class: 'hidden' };
    if (item.stock_available === 0) return { text: 'אזל מהמלאי', class: 'out-of-stock' };
    return { text: 'זמין', class: 'available' };
  };

  return (
    <div className="menu-management">
      <h3>ניהול תפריט</h3>
      
      <form onSubmit={handleAddItem} className="add-item-form">
        <h4>הוספת מנה חדשה</h4>
        
        <div className="form-row">
          <input
            type="text"
            placeholder="שם המנה"
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="מחיר"
            min="0"
            step="0.01"
            value={newItem.price}
            onChange={(e) => setNewItem({...newItem, price: e.target.value})}
            required
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
          >
            <option value="פיצות">פיצות</option>
            <option value="שתייה">שתייה</option>
            <option value="תוספות">תוספות</option>
          </select>
        </div>

        <div className="form-row">
          <input
            type="text"
            placeholder="תיאור המנה (אופציונלי)"
            value={newItem.description}
            onChange={(e) => setNewItem({...newItem, description: e.target.value})}
          />
        </div>

        {/* העלאת תמונה */}
        <div className="image-upload-section">
          <h5>תמונת המנה</h5>
          <div className="image-upload-container">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="image-upload"
              className="image-input"
            />
            <label htmlFor="image-upload" className="image-upload-label">
              {imagePreview ? 'שנה תמונה' : 'בחר תמונה'}
            </label>
            
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="תצוגה מקדימה" />
                <button 
                  type="button" 
                  onClick={handleRemoveImage}
                  className="remove-image-btn"
                >
                  הסר תמונה
                </button>
              </div>
            )}
          </div>
        </div>

        {/* בחירת רכיבים */}
        <div className="ingredients-section">
          <h5>רכיבי המנה</h5>
          {selectedIngredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              <select
                value={ingredient.inventory_id}
                onChange={(e) => updateIngredient(index, 'inventory_id', e.target.value)}
                required
              >
                <option value="">בחר רכיב</option>
                {availableIngredients.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.unit}) - במלאי: {item.quantity}
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                placeholder="כמות נדרשת"
                min="0.1"
                step="0.1"
                value={ingredient.quantity_needed}
                onChange={(e) => updateIngredient(index, 'quantity_needed', parseFloat(e.target.value))}
                required
              />
              
              <button 
                type="button" 
                onClick={() => handleRemoveIngredient(index)}
                className="remove-ingredient-btn"
              >
                הסר
              </button>
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={handleAddIngredient}
            className="add-ingredient-btn"
          >
            הוסף רכיב
          </button>
        </div>

        <div className="form-actions">
          <button type="submit">הוסף מנה</button>
        </div>
      </form>

      {/* תצוגת מנות קיימות */}
      <div className="menu-items">
        <h4>מנות התפריט</h4>
        {menuItems.length === 0 ? (
          <p>אין מנות בתפריט</p>
        ) : (
          menuItems.map(item => {
            const availability = getAvailabilityDisplay(item);
            return (
              <div key={item.id} className={`menu-item ${!item.available ? 'unavailable' : ''}`}>
                {item.image_url && (
                  <div className="item-image">
                    <img 
                      src={`http://localhost:5000${item.image_url}`} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-category">{item.category}</span>
                  <span className="item-price">₪{item.price}</span>
                  {item.description && (
                    <span className="item-description">{item.description}</span>
                  )}
                  <span className={`item-status ${availability.class}`}>
                    {availability.text}
                  </span>
                </div>
                
                <div className="item-actions">
                  <button onClick={() => toggleAvailability(item.id)}>
                    {item.available ? 'הסתר' : 'הצג'}
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="delete-btn">
                    מחק
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MenuManagement;