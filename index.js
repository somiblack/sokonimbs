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
const TINYPESA_BASE_URL = 'https://tinypesa.com/api/v1/express/stk/push';
const TINYPESA_API_KEY = process.env.VITE_TINYPESA_API_KEY || 'oOW7lXuHaLESTs1GUw1tQ1bN8peEN-wbxqdnqGmA5Rbiic1xnT';
const TINYPESA_USERNAME = process.env.VITE_TINYPESA_USERNAME || 'shemkirimi3@gmail.com';

// Enhanced retry mechanism for API calls
async function makeApiCallWithRetry(requestData, maxRetries = 3, initialDelay = 2000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`TinyPesa API attempt ${attempt}/${maxRetries}`);
      console.log('Request URL:', TINYPESA_BASE_URL);
      console.log('Request Data:', JSON.stringify(requestData, null, 2));
      
      const response = await axios({
        method: 'POST',
        url: TINYPESA_BASE_URL,
        data: requestData,
        headers: {
          'Apikey': TINYPESA_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'SokoniMbs/1.0'
        },
        timeout: 45000, // Increased timeout to 45 seconds
        validateStatus: function (status) {
          return status < 500; // Don't throw for 4xx errors, only 5xx
        }
      });
      
      console.log('TinyPesa Response Status:', response.status);
      console.log('TinyPesa Response Data:', JSON.stringify(response.data, null, 2));
      
      // Check if the response indicates success
      if (response.status === 200 || response.status === 201) {
        return response;
      } else {
        // Handle 4xx errors (client errors) - don't retry these
        if (response.status >= 400 && response.status < 500) {
          console.log('Client error, not retrying');
          throw new Error(`API Error ${response.status}: ${response.data?.message || 'Client error'}`);
        }
        
        // For other status codes, treat as retryable
        throw new Error(`HTTP ${response.status}: ${response.data?.message || 'Server error'}`);
      }
      
    } catch (error) {
      lastError = error;
      console.error(`TinyPesa API attempt ${attempt} failed:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // If this is the last attempt, don't wait
      if (attempt === maxRetries) {
        break;
      }
      
      // Check if it's a retryable error
      const isRetryableError = 
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNABORTED' ||
        error.message.includes('socket hang up') ||
        error.message.includes('timeout') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ECONNRESET') ||
        (error.response && error.response.status >= 500);
      
      if (!isRetryableError) {
        console.log('Non-retryable error, stopping retries');
        break;
      }
      
      // Calculate delay with exponential backoff and jitter
      const baseDelay = initialDelay * Math.pow(1.5, attempt - 1);
      const jitter = Math.random() * 1000; // Add up to 1 second of jitter
      const waitTime = Math.min(baseDelay + jitter, 30000); // Cap at 30 seconds
      
      console.log(`Waiting ${Math.round(waitTime)}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}

// Validate phone number format
function validateAndFormatPhone(phone) {
  if (!phone) return null;
  
  // Remove any spaces, dashes, or other non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('+254')) {
    return cleaned.slice(1);
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('7') && cleaned.length === 9) {
    return '254' + cleaned;
  }
  
  return null;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/stk-push', async (req, res) => {
  try {
    const { amount, phone, recipientPhone, type, originalAmount, discount, points } = req.body;
    
    console.log('Received STK Push request:', {
      amount,
      phone,
      recipientPhone,
      type,
      originalAmount,
      discount,
      points
    });
    
    // Validate and format phone numbers
    const formattedPayerPhone = validateAndFormatPhone(phone);
    if (!formattedPayerPhone) {
      return res.status(400).json({
        ResponseCode: '1',
        ResponseDescription: 'Invalid phone number format',
        errorMessage: 'Please provide a valid Kenyan phone number'
      });
    }
    
    let formattedRecipientPhone = formattedPayerPhone;
    if (recipientPhone) {
      formattedRecipientPhone = validateAndFormatPhone(recipientPhone);
      if (!formattedRecipientPhone) {
        return res.status(400).json({
          ResponseCode: '1',
          ResponseDescription: 'Invalid recipient phone number format',
          errorMessage: 'Please provide a valid Kenyan phone number for recipient'
        });
      }
    }
    
    // Validate amount
    if (!amount || amount < 1) {
      return res.status(400).json({
        ResponseCode: '1',
        ResponseDescription: 'Invalid amount',
        errorMessage: 'Amount must be greater than 0'
      });
    }
    
    // Generate unique account reference
    const accountRef = `SOKONIMBS_${type?.toUpperCase() || 'BUNDLE'}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Prepare request data for TinyPesa STK Push
    const requestData = {
      msisdn: formattedPayerPhone,
      amount: parseInt(amount),
      account_no: accountRef,
      callback_url: `${req.protocol}://${req.get('host')}/callback` // Dynamic callback URL
    };

    console.log('TinyPesa STK Push Request:', requestData);

    // Make request to TinyPesa API with enhanced retry mechanism
    const response = await makeApiCallWithRetry(requestData, 3, 2000);

    // Log the transaction details for reference
    const transactionDetails = {
      payer: formattedPayerPhone,
      recipient: formattedRecipientPhone,
      amount: amount,
      timestamp: new Date().toISOString(),
      account_ref: accountRef,
      request_id: response.data?.CheckoutRequestID || response.data?.id
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
      transactionDetails.type = `${type || 'data'} Bundle`;
    }

    console.log('Transaction Details:', transactionDetails);

    // Check TinyPesa response format and return success
    const responseData = response.data;
    
    if (responseData && (
      responseData.success === true || 
      responseData.ResponseCode === '0' ||
      responseData.status === 'success' ||
      response.status === 200
    )) {
      res.json({
        ResponseCode: '0',
        ResponseDescription: 'Success. Request accepted for processing',
        CheckoutRequestID: responseData.CheckoutRequestID || responseData.id || responseData.request_id,
        MerchantRequestID: responseData.MerchantRequestID || responseData.merchant_request_id || accountRef,
        CustomerMessage: 'Please check your phone and enter your M-Pesa PIN to complete the payment'
      });
    } else {
      // Handle TinyPesa error response
      console.error('TinyPesa returned error:', responseData);
      res.status(400).json({
        ResponseCode: responseData?.ResponseCode || '1',
        ResponseDescription: responseData?.ResponseDescription || responseData?.message || 'Payment request failed',
        errorMessage: responseData?.error || responseData?.errorMessage || 'Unknown error occurred'
      });
    }

  } catch (error) {
    console.error('STK Push Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack
    });
    
    // Determine error type and provide appropriate response
    let errorMessage = 'Payment request failed. Please try again.';
    let responseCode = '1';
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Unable to connect to payment service. Please check your internet connection and try again.';
    } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
    } else if (error.message.includes('socket hang up')) {
      errorMessage = 'Connection interrupted. Please try again.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please contact support.';
      responseCode = '401';
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.message || 'Invalid request. Please check your details.';
      responseCode = '400';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    res.status(500).json({
      ResponseCode: responseCode,
      ResponseDescription: 'Failed',
      errorMessage: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Callback endpoint for TinyPesa
app.post('/callback', (req, res) => {
  console.log('TinyPesa Callback received:', JSON.stringify(req.body, null, 2));
  
  // Process the callback data here
  // You can update your database, send notifications, etc.
  
  res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Callback received successfully"
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    tinypesa_endpoint: TINYPESA_BASE_URL
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Using TinyPesa API: ${TINYPESA_BASE_URL}`);
  console.log(`TinyPesa Username: ${TINYPESA_USERNAME}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});