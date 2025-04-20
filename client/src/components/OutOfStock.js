import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';

function OutOfStock() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    notes: ''
  });
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/out-of-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setFormData({
          itemName: '',
          quantity: '',
          notes: ''
        });
        setSuccess('Out-of-stock item recorded successfully!');
        fetchItems();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to record out-of-stock item');
      }
    } catch (error) {
      console.error('Error submitting out-of-stock item:', error);
      setError('Failed to connect to server: ' + error.message);
    }
  };

  const fetchItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(searchParams);
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/out-of-stock?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch out-of-stock items');
      }
      
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching out-of-stock items:', error);
      setError('Failed to fetch out-of-stock records');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const downloadExcel = () => {
    const excelData = items.map(record => ({
      'Date': new Date(record.date).toLocaleString(),
      'Item Name': record.itemName,
      'Quantity': record.quantity,
      'Notes': record.notes
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Out of Stock Records");
    XLSX.writeFile(wb, `out_of_stock_records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="App">
      <main>
        <section className="input-section">
          <h2>Record Out-of-Stock Item</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div>
              <label>Item Name:</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Quantity Needed:</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
            <div>
              <label>Notes:</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        </section>

        <section className="search-section">
          <h2>Search Out-of-Stock Items</h2>
          <div className="search-filters">
            <div>
              <label>Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={searchParams.startDate}
                onChange={handleSearchChange}
              />
            </div>
            <div>
              <label>End Date:</label>
              <input
                type="date"
                name="endDate"
                value={searchParams.endDate}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </section>

        <section className="results-section">
          <div className="results-header">
            <h2>Out-of-Stock Records</h2>
            <button onClick={downloadExcel} className="download-button">
              Download Excel
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleString()}</td>
                  <td>{record.itemName}</td>
                  <td>{record.quantity}</td>
                  <td>{record.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default OutOfStock; 