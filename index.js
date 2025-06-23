// index.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;

// TinyPesa API configuration
const TINYPESA_BASE_URL = 'https://tinypesa.com/api/v1/express';
const TINYPESA_API_KEY = process.env.VITE_TINYPESA_API_KEY || 'oOW7lXuHaLESTs1GUw1tQ1bN8peEN-wbxqdnqGmA5Rbiic1xnT';
const TINYPESA_USERNAME = process.env.VITE_TINYPESA_USERNAME || 'shemkirimi3@gmail.com';

// Retry mechanism for API calls
async function makeApiCallWithRetry(requestData, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`TinyPesa API attempt ${attempt}/${maxRetries}`);
      
      const response = await axios.post(
        TINYPESA_BASE_URL,
        requestData,
        {
          headers: {
            'Apikey': TINYPESA_API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000
        }
      );
      
      console.log('TinyPesa Response:', response.data);
      return response;
      
    } catch (error) {
      console.error(`TinyPesa API attempt ${attempt} failed:`, error.message);
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Check if it's a retryable error
      const isRetryableError = 
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED' ||
        error.message.includes('socket hang up') ||
        error.message.includes('timeout') ||
        (error.response && error.response.status >= 500);
      
      if (!isRetryableError) {
        console.log('Non-retryable error, not retrying');
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/stk-push', async (req, res) => {
  try {
    const { amount, phone, recipientPhone, type, originalAmount, discount, points } = req.body;
    
    // Format phone number for TinyPesa API
    let formattedPayerPhone = phone;
    if (phone.startsWith('0')) {
      formattedPayerPhone = '254' + phone.slice(1);
    } else if (phone.startsWith('+254')) {
      formattedPayerPhone = phone.slice(1);
    }
    
    // Prepare request data for TinyPesa
    const requestData = {
      msisdn: formattedPayerPhone,
      amount: amount,
      account_no: 'SOKONIMBS' + Date.now(), // Unique account reference
      callback_url: 'https://your-callback-url.com/callback' // You can update this later
    };

    console.log('TinyPesa Request:', requestData);

    // Make request to TinyPesa API with retry mechanism
    const response = await makeApiCallWithRetry(requestData);

    // Log the transaction details for reference
    const transactionDetails = {
      payer: formattedPayerPhone,
      recipient: recipientPhone ? (recipientPhone.startsWith('0') ? '254' + recipientPhone.slice(1) : recipientPhone) : formattedPayerPhone,
      amount: amount,
      timestamp: new Date().toISOString(),
      account_ref: requestData.account_no
    };

    // Add specific details based on transaction type
    if (type === 'airtime') {
      transactionDetails.type = 'Discounted Airtime';
      transactionDetails.originalAmount = originalAmount;
      transactionDetails.discount = `${discount}%`;
      transactionDetails.savings = originalAmount - amount;
    } else if (type === 'bonga') {
      transactionDetails.type = 'Bonga Points Sale';
      transactionDetails.points = points;
    } else {
      transactionDetails.type = 'Data Bundle';
    }

    console.log('Transaction Details:', transactionDetails);

    // Check if TinyPesa response indicates success
    if (response.data && (response.data.success === true || response.data.ResponseCode === '0')) {
      res.json({
        ResponseCode: '0',
        ResponseDescription: 'Success. Request accepted for processing',
        CheckoutRequestID: response.data.CheckoutRequestID || response.data.id,
        MerchantRequestID: response.data.MerchantRequestID || response.data.merchant_request_id
      });
    } else {
      // Handle TinyPesa error response
      res.status(400).json({
        ResponseCode: '1',
        ResponseDescription: response.data?.message || 'Payment request failed',
        errorMessage: response.data?.error || 'Unknown error occurred'
      });
    }

  } catch (error) {
    console.error('TinyPesa API Error:', error.response?.data || error.message);
    
    // Return error response in format expected by frontend
    res.status(500).json({
      ResponseCode: '1',
      ResponseDescription: 'Failed',
      errorMessage: error.response?.data?.message || error.message || 'Payment request failed'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Using TinyPesa API with username: ${TINYPESA_USERNAME}`);
});