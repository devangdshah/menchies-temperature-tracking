import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import './Tips.css';

function TipTracker() {
  const [tips, setTips] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    notes: ''
  });
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
      const response = await fetch(`${baseUrl}/api/tips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setFormData({
          amount: '',
          notes: ''
        });
        setSuccess('Tip recorded successfully!');
        fetchTips();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to record tip');
      }
    } catch (error) {
      console.error('Error submitting tip:', error);
      setError('Failed to connect to server: ' + error.message);
    }
  };

  const fetchTips = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(searchParams);
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/tips?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tips');
      }
      
      const data = await response.json();
      // Sort tips by date in descending order
      const sortedTips = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTips(sortedTips);
    } catch (error) {
      console.error('Error fetching tips:', error);
      setError('Failed to fetch tip records');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      await fetchTips();
    } catch (error) {
      setError('Failed to search tip records: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    const excelData = tips.map(record => ({
      'Date': new Date(record.date).toLocaleString(),
      'Amount': `$${record.amount.toFixed(2)}`,
      'Notes': record.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tips Records");
    XLSX.writeFile(wb, `tips_records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Tips Tracking</h1>
      
      {/* Add New Tip Form */}
      <div className="form-container">
        <h2 className="form-title">Add New Tip Record</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount ($):</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              placeholder="Enter tip amount"
            />
          </div>
          <div className="form-group">
            <label>Notes:</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Optional notes about the tip"
              rows="3"
            />
          </div>
          <button type="submit" className="submit-button">
            Submit Tip
          </button>
        </form>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Search Section */}
      <div className="search-section">
        <h2 className="search-title">Search Records</h2>
        <div className="search-filters">
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
        </div>
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
        <button onClick={downloadExcel} className="download-button">
          Download Excel
        </button>
      </div>

      {/* Results Section */}
      <div className="results-section">
        <h2 className="results-title">Tip Records</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <table className="tips-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {tips.map((tip) => (
                <tr key={tip._id}>
                  <td>{new Date(tip.date).toLocaleString()}</td>
                  <td>${tip.amount.toFixed(2)}</td>
                  <td>{tip.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TipTracker; 