const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/temperature-tracking', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Temperature Schema
const temperatureSchema = new mongoose.Schema({
  equipmentType: { type: String, required: true },
  machineId: { type: String, required: true },
  hopper: { type: String },
  temperature: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Temperature = mongoose.model('Temperature', temperatureSchema);

// Routes
app.get('/api/temperatures', async (req, res) => {
  try {
    const { equipmentType, machineId, hopper, startDate, endDate } = req.query;
    let query = {};

    if (equipmentType) query.equipmentType = equipmentType;
    if (machineId) query.machineId = machineId;
    if (hopper) query.hopper = hopper;
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const temperatures = await Temperature.find(query).sort({ timestamp: -1 });
    res.json(temperatures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/temperatures', async (req, res) => {
  try {
    const temperature = new Temperature(req.body);
    await temperature.save();
    res.status(201).json(temperature);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 