const axios = require('axios');

class DarajaAPI {
  constructor() {
    this.consumerKey = process.env.DARAJA_CONSUMER_KEY;
    this.consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
    this.businessShortCode = process.env.DARAJA_BUSINESS_SHORT_CODE || '174379';
    this.passkey = process.env.DARAJA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    this.environment = process.env.DARAJA_ENVIRONMENT || 'sandbox';
    
    // Set base URLs based on environment
    this.baseURL = this.environment === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
    
    this.accessToken = null;
    this.tokenExpiry = null;
    
    if (!this.consumerKey || !this.consumerSecret) {
      console.warn('Daraja API credentials not configured. Payment functionality will not work.');
      this.demoMode = true;
    }
  }

  /**
   * Generate access token for Daraja API
   * @returns {Promise<string>} Access token
   */
  async generateAccessToken() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      if (this.demoMode) {
        console.log('Demo mode: Using mock access token');
        this.accessToken = 'demo_access_token';
        this.tokenExpiry = Date.now() + 3600000; // 1 hour
        return this.accessToken;
      }

      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(`${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      console.log('Access token generated successfully');
      return this.accessToken;

    } catch (error) {
      console.error('Failed to generate access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Daraja API');
    }
  }

  /**
   * Generate password for STK Push
   * @returns {string} Base64 encoded password
   */
  generatePassword() {
    const timestamp = this.getTimestamp();
    const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
    return password;
  }

  /**
   * Get current timestamp in the required format
   * @returns {string} Timestamp (YYYYMMDDHHmmss)
   */
  getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  /**
   * Initiate STK Push payment
   * @param {Object} params - Payment parameters
   * @param {string} params.amount - Amount to charge
   * @param {string} params.phoneNumber - Phone number (254XXXXXXXXX format)
   * @param {string} params.accountReference - Account reference
   * @param {string} params.transactionDesc - Transaction description
   * @param {string} params.callbackURL - Callback URL
   * @returns {Promise<Object>} API response
   */
  async stkPush({ amount, phoneNumber, accountReference, transactionDesc, callbackURL }) {
    try {
      if (this.demoMode) {
        console.log('Demo mode: Simulating STK Push success');
        return {
          MerchantRequestID: `DEMO_MERCHANT_${Date.now()}`,
          CheckoutRequestID: `DEMO_CHECKOUT_${Date.now()}`,
          ResponseCode: '0',
          ResponseDescription: 'Success. Request accepted for processing (Demo Mode)',
          CustomerMessage: 'Success. Request accepted for processing (Demo Mode)'
        };
      }

      const accessToken = await this.generateAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword();

      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(parseFloat(amount)),
        PartyA: phoneNumber,
        PartyB: this.businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackURL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc || `Payment for ${accountReference}`
      };

      console.log('Daraja STK Push Request:', {
        ...payload,
        Password: '[HIDDEN]'
      });

      const response = await axios.post(`${this.baseURL}/mpesa/stkpush/v1/processrequest`, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('Daraja STK Push Response:', response.data);
      return response.data;

    } catch (error) {
      console.error('Daraja STK Push Error:', error.response?.data || error.message);
      
      if (error.response) {
        return {
          ResponseCode: error.response.data?.ResponseCode || '1',
          ResponseDescription: error.response.data?.ResponseDescription || 'Request failed',
          errorMessage: error.response.data?.errorMessage,
          errorCode: error.response.data?.errorCode
        };
      } else {
        return {
          ResponseCode: '1',
          ResponseDescription: 'Network error or timeout',
          errorMessage: error.message
        };
      }
    }
  }

  /**
   * Query STK Push transaction status
   * @param {string} checkoutRequestID - Checkout request ID from STK push
   * @returns {Promise<Object>} Transaction status
   */
  async querySTKStatus(checkoutRequestID) {
    try {
      if (this.demoMode) {
        console.log('Demo mode: Simulating status query');
        return {
          ResponseCode: '0',
          ResponseDescription: 'The service request has been accepted successfully (Demo Mode)',
          MerchantRequestID: `DEMO_MERCHANT_${Date.now()}`,
          CheckoutRequestID: checkoutRequestID,
          ResultCode: '0',
          ResultDesc: 'The service request is processed successfully (Demo Mode)'
        };
      }

      const accessToken = await this.generateAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword();

      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      };

      const response = await axios.post(`${this.baseURL}/mpesa/stkpushquery/v1/query`, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log('Daraja Status Query Response:', response.data);
      return response.data;

    } catch (error) {
      console.error('Daraja Status Query Error:', error.response?.data || error.message);
      
      return {
        ResponseCode: '1',
        ResponseDescription: 'Query failed',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Format phone number to Daraja format (254XXXXXXXXX)
   * @param {string} phone - Phone number in various formats
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/[^\d]/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('0')) {
      // Convert 0XXXXXXXXX to 254XXXXXXXXX
      cleaned = '254' + cleaned.slice(1);
    } else if (cleaned.startsWith('254')) {
      // Already in correct format
      cleaned = cleaned;
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      // Handle 7XXXXXXXX or 1XXXXXXXX
      cleaned = '254' + cleaned;
    } else {
      // Assume it needs 254 prefix
      cleaned = '254' + cleaned;
    }

    return cleaned;
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid
   */
  isValidPhoneNumber(phone) {
    const formatted = this.formatPhoneNumber(phone);
    // Kenyan mobile numbers: 254 + 7/1 + 8 digits
    return /^254[71]\d{8}$/.test(formatted);
  }
}

module.exports = DarajaAPI;