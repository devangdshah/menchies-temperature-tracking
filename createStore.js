const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Store Schema
const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Store = mongoose.model('Store', storeSchema);

async function createStore() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a new store
    const hashedPassword = await bcrypt.hash('your-secure-password', 10);
    const store = new Store({
      name: 'Menchies Store',
      location: 'Main Store',
      username: 'admin',
      password: hashedPassword
    });

    await store.save();
    console.log('Store created successfully:', {
      name: store.name,
      location: store.location,
      username: store.username
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating store:', error);
    process.exit(1);
  }
}

createStore(); 