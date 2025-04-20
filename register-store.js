import fetch from 'node-fetch';

async function registerStore(storeName, location, username, password) {
  try {
    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    console.log('Registering store with details:');
    console.log('Name:', storeName);
    console.log('Location:', location);
    console.log('Username:', username);
    
    const response = await fetch(`${baseUrl}/api/stores/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: storeName,
        location: location,
        username: username,
        password: password
      }),
    });

    const data = await response.json();
    console.log('Registration response:', data);
    
    if (response.ok) {
      console.log('\nStore registered successfully!');
      console.log('You can now login with:');
      console.log('Username:', username);
      console.log('Password:', password);
    } else {
      console.log('\nRegistration failed:', data.message);
    }
  } catch (error) {
    console.error('Error registering store:', error.message);
  }
}

// Register the QueenAnne store
registerStore(
  'QueenAnne',
  'Seattle, WA, USA',
  'QueenAnne',
  'QueenAnne243'
); 