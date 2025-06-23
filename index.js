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
const TINYPESA_API_KEY = process.env.TINYPESA_API_KEY || process.env.VITE_TINYPESA_API_KEY || 'oOW7lXuHaLESTs1GUw1tQ1bN8peEN-wbxqdnqGmA5Rbiic1xnT';
const TINYPESA_USERNAME = process.env.TINYPESA_USERNAME || process.env.VITE_TINYPESA_USERNAME || 'shemkirimi3@gmail.com';

// Test mode flag - set to true for development testing
const TEST_MODE = process.env.NODE_ENV === 'development' || process.env.TEST_MODE === 'true';

// Create axios instance with proper headers for TinyPesa
const tinypesaClient = axios.create({
  timeout: 45000, // 45 second timeout
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; SokoniMbs/1.0)',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    // Add origin header to prevent CSRF issues
    'Origin': 'https://tinypesa.com',
    'Referer': 'https://tinypesa.com/',
    // Security headers
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin'
  },
  // Keep connections alive for better performance
  httpAgent: new (require('http').Agent)({ 
    keepAlive: true,
    keepAliveMsecs: 30000,
    maxSockets: 5,
    maxFreeSockets: 2
  }),
  httpsAgent: new (require('https').Agent)({ 
    keepAlive: true,
    keepAliveMsecs: 30000,
    maxSockets: 5,
    maxFreeSockets: 2,
    // SSL configuration for better compatibility
    secureProtocol: 'TLSv1_2_method',
    rejectUnauthorized: true,
    // Add cipher configuration
    ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384'
  })
});

