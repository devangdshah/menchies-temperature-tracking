import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { FiLogOut } from 'react-icons/fi';
import TipTracker from './components/Tips';
import './App.css';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <span className="store-name">
          Welcome to Menchie's Temperature Tracking
        </span>
      </div>
      <div className="nav-links">
        <Link 
          to="/temperatures" 
          className={location.pathname === '/temperatures' ? 'active' : ''}
        >
          Temperatures
        </Link>
        <Link 
          to="/tips" 
          className={location.pathname === '/tips' ? 'active' : ''}
        >
          Tips
        </Link>
      </div>
    </nav>
  );
}

function TemperatureTracker() {
  const [temperatures, setTemperatures] = useState([]);
  const [formData, setFormData] = useState({
    equipmentType: 'Ice Cream Machine',
    machineId: '',
    hopper: 'A',
    temperature: ''
  });
  const [searchParams, setSearchParams] = useState({
    equipmentType: '',
    machineId: '',
    hopper: '',
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
      console.log('API URL:', `${baseUrl}/api/temperatures`);
      
      const response = await fetch(`${baseUrl}/api/temperatures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to record temperature');
      }
      
      setFormData(prev => ({
        ...prev,
        machineId: '',
        temperature: '',
        hopper: 'A'
      }));
      setSuccess('Temperature recorded successfully!');
      fetchTemperatures();
    } catch (error) {
      console.error('Error submitting temperature:', error);
      setError('Failed to connect to server: ' + error.message);
    }
  };

  const fetchTemperatures = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(searchParams);
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log('API URL:', `${baseUrl}/api/temperatures?${queryParams}`);
      
      const response = await fetch(`${baseUrl}/api/temperatures?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch temperatures');
      }
      
      const data = await response.json();
      setTemperatures(data);
    } catch (error) {
      console.error('Error fetching temperatures:', error);
      setError('Failed to fetch temperature records: ' + error.message);
    }
  }, [searchParams]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      await fetchTemperatures();
    } catch (error) {
      setError('Failed to search temperature records: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemperatures();
  }, [fetchTemperatures]);

  const downloadExcel = () => {
    const excelData = temperatures.map(record => ({
      'Date': new Date(record.date).toLocaleString(),
      'Equipment Type': record.equipmentType,
      'Machine ID': record.machineId,
      'Hopper': record.hopper,
      'Temperature (°F)': record.temperature
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Temperature Records");
    XLSX.writeFile(wb, `temperature_records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <>
      <h1 className="dashboard-title">Temperature Tracking</h1>
      <div className="form-container">
        <h2 className="form-title">Add New Temperature Record</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Equipment Type</label>
            <select
              className="form-select"
              value={formData.equipmentType}
              onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
              required
            >
              <option value="">Select Equipment Type</option>
              <option value="Ice Cream Machine">Ice Cream Machine</option>
              <option value="Walking Refrigerator">Walking Refrigerator</option>
              <option value="Walking Freezer">Walking Freezer</option>
              <option value="Chill Bar">Chill Bar</option>
              <option value="Cake Display Freezer">Cake Display Freezer</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Machine ID</label>
            <input
              type="text"
              className="form-input"
              value={formData.machineId}
              onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
              required
            />
          </div>
          {formData.equipmentType === 'Ice Cream Machine' && (
            <div className="form-group">
              <label className="form-label">Hopper</label>
              <select
                className="form-select"
                value={formData.hopper}
                onChange={(e) => setFormData({ ...formData, hopper: e.target.value })}
                required
              >
                <option value="">Select Hopper</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Temperature (°F)</label>
            <input
              type="number"
              step="0.1"
              className="form-input"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>

      <div className="search-section">
        <h2 className="search-title">Search Records</h2>
        <div className="search-filters">
          <div className="form-group">
            <label className="form-label">Equipment Type</label>
            <select
              className="form-select"
              value={searchParams.equipmentType}
              onChange={(e) => setSearchParams({ ...searchParams, equipmentType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="Ice Cream Machine">Ice Cream Machine</option>
              <option value="Walking Refrigerator">Walking Refrigerator</option>
              <option value="Walking Freezer">Walking Freezer</option>
              <option value="Chill Bar">Chill Bar</option>
              <option value="Cake Display Freezer">Cake Display Freezer</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Machine ID</label>
            <input
              type="text"
              className="form-input"
              value={searchParams.machineId}
              onChange={(e) => setSearchParams({ ...searchParams, machineId: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date Range</label>
            <input
              type="date"
              className="form-input"
              value={searchParams.startDate}
              onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
            />
          </div>
        </div>
        <button onClick={handleSearch} className="submit-button">
          Search
        </button>
      </div>

      <div className="results-section">
        <h2 className="results-title">Temperature Records</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <table className="temperature-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Equipment Type</th>
                <th>Machine ID</th>
                <th>Hopper</th>
                <th>Temperature (°F)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {temperatures.map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.timestamp).toLocaleString()}</td>
                  <td>{record.equipmentType}</td>
                  <td>{record.machineId}</td>
                  <td>{record.hopper || '-'}</td>
                  <td>{record.temperature}</td>
                  <td>
                    <span className={`status-indicator ${
                      record.temperature < 0
                        ? 'status-error'
                        : record.temperature > 10
                        ? 'status-warning'
                        : 'status-normal'
                    }`}>
                      {record.temperature < 0
                        ? 'Too Cold'
                        : record.temperature > 10
                        ? 'Too Warm'
                        : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/temperatures" replace />} />
            <Route path="/temperatures" element={<TemperatureTracker />} />
            <Route path="/tips" element={<TipTracker />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
