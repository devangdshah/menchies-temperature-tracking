import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';

async function registerStore() {
  try {
    console.log('Attempting to register store at:', `${API_URL}/api/stores/register`);
    const response = await fetch(`${API_URL}/api/stores/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Northpointe',
        location: 'Northpointe',
        username: 'northpointe',
        password: 'northpointe432'
      })
    });

    const data = await response.json();
    console.log('Registration response:', data);

    if (response.ok) {
      console.log('Store registered successfully! You can now log in with:');
      console.log('Username: northpointe');
      console.log('Password: northpointe432');
    } else {
      console.log('Registration failed:', data.message);
    }
  } catch (error) {
    console.error('Error registering store:', error);
  }
}

registerStore(); 