import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import './OutOfStock.css';

const OutOfStock = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    itemName: '',
    notes: ''
  });
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/out-of-stock`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch out-of-stock items');
      }
      
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/out-of-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to add out-of-stock item');
      }

      setSuccess(true);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        itemName: '',
        notes: ''
      });
      fetchItems();
    } catch (err) {
      setError(err.message);
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

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (searchParams.startDate) queryParams.append('startDate', searchParams.startDate);
      if (searchParams.endDate) queryParams.append('endDate', searchParams.endDate);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/out-of-stock/search?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search out-of-stock items');
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      items.map(item => ({
        'Date': format(new Date(item.date), 'MM/dd/yyyy'),
        'Item Name': item.itemName,
        'Notes': item.notes || ''
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Out of Stock Items');
    XLSX.writeFile(workbook, 'out-of-stock-items.xlsx');
  };

  return (
    <div className="out-of-stock-container">
      <h2>Out of Stock Items</h2>
      
      <div className="form-section">
        <h3>Add Out of Stock Item</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Item Name:</label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleInputChange}
              placeholder="Enter item name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Notes:</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes (optional)"
              rows="3"
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </div>

      <div className="search-section">
        <h3>Search Items</h3>
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label>Start Date:</label>
            <input
              type="date"
              name="startDate"
              value={searchParams.startDate}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="form-group">
            <label>End Date:</label>
            <input
              type="date"
              name="endDate"
              value={searchParams.endDate}
              onChange={handleSearchChange}
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Item added successfully!</div>}

      <div className="results-section">
        <div className="results-header">
          <h3>Out of Stock Items</h3>
          <button onClick={downloadExcel} className="download-btn">
            Download Excel
          </button>
        </div>
        
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
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>{format(new Date(item.date), 'MM/dd/yyyy')}</td>
                    <td>{item.itemName}</td>
                    <td>{item.notes || '-'}</td>
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