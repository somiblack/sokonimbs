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
const TINYPESA_API_KEY = process.env.TINYPESA_API_KEY;
const TINYPESA_USERNAME = process.env.TINYPESA_USERNAME;

// Test mode flag - set to true for development testing
const TEST_MODE = process.env.NODE_ENV === 'development' || process.env.TEST_MODE === 'true';

// Validate required environment variables
if (!TINYPESA_API_KEY || !TINYPESA_USERNAME) {
  console.error('❌ Missing required environment variables:');
  console.error('   TINYPESA_API_KEY:', TINYPESA_API_KEY ? 'SET' : 'MISSING');
  console.error('   TINYPESA_USERNAME:', TINYPESA_USERNAME ? 'SET' : 'MISSING');
  console.error('Please check your .env file');
}

// Create axios instance with proper configuration for TinyPesa
const tinypesaClient = axios.create({
  timeout: 60000, // 60 second timeout
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json, text/html, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site'
  }
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
      
      // TinyPesa expects specific authentication format
      const authHeaders = {
        'Apikey': TINYPESA_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
      };
      
      // Convert request data to URLSearchParams for proper form encoding
      const formData = new URLSearchParams();
      Object.keys(requestData).forEach(key => {
        if (requestData[key] !== undefined && requestData[key] !== null) {
          formData.append(key, requestData[key].toString());
        }
      });
      
      console.log('📤 Form Data:', formData.toString());
      console.log('📤 Headers:', JSON.stringify(authHeaders, null, 2));
      
      // Make the request with proper authentication
      const response = await tinypesaClient({
        method: 'POST',
        url: TINYPESA_BASE_URL,
        data: formData,
        headers: authHeaders,
        // Don't throw for HTTP error status codes, handle them manually
        validateStatus: function (status) {
          return status < 500; // Only throw for 5xx server errors
        },
        // Transform response to handle both JSON and HTML responses
        transformResponse: [(data) => {
          console.log('🔍 Raw response data (first 500 chars):', data.substring(0, 500));
          
          // Check if response is HTML (indicates error page)
          if (data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html')) {
            console.log('⚠️ Received HTML response instead of JSON - likely an error page');
            return {
              error: 'HTML_RESPONSE',
              message: 'Received HTML error page instead of JSON response',
              html: data
            };
          }
          
          try {
            return JSON.parse(data);
          } catch (e) {
            console.log('⚠️ Response is not valid JSON, returning as string');
            return { raw: data, error: 'INVALID_JSON' };
          }
        }]
      });
      
      const attemptDuration = Date.now() - attemptStartTime;
      console.log(`✅ Attempt ${attempt} completed in ${attemptDuration}ms`);
      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Headers:', JSON.stringify(response.headers, null, 2));
      console.log('📥 Response Data:', JSON.stringify(response.data, null, 2));
      
      // Handle different response scenarios
      if (response.data?.error === 'HTML_RESPONSE') {
        // Extract error info from HTML if possible
        const htmlContent = response.data.html;
        let errorMessage = 'Received HTML error page';
        
        if (htmlContent.includes('403')) {
          errorMessage = 'Access forbidden - check API key and authentication';
        } else if (htmlContent.includes('404')) {
          errorMessage = 'Endpoint not found - check API URL';
        } else if (htmlContent.includes('CSRF')) {
          errorMessage = 'CSRF protection triggered - check headers';
        }
        
        throw new Error(`TinyPesa API Error: ${errorMessage}`);
      }
      
      // Check for successful response
      if (response.status === 200 || response.status === 201) {
        const responseData = response.data;
        
        // TinyPesa success indicators
        if (responseData && (
          responseData.success === true || 
          responseData.ResponseCode === '0' ||
          responseData.status === 'success' ||
          responseData.CheckoutRequestID
        )) {
          const totalDuration = Date.now() - startTime;
          console.log(`🎉 API call successful after ${attempt} attempts in ${totalDuration}ms`);
          return response;
        } else {
          // API returned 200 but with error content
          throw new Error(`TinyPesa API Error: ${responseData?.message || responseData?.ResponseDescription || 'Unknown error in response'}`);
        }
      } else if (response.status === 403) {
        throw new Error(`TinyPesa API Error: Access forbidden (403). Check your API key and ensure your account is active.`);
      } else if (response.status === 404) {
        throw new Error(`TinyPesa API Error: Endpoint not found (404). Check the API URL: ${TINYPESA_BASE_URL}`);
      } else if (response.status === 401) {
        throw new Error(`TinyPesa API Error: Unauthorized (401). Check your API key and username.`);
      } else {
        throw new Error(`TinyPesa API Error: HTTP ${response.status} - ${response.data?.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      lastError = error;
      const attemptDuration = Date.now() - attemptStartTime;
      
      console.error(`❌ Attempt ${attempt} failed after ${attemptDuration}ms:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      });
      
      // If this is the last attempt, don't wait
      if (attempt === maxRetries) {
        console.error(`💥 All ${maxRetries} attempts failed. Total time: ${Date.now() - startTime}ms`);
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
        (error.response && error.response.status >= 500);
      
      // Don't retry 4xx errors (client errors)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        console.log('🚫 Client error detected (4xx), not retrying');
        break;
      }
      
      if (!isRetryableError) {
        console.log('🚫 Non-retryable error detected, stopping retries');
        break;
      }
      
      // Calculate delay with exponential backoff
      const baseDelay = initialDelay * Math.pow(1.5, attempt - 1);
      const jitter = Math.random() * 1000;
      const waitTime = Math.min(baseDelay + jitter, 30000);
      
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
    console.log('🔧 Configuration:', {
      url: TINYPESA_BASE_URL,
      username: TINYPESA_USERNAME,
      apiKeySet: !!TINYPESA_API_KEY,
      testMode: TEST_MODE
    });
    
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
      message: 'TinyPesa connectivity test failed',
      suggestions: [
        'Check your TINYPESA_API_KEY in .env file',
        'Verify your TinyPesa account is active',
        'Ensure you have sufficient balance',
        'Try using ngrok for callback URL in production testing',
        'Set TEST_MODE=true for development testing'
      ]
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
    
    // Validate required environment variables
    if (!TINYPESA_API_KEY || !TINYPESA_USERNAME) {
      return res.status(500).json({
        ResponseCode: '1',
        ResponseDescription: 'Server configuration error',
        errorMessage: 'TinyPesa credentials not configured. Please contact support.'
      });
    }
    
    // Validate and format phone numbers
    const formattedPayerPhone = validateAndFormatPhone(phone);
    if (!formattedPayerPhone) {
      return res.status(400).json({
        ResponseCode: '1',
        ResponseDescription: 'Invalid phone number format',
        errorMessage: 'Please provide a valid Kenyan phone number (e.g., 0704166953 or +254704166953)'
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
    
    // Determine callback URL - use ngrok or external URL in production
    let callbackUrl = `${req.protocol}://${req.get('host')}/callback`;
    
    // If running on localhost, suggest using ngrok
    if (req.get('host').includes('localhost') || req.get('host').includes('127.0.0.1')) {
      console.log('⚠️ WARNING: Using localhost callback URL. For production testing, use ngrok:');
      console.log('   1. Install ngrok: npm install -g ngrok');
      console.log('   2. Run: ngrok http 3000');
      console.log('   3. Use the https URL provided by ngrok');
      
      // For localhost testing, we'll still use the localhost URL but log the warning
      callbackUrl = `http://localhost:${PORT}/callback`;
    }
    
    // Prepare request data for TinyPesa STK Push
    const requestData = {
      msisdn: formattedPayerPhone,
      amount: parseInt(amount),
      account_no: accountRef,
      callback_url: callbackUrl
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
      callback_url: callbackUrl,
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
        testMode: TEST_MODE,
        callbackUrl: callbackUrl
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
    let suggestions = [];
    
    if (error.message.includes('Access forbidden (403)')) {
      errorMessage = 'API access denied. Please check your API credentials.';
      responseCode = '403';
      suggestions = [
        'Verify your TINYPESA_API_KEY is correct',
        'Ensure your TinyPesa account is active',
        'Check if your account has sufficient balance',
        'Contact TinyPesa support if the issue persists'
      ];
    } else if (error.message.includes('Endpoint not found (404)')) {
      errorMessage = 'API endpoint not found. Please check the API URL.';
      responseCode = '404';
      suggestions = [
        'Verify the TinyPesa API URL is correct',
        'Check if the API version has changed',
        'Ensure you are using the correct endpoint'
      ];
    } else if (error.message.includes('Unauthorized (401)')) {
      errorMessage = 'Authentication failed. Please check your credentials.';
      responseCode = '401';
      suggestions = [
        'Verify your TINYPESA_API_KEY and TINYPESA_USERNAME',
        'Check if your API key has expired',
        'Ensure your account is active'
      ];
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Unable to connect to payment service. Please check your internet connection.';
      suggestions = [
        'Check your internet connection',
        'Verify the TinyPesa API is accessible',
        'Try again in a few moments'
      ];
    } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
      suggestions = [
        'Try the request again',
        'Check your internet connection speed',
        'Contact support if timeouts persist'
      ];
    } else if (error.message.includes('HTML error page')) {
      errorMessage = 'API returned an error page instead of JSON response.';
      suggestions = [
        'Check your API credentials',
        'Verify the API endpoint URL',
        'Enable TEST_MODE for development testing'
      ];
    }
    
    res.status(500).json({
      ResponseCode: responseCode,
      ResponseDescription: 'Failed',
      errorMessage: errorMessage,
      testMode: TEST_MODE,
      suggestions: suggestions,
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
  console.log('📞 Callback timestamp:', new Date().toISOString());
  
  // Process the callback data here
  const callbackData = req.body;
  
  // Log transaction status
  if (callbackData.Body && callbackData.Body.stkCallback) {
    const stkCallback = callbackData.Body.stkCallback;
    console.log('📊 STK Callback Details:', {
      merchantRequestID: stkCallback.MerchantRequestID,
      checkoutRequestID: stkCallback.CheckoutRequestID,
      resultCode: stkCallback.ResultCode,
      resultDesc: stkCallback.ResultDesc
    });
    
    if (stkCallback.ResultCode === 0) {
      console.log('✅ Payment successful!');
      // Here you would typically:
      // 1. Update your database
      // 2. Send the bundle to the customer
      // 3. Send confirmation SMS/email
    } else {
      console.log('❌ Payment failed:', stkCallback.ResultDesc);
    }
  }
  
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
    },
    suggestions: {
      localhost: 'For production testing, use ngrok to expose your callback URL',
      testing: 'Set TEST_MODE=true in .env for development testing',
      debugging: 'Visit /test-tinypesa to test API connectivity'
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
    TINYPESA_API_KEY_PREVIEW: TINYPESA_API_KEY ? `${TINYPESA_API_KEY.substring(0, 10)}...` : 'NOT SET',
    PORT: PORT,
    CALLBACK_URL: `http://localhost:${PORT}/callback`
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🧪 Test Mode: ${TEST_MODE ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🌐 TinyPesa API: ${TINYPESA_BASE_URL}`);
  console.log(`👤 TinyPesa Username: ${TINYPESA_USERNAME || 'NOT SET'}`);
  console.log(`🔑 API Key Configured: ${TINYPESA_API_KEY ? 'YES' : 'NO'}`);
  console.log(`📞 Callback URL: http://localhost:${PORT}/callback`);
  
  if (!TINYPESA_API_KEY || !TINYPESA_USERNAME) {
    console.log(`\n❌ MISSING CREDENTIALS:`);
    console.log(`   Please add to your .env file:`);
    console.log(`   TINYPESA_API_KEY=your_api_key_here`);
    console.log(`   TINYPESA_USERNAME=your_username_here`);
  }
  
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /health - Health check with diagnostics`);
  console.log(`   GET  /test-tinypesa - Test TinyPesa connectivity`);
  console.log(`   POST /stk-push - STK Push payment`);
  console.log(`   POST /callback - TinyPesa callback handler`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`   GET  /debug/env - Environment debug info`);
  }
  
  console.log(`\n💡 Tips for localhost testing:`);
  console.log(`   1. Install ngrok: npm install -g ngrok`);
  console.log(`   2. Run: ngrok http ${PORT}`);
  console.log(`   3. Use the https URL for production testing`);
  console.log(`   4. Set TEST_MODE=true for development testing`);
  console.log(`   5. Visit /test-tinypesa to test API connectivity`);
  
  console.log(`\n🔧 Troubleshooting 403/404 errors:`);
  console.log(`   - Ensure TINYPESA_API_KEY is correctly set`);
  console.log(`   - Verify your TinyPesa account is active`);
  console.log(`   - Check account balance and limits`);
  console.log(`   - Use ngrok for callback URL in production testing`);
  console.log(`   - Enable TEST_MODE for development`);
});