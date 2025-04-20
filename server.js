const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://menchies-temperature-tracking.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Add OPTIONS handler
app.options('*', cors(corsOptions));

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

// Store Schema
const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Store = mongoose.model('Store', storeSchema);

// Temperature Schema
const temperatureSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
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
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  notes: { type: String }
});

const Tip = mongoose.model('Tip', tipSchema);

// Out of Stock Schema
const outOfStockSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  date: { type: Date, default: Date.now },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  notes: { type: String }
});

const OutOfStock = mongoose.model('OutOfStock', outOfStockSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, store) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.store = store;
    next();
  });
};

// Routes
// Store registration
app.post('/api/stores/register', async (req, res) => {
  try {
    const { name, location, username, password } = req.body;
    
    // Check if username exists
    const existingStore = await Store.findOne({ username });
    if (existingStore) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const store = new Store({
      name,
      location,
      username,
      password: hashedPassword
    });

    await store.save();
    res.status(201).json({ message: 'Store registered successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Store login
app.post('/api/stores/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find store
    const store = await Store.findOne({ username });
    if (!store) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, store.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: store._id, name: store.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, store: { id: store._id, name: store.name, location: store.location } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Temperature routes
app.post('/api/temperatures', authenticateToken, async (req, res) => {
  try {
    const { equipmentType, machineId, hopper, temperature } = req.body;
    const newTemperature = new Temperature({
      storeId: req.store.id,
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

app.get('/api/temperatures', authenticateToken, async (req, res) => {
  try {
    const { equipmentType, machineId, hopper, startDate, endDate } = req.query;
    let query = { storeId: req.store.id };
    
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
app.post('/api/tips', authenticateToken, async (req, res) => {
  try {
    const { amount, notes } = req.body;
    const newTip = new Tip({
      storeId: req.store.id,
      amount,
      notes
    });
    await newTip.save();
    res.status(201).json(newTip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/tips', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { storeId: req.store.id };
    
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

// Out of Stock routes
app.post('/api/out-of-stock', authenticateToken, async (req, res) => {
  try {
    const { itemName, quantity, notes } = req.body;
    const newItem = new OutOfStock({
      storeId: req.store.id,
      itemName,
      quantity,
      notes
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/out-of-stock', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { storeId: req.store.id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const items = await OutOfStock.find(query).sort({ date: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 