// Enhanced retry mechanism with exponential backoff
async function makeApiCallWithRetry(requestData, maxRetries = 3, initialDelay = 2000) {
  let lastError;
  const startTime = Date.now();
  
  console.log(`🚀 Starting TinyPesa API call with ${maxRetries} max retries`);
  console.log('📋 Request Data:', JSON.stringify(requestData, null, 2));
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const attemptStartTime = Date.now();
    
    try {
      console.log(`\n🔄 Attempt ${attempt}/${maxRetries} - ${new Date().toISOString()}`);
      
      // Convert request data to URLSearchParams for form-encoded submission
      const formData = new URLSearchParams();
      Object.keys(requestData).forEach(key => {
        if (requestData[key] !== undefined && requestData[key] !== null) {
          formData.append(key, requestData[key].toString());
        }
      });
      
      console.log('📤 Form Data:', formData.toString());
      
      // Make the request with specific headers to avoid 403 CSRF error
      const response = await tinypesaClient({
        method: 'POST',
        url: TINYPESA_BASE_URL,
        data: formData,
        headers: {
          // TinyPesa specific headers
          'Apikey': TINYPESA_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
          // Override some default headers for this specific request
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          // Add CSRF token simulation (some APIs expect this)
          'X-CSRF-Token': 'fetch',
          // Ensure proper content length
          'Content-Length': formData.toString().length.toString()
        },
        // Validate status codes
        validateStatus: function (status) {
          return status < 500; // Don't throw for 4xx errors, only 5xx
        },
        // Add response interceptor for debugging
        transformResponse: [(data) => {
          console.log('🔍 Raw response data:', data);
          try {
            return JSON.parse(data);
          } catch (e) {
            console.log('⚠️ Response is not JSON, returning as string');
            return data;
          }
        }]
      });
      
      const attemptDuration = Date.now() - attemptStartTime;
      console.log(`✅ Attempt ${attempt} completed in ${attemptDuration}ms`);
      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Headers:', JSON.stringify(response.headers, null, 2));
      console.log('📥 Response Data:', JSON.stringify(response.data, null, 2));
      
      // Check if the response indicates success
      if (response.status === 200 || response.status === 201) {
        const totalDuration = Date.now() - startTime;
        console.log(`🎉 API call successful after ${attempt} attempts in ${totalDuration}ms`);
        return response;
      } else if (response.status === 403) {
        // Handle 403 specifically - this is likely a CSRF or authentication issue
        console.error('🚫 403 Forbidden - CSRF or authentication issue');
        throw new Error(`API Error 403: Cross-site POST form submissions are forbidden. Check API key and headers.`);
      } else if (response.status >= 400 && response.status < 500) {
        // Handle other 4xx errors (client errors) - don't retry these
        console.log('❌ Client error detected, not retrying');
        throw new Error(`API Error ${response.status}: ${response.data?.message || JSON.stringify(response.data) || 'Client error'}`);
      } else {
        // For other status codes, treat as retryable
        throw new Error(`HTTP ${response.status}: ${response.data?.message || JSON.stringify(response.data) || 'Server error'}`);
      }
      
    } catch (error) {
      lastError = error;
      const attemptDuration = Date.now() - attemptStartTime;
      
      console.error(`❌ Attempt ${attempt} failed after ${attemptDuration}ms:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // Log additional debugging info for specific errors
      if (error.response?.status === 403) {
        console.error('🔍 403 Error Details:', {
          url: TINYPESA_BASE_URL,
          apiKey: TINYPESA_API_KEY ? `${TINYPESA_API_KEY.substring(0, 10)}...` : 'NOT SET',
          headers: error.config?.headers,
          data: error.config?.data?.toString()
        });
      }
      
      // If this is the last attempt, don't wait
      if (attempt === maxRetries) {
        console.error(`💥 All ${maxRetries} attempts failed. Total time: ${Date.now() - startTime}ms`);
        break;
      }
      
      // Check if it's a retryable error (don't retry 403 or other 4xx errors)
      const isRetryableError = 
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNABORTED' ||
        error.code === 'EPIPE' ||
        error.code === 'EHOSTUNREACH' ||
        error.code === 'ENETUNREACH' ||
        error.message.includes('socket hang up') ||
        error.message.includes('timeout') ||
        error.message.includes('network') ||
        (error.response && error.response.status >= 500);
      
      if (!isRetryableError) {
        console.log('🚫 Non-retryable error detected, stopping retries');
        break;
      }
      
      // Calculate delay with exponential backoff and jitter
      const baseDelay = initialDelay * Math.pow(1.5, attempt - 1);
      const jitter = Math.random() * 1000; // Add up to 1 second of jitter
      const waitTime = Math.min(baseDelay + jitter, 30000); // Cap at 30 seconds
      
      console.log(`⏳ Waiting ${Math.round(waitTime)}ms before retry ${attempt + 1}...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // If we get here, all retries failed
  const totalDuration = Date.now() - startTime;
  console.error(`💀 All retries exhausted after ${totalDuration}ms. Last error:`, lastError.message);
  throw lastError;
}

// Test mode simulator for development
function simulateTestModeResponse(requestData) {
  console.log('🧪 TEST MODE: Simulating TinyPesa response');
  
  // Simulate different scenarios based on phone number
  const phone = requestData.msisdn;
  const lastDigit = phone.slice(-1);
  
  if (lastDigit === '1') {
    // Simulate failure
    return {
      status: 400,
      data: {
        ResponseCode: '1',
        ResponseDescription: 'Test failure - Invalid phone number',
        message: 'Test mode: Simulated failure'
      }
    };
  } else if (lastDigit === '2') {
    // Simulate timeout (will be handled by retry logic)
    throw new Error('ETIMEDOUT');
  } else {
    // Simulate success
    return {
      status: 200,
      data: {
        ResponseCode: '0',
        ResponseDescription: 'Success. Request accepted for processing',
        CheckoutRequestID: `TEST_${Date.now()}`,
        MerchantRequestID: requestData.account_no,
        CustomerMessage: 'TEST MODE: Please check your phone and enter your M-Pesa PIN'
      }
    };
  }
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

// Test endpoint for debugging TinyPesa connectivity
app.get('/test-tinypesa', async (req, res) => {
  try {
    console.log('🔍 Testing TinyPesa connectivity...');
    
    const testData = {
      msisdn: '254700000000',
      amount: 1,
      account_no: `TEST_${Date.now()}`,
      callback_url: `${req.protocol}://${req.get('host')}/callback`
    };
    
    if (TEST_MODE) {
      const mockResponse = simulateTestModeResponse(testData);
      return res.json({
        success: true,
        mode: 'TEST',
        response: mockResponse.data,
        message: 'Test mode simulation completed'
      });
    }
    
    const response = await makeApiCallWithRetry(testData, 2, 1000);
    
    res.json({
      success: true,
      mode: 'LIVE',
      status: response.status,
      data: response.data,
      message: 'TinyPesa connectivity test successful'
    });
    
  } catch (error) {
    console.error('TinyPesa test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      message: 'TinyPesa connectivity test failed'
    });
  }
});

app.post('/stk-push', async (req, res) => {
  try {
    const { amount, phone, recipientPhone, type, originalAmount, discount, points } = req.body;
    
    console.log('\n🎯 STK Push Request Received:', {
      amount,
      phone,
      recipientPhone,
      type,
      originalAmount,
      discount,
      points,
      testMode: TEST_MODE
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
      callback_url: `${req.protocol}://${req.get('host')}/callback`
    };

    console.log('📋 Final TinyPesa Request Data:', requestData);

    let response;
    
    if (TEST_MODE) {
      console.log('🧪 Using TEST MODE - No real transaction will be processed');
      response = simulateTestModeResponse(requestData);
    } else {
      // Make request to TinyPesa API with enhanced retry mechanism
      response = await makeApiCallWithRetry(requestData, 3, 2000);
    }

    // Log the transaction details for reference
    const transactionDetails = {
      payer: formattedPayerPhone,
      recipient: formattedRecipientPhone,
      amount: amount,
      timestamp: new Date().toISOString(),
      account_ref: accountRef,
      request_id: response.data?.CheckoutRequestID || response.data?.id,
      test_mode: TEST_MODE
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

    console.log('📊 Transaction Details:', transactionDetails);

    // Check TinyPesa response format and return success
    const responseData = response.data;
    
    if (responseData && (
      responseData.success === true || 
      responseData.ResponseCode === '0' ||
      responseData.status === 'success' ||
      response.status === 200
    )) {
      const successResponse = {
        ResponseCode: '0',
        ResponseDescription: TEST_MODE ? 'TEST MODE: Success. Request accepted for processing' : 'Success. Request accepted for processing',
        CheckoutRequestID: responseData.CheckoutRequestID || responseData.id || responseData.request_id,
        MerchantRequestID: responseData.MerchantRequestID || responseData.merchant_request_id || accountRef,
        CustomerMessage: TEST_MODE ? 'TEST MODE: Please check your phone and enter your M-Pesa PIN to complete the payment' : 'Please check your phone and enter your M-Pesa PIN to complete the payment',
        testMode: TEST_MODE
      };
      
      console.log('✅ Sending success response:', successResponse);
      res.json(successResponse);
    } else {
      // Handle TinyPesa error response
      console.error('❌ TinyPesa returned error:', responseData);
      res.status(400).json({
        ResponseCode: responseData?.ResponseCode || '1',
        ResponseDescription: responseData?.ResponseDescription || responseData?.message || 'Payment request failed',
        errorMessage: responseData?.error || responseData?.errorMessage || 'Unknown error occurred',
        testMode: TEST_MODE
      });
    }

  } catch (error) {
    console.error('💥 STK Push Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Determine error type and provide appropriate response
    let errorMessage = 'Payment request failed. Please try again.';
    let responseCode = '1';
    
    if (error.message.includes('Cross-site POST form submissions are forbidden')) {
      errorMessage = 'API authentication failed. Please contact support if this persists.';
      responseCode = '403';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Unable to connect to payment service. Please check your internet connection and try again.';
    } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
    } else if (error.message.includes('socket hang up') || error.code === 'ECONNRESET') {
      errorMessage = 'Connection interrupted. Please try again in a moment.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please contact support.';
      responseCode = '401';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access forbidden. Please verify your API credentials.';
      responseCode = '403';
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
      testMode: TEST_MODE,
      details: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        code: error.code,
        stack: error.stack
      } : undefined
    });
  }
});

// Callback endpoint for TinyPesa
app.post('/callback', (req, res) => {
  console.log('📞 TinyPesa Callback received:', JSON.stringify(req.body, null, 2));
  console.log('📞 Callback headers:', JSON.stringify(req.headers, null, 2));
  
  // Process the callback data here
  // You can update your database, send notifications, etc.
  
  res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Callback received successfully"
  });
});

