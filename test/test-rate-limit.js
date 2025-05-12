const axios = require('axios');

const API_URL = 'http://localhost:3000'; 
const API_KEY = 'API_KEY'; 

async function makeRequest(index) {
  try {
    const response = await axios.get(`${API_URL}/chat/sessions`, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    console.log(`Request ${index + 1}: Success (${response.status})`);
  } catch (error) {
    console.log(`Request ${index + 1}: ${error.response?.status === 429 ? 'Rate Limited' : 'Error'} - ${error.response?.data?.message || error.message}`);
  }
}

async function testRateLimit() {
  console.log('Starting rate limit test...');
  console.log('Making 15 requests in quick succession...\n');

  const requests = Array.from({ length: 15 }, (_, i) => makeRequest(i));
  await Promise.all(requests);

  console.log('\nTest completed!');
  console.log('Expected behavior:');
  console.log('- First 10 requests should succeed');
  console.log('- Remaining requests should be rate limited (429 status code)');
}

testRateLimit(); 