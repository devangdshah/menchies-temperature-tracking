import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';

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
    <div className="dashboard-container">
      <h1 className="dashboard-title">Tips Tracking</h1>
      <div className="form-container">
        <h2 className="form-title">Tips Management</h2>
        <p>Tips tracking functionality coming soon...</p>
      </div>
    </div>
  );
}

export default TipTracker; 