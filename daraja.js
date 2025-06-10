// daraja.js
require('dotenv').config();
const axios = require('axios');

const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;
const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

async function getAccessToken() {
  try {
    const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { getAccessToken };