// Health check endpoint with enhanced diagnostics
app.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    testMode: TEST_MODE,
    tinypesa: {
      endpoint: TINYPESA_BASE_URL,
      username: TINYPESA_USERNAME,
      apiKeyConfigured: !!TINYPESA_API_KEY,
      apiKeyLength: TINYPESA_API_KEY ? TINYPESA_API_KEY.length : 0
    },
    server: {
      port: PORT,
      nodeVersion: process.version,
      uptime: process.uptime()
    }
  };
  
  console.log('🏥 Health check requested:', healthData);
  res.json(healthData);
});

// Debug endpoint for environment variables
app.get('/debug/env', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Debug endpoint only available in development' });
  }
  
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    TEST_MODE: TEST_MODE,
    TINYPESA_USERNAME: TINYPESA_USERNAME,
    TINYPESA_API_KEY_SET: !!TINYPESA_API_KEY,
    TINYPESA_API_KEY_LENGTH: TINYPESA_API_KEY ? TINYPESA_API_KEY.length : 0,
    PORT: PORT
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🧪 Test Mode: ${TEST_MODE ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🌐 TinyPesa API: ${TINYPESA_BASE_URL}`);
  console.log(`👤 TinyPesa Username: ${TINYPESA_USERNAME}`);
  console.log(`🔑 API Key Configured: ${TINYPESA_API_KEY ? 'YES' : 'NO'}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /health - Health check with diagnostics`);
  console.log(`   GET  /test-tinypesa - Test TinyPesa connectivity`);
  console.log(`   POST /stk-push - STK Push payment`);
  console.log(`   POST /callback - TinyPesa callback handler`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`   GET  /debug/env - Environment debug info`);
  }
  console.log(`\n💡 Tips:`);
  console.log(`   - Visit /test-tinypesa to test API connectivity`);
  console.log(`   - Set TEST_MODE=true in .env for development testing`);
  console.log(`   - Check /health for system diagnostics`);
  console.log(`\n🔧 To fix 403 errors:`);
  console.log(`   - Ensure TINYPESA_API_KEY is correctly set in .env`);
  console.log(`   - Verify your TinyPesa account is active`);
  console.log(`   - Use TEST_MODE=true for development testing`);
});