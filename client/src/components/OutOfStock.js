import React, { useState, useEffect } from 'react';
import './OutOfStock.css';

const OutOfStock = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchOutOfStockItems();
  }, []);

  const fetchOutOfStockItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/out-of-stock`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setItems(data);
      } else {
        setError(data.message || 'Failed to fetch out-of-stock items');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/out-of-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setItems([...items, data]);
        setFormData({ name: '', comment: '' });
        setSuccess('Item added successfully');
      } else {
        setError(data.message || 'Failed to add item');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/out-of-stock/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setItems(items.filter(item => item._id !== id));
        setSuccess('Item removed successfully');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to remove item');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="out-of-stock-container">
      <h2>Out of Stock Items</h2>
      
      <div className="form-section">
        <h3>Add New Item</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Item Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter item name"
            />
          </div>
          <div className="form-group">
            <label>Comment</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Add any additional comments"
              rows="3"
            />
          </div>
          <button type="submit">Add Item</button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="results-section">
        <h3>Out of Stock Items List</h3>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : items.length === 0 ? (
          <div className="no-results">No out-of-stock items found</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item Name</th>
                  <th>Comment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    <td>{new Date(item.date).toLocaleString()}</td>
                    <td>{item.name}</td>
                    <td>{item.comment}</td>
                    <td>
                      <button 
                        onClick={() => handleRemoveItem(item._id)}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutOfStock; 