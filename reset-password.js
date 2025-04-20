import fetch from 'node-fetch';

async function resetPassword(username, newPassword) {
  try {
    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    console.log('Resetting password for:', username);
    
    const response = await fetch(`${baseUrl}/api/stores/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        newPassword: newPassword
      }),
    });

    const data = await response.json();
    console.log('Reset password response:', data);
    
    if (response.ok) {
      console.log('\nPassword reset successfully!');
      console.log('You can now login with:');
      console.log('Username:', username);
      console.log('Password:', newPassword);
    } else {
      console.log('\nPassword reset failed:', data.message);
    }
  } catch (error) {
    console.error('Error resetting password:', error.message);
  }
}

// Reset password for QueenAnne account
resetPassword('QueenAnne', 'QueenAnne243'); 