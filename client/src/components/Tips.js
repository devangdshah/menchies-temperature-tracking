import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';

function Tips() {
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
      setTips(data);
    } catch (error) {
      console.error('Error fetching tips:', error);
      setError('Failed to fetch tip records');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  const downloadExcel = () => {
    const excelData = tips.map(record => ({
      'Date': new Date(record.date).toLocaleString(),
      'Amount': record.amount,
      'Notes': record.notes
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tips Records");
    XLSX.writeFile(wb, `tips_records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="tips-section">
      <h2>Cash Tips Tracking</h2>
      
      <section className="input-section">
        <h3>Record New Tip</h3>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Amount ($):</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
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
        <h3>Search Tips</h3>
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
          <h3>Tips Records</h3>
          <button onClick={downloadExcel} className="download-button">
            Download Excel
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount ($)</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {tips.map((record) => (
              <tr key={record._id}>
                <td>{new Date(record.date).toLocaleString()}</td>
                <td>${record.amount.toFixed(2)}</td>
                <td>{record.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Tips; 