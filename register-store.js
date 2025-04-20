import fetch from 'node-fetch';

async function registerStore(storeName, location, username, password) {
  try {
    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    console.log('\nRegistering new store with details:');
    console.log('Store Name:', storeName);
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
    console.log('\nRegistration response:', data);
    
    if (response.ok) {
      console.log('\nStore registered successfully!');
      console.log('\nYou can now login with:');
      console.log('Username:', username);
      console.log('Password:', password);
      console.log('\nPlease save these credentials securely.');
    } else {
      console.log('\nRegistration failed:', data.message);
      if (data.message === 'Username already exists') {
        console.log('Please try a different username.');
      }
    }
  } catch (error) {
    console.error('\nError registering store:', error.message);
    console.log('Please make sure the server is running and try again.');
  }
}

// Register North Pointe store
registerStore(
  'North Pointe',
  'Lynnwood, WA, USA',
  'northpointe',
  'northpointe432'
); 