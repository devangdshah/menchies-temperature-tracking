const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Add OPTIONS handler
app.options('*', cors(corsOptions));

// Add headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB connection with retry
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

// Temperature Schema
const temperatureSchema = new mongoose.Schema({
  equipmentType: { 
    type: String, 
    enum: ['Ice Cream Machine', 'Walking Refrigerator', 'Walking Freezer', 'Chill Bar', 'Cake Display Freezer'],
    required: true 
  },
  machineId: { type: Number, required: true },
  hopper: { type: String, enum: ['A', 'B'], required: function() {
    return this.equipmentType === 'Ice Cream Machine';
  }},
  temperature: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const Temperature = mongoose.model('Temperature', temperatureSchema);

// Tips Schema
const tipSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  notes: { type: String }
});

const Tip = mongoose.model('Tip', tipSchema);

// Temperature routes
app.post('/api/temperatures', async (req, res) => {
  try {
    const { equipmentType, machineId, hopper, temperature } = req.body;
    const newTemperature = new Temperature({
      equipmentType,
      machineId,
      hopper,
      temperature
    });
    await newTemperature.save();
    res.status(201).json(newTemperature);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/temperatures', async (req, res) => {
  try {
    const { equipmentType, machineId, hopper, startDate, endDate } = req.query;
    let query = {};
    
    if (equipmentType) query.equipmentType = equipmentType;
    if (machineId) query.machineId = machineId;
    if (hopper) query.hopper = hopper;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const temperatures = await Temperature.find(query).sort({ date: -1 });
    res.json(temperatures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tips routes
app.post('/api/tips', async (req, res) => {
  try {
    const { amount, notes } = req.body;
    const newTip = new Tip({
      amount,
      notes
    });
    await newTip.save();
    res.status(201).json(newTip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/tips', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const tips = await Tip.find(query).sort({ date: -1 });
    res.json(tips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 