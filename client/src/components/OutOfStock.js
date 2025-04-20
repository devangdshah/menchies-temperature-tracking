import React, { useState, useEffect } from 'react';
import './OutOfStock.css';

function OutOfStock() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    notes: '',
    expectedRestockDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/out-of-stock`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError('Failed to load out-of-stock items');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/out-of-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to add item');
      
      setFormData({
        itemName: '',
        category: '',
        notes: '',
        expectedRestockDate: ''
      });
      fetchItems();
    } catch (err) {
      setError('Failed to add out-of-stock item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/out-of-stock/${id}/restock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to mark item as restocked');
      fetchItems();
    } catch (err) {
      setError('Failed to update item status');
      console.error(err);
    }
  };

  return (
    <div className="out-of-stock-container">
      <h2>Out of Stock Items</h2>
      
      <form onSubmit={handleSubmit} className="out-of-stock-form">
        <div className="form-group">
          <label>Item Name</label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Ice Cream">Ice Cream</option>
            <option value="Toppings">Toppings</option>
            <option value="Cones">Cones</option>
            <option value="Supplies">Supplies</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Expected Restock Date</label>
          <input
            type="date"
            name="expectedRestockDate"
            value={formData.expectedRestockDate}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Item'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="items-list">
        <h3>Current Out of Stock Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Notes</th>
              <th>Expected Restock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id}>
                <td>{item.itemName}</td>
                <td>{item.category}</td>
                <td>{item.notes}</td>
                <td>{item.expectedRestockDate ? new Date(item.expectedRestockDate).toLocaleDateString() : 'N/A'}</td>
                <td>{item.status}</td>
                <td>
                  <button 
                    onClick={() => handleRestock(item._id)}
                    className="restock-btn"
                  >
                    Mark as Restocked
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OutOfStock; 