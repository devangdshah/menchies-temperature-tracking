import React, { useState, useEffect } from 'react';
import './OutOfStock.css';

const OutOfStock = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/out-of-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newItem.trim() })
      });

      const data = await response.json();
      if (response.ok) {
        setItems([...items, data]);
        setNewItem('');
        setError('');
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
        setError('');
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
      
      <form onSubmit={handleAddItem} className="add-item-form">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Enter item name"
          className="item-input"
        />
        <button type="submit" className="add-button">Add Item</button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="items-list">
          {items.length === 0 ? (
            <p className="no-items">No out-of-stock items</p>
          ) : (
            items.map(item => (
              <div key={item._id} className="item-card">
                <span className="item-name">{item.name}</span>
                <button 
                  onClick={() => handleRemoveItem(item._id)}
                  className="remove-button"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OutOfStock; 