import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Login from './components/Login';
import Tips from './components/Tips';
import './App.css';

function Dashboard({ store, onLogout }) {
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
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>{store.name} - Temperature & Tips Tracker</h1>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
      </header>
      
      <main>
        <section className="input-section">
          <h2>Record New Temperature</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div>
              <label>Equipment Type:</label>
              <select
                name="equipmentType"
                value={formData.equipmentType}
                onChange={handleInputChange}
                required
              >
                <option value="Ice Cream Machine">Ice Cream Machine</option>
                <option value="Walking Refrigerator">Walking Refrigerator</option>
                <option value="Walking Freezer">Walking Freezer</option>
                <option value="Chill Bar">Chill Bar</option>
                <option value="Cake Display Freezer">Cake Display Freezer</option>
              </select>
            </div>
            <div>
              <label>Machine ID:</label>
              <input
                type="number"
                name="machineId"
                value={formData.machineId}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
            {formData.equipmentType === 'Ice Cream Machine' && (
              <div>
                <label>Hopper:</label>
                <select
                  name="hopper"
                  value={formData.hopper}
                  onChange={handleInputChange}
                  required
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
            )}
            <div>
              <label>Temperature (°F):</label>
              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                step="0.1"
                required
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        </section>

        <section className="search-section">
          <h2>Search Temperatures</h2>
          <div className="search-filters">
            <div>
              <label>Equipment Type:</label>
              <select
                name="equipmentType"
                value={searchParams.equipmentType}
                onChange={handleSearchChange}
              >
                <option value="">All</option>
                <option value="Ice Cream Machine">Ice Cream Machine</option>
                <option value="Walking Refrigerator">Walking Refrigerator</option>
                <option value="Walking Freezer">Walking Freezer</option>
                <option value="Chill Bar">Chill Bar</option>
                <option value="Cake Display Freezer">Cake Display Freezer</option>
              </select>
            </div>
            <div>
              <label>Machine ID:</label>
              <input
                type="number"
                name="machineId"
                value={searchParams.machineId}
                onChange={handleSearchChange}
                min="1"
              />
            </div>
            {searchParams.equipmentType === 'Ice Cream Machine' && (
              <div>
                <label>Hopper:</label>
                <select
                  name="hopper"
                  value={searchParams.hopper}
                  onChange={handleSearchChange}
                >
                  <option value="">All</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
            )}
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
            <h2>Temperature Records</h2>
            <button onClick={downloadExcel} className="download-button">
              Download Excel
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Equipment Type</th>
                <th>Machine ID</th>
                <th>Hopper</th>
                <th>Temperature (°F)</th>
              </tr>
            </thead>
            <tbody>
              {temperatures.map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleString()}</td>
                  <td>{record.equipmentType}</td>
                  <td>{record.machineId}</td>
                  <td>{record.hopper || '-'}</td>
                  <td>{record.temperature}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <Tips />
      </main>
    </div>
  );
}

function App() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    const storedStore = localStorage.getItem('store');
    if (storedStore) {
      setStore(JSON.parse(storedStore));
    }
  }, []);

  const handleLogin = (storeData) => {
    setStore(storeData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('store');
    setStore(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            store ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            store ? (
              <Dashboard store={store} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
