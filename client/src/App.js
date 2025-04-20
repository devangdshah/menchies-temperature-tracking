import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
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
    try {
      const response = await fetch('/api/temperatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit temperature');
      }

      setFormData({
        equipmentType: 'Ice Cream Machine',
        machineId: '',
        hopper: 'A',
        temperature: ''
      });
      setSuccess('Temperature recorded successfully!');
      fetchTemperatures();
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchTemperatures = async () => {
    try {
      const queryParams = new URLSearchParams(searchParams);
      const response = await fetch(`/api/temperatures?${queryParams}`);
      const data = await response.json();
      setTemperatures(data);
    } catch (error) {
      setError('Failed to fetch temperatures');
    }
  };

  useEffect(() => {
    fetchTemperatures();
  }, [searchParams]);

  return (
    <div className="App">
      <header>
        <h1>Temperature Tracking</h1>
      </header>

      <main>
        <section className="form-section">
          <h2>Add New Temperature Record</h2>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Equipment Type</label>
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

            <div className="form-group">
              <label>Machine ID</label>
              <input
                type="text"
                name="machineId"
                value={formData.machineId}
                onChange={handleInputChange}
                required
              />
            </div>

            {formData.equipmentType === 'Ice Cream Machine' && (
              <div className="form-group">
                <label>Hopper</label>
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

            <div className="form-group">
              <label>Temperature (°F)</label>
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
          <h2>Search Records</h2>
          <div className="search-filters">
            <div className="form-group">
              <label>Equipment Type</label>
              <select
                name="equipmentType"
                value={searchParams.equipmentType}
                onChange={handleSearchChange}
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
              <label>Machine ID</label>
              <input
                type="text"
                name="machineId"
                value={searchParams.machineId}
                onChange={handleSearchChange}
              />
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={searchParams.startDate}
                onChange={handleSearchChange}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
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
          <h2>Temperature Records</h2>
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
                  <td>{new Date(record.timestamp).toLocaleString()}</td>
                  <td>{record.equipmentType}</td>
                  <td>{record.machineId}</td>
                  <td>{record.hopper || '-'}</td>
                  <td>{record.temperature}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default App;
