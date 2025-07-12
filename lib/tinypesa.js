const axios = require('axios');

class TinyPesaAPI {
  constructor() {
    this.apiKey = process.env.TINYPESA_API_KEY;
    this.accountNo = process.env.TINYPESA_ACCOUNT_NO;
    this.baseURL = 'https://api.tinypesa.com/api/v1';
    
    if (!this.apiKey) {
      console.warn('TinyPesa API key not configured. Payment functionality will not work.');
    }
  }

  /**
   * Initiate STK Push payment
   * @param {Object} params - Payment parameters
   * @param {string} params.amount - Amount to charge
   * @param {string} params.msisdn - Phone number (254XXXXXXXXX format)
   * @param {string} params.account_no - Account reference
   * @returns {Promise<Object>} API response
   */
  async stkPush({ amount, msisdn, account_no }) {
    try {
      const payload = {
        amount: parseFloat(amount),
        msisdn: msisdn,
        account_no: account_no
      };

      console.log('TinyPesa STK Push Request:', payload);

      const response = await axios.post(`${this.baseURL}/express/initialize`, payload, {
        headers: {
          'Apikey': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('TinyPesa STK Push Response:', response.data);
      return response.data;

    } catch (error) {
      console.error('TinyPesa STK Push Error:', error.response?.data || error.message);
      
      if (error.response) {
        // API returned an error response
        return {
          success: false,
          error: error.response.data,
          status: error.response.status
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'No response from TinyPesa API',
          message: 'Network error or timeout'
        };
      } else {
        // Something else happened
        return {
          success: false,
          error: 'Request setup error',
          message: error.message
        };
      }
    }
  }

  /**
   * Check transaction status
   * @param {string} request_id - Transaction request ID
   * @returns {Promise<Object>} Transaction status
   */
  async checkStatus(request_id) {
    try {
      const response = await axios.get(`${this.baseURL}/express/status`, {
        params: { request_id },
        headers: {
          'Apikey': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log('TinyPesa Status Check Response:', response.data);
      return response.data;

    } catch (error) {
      console.error('TinyPesa Status Check Error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Format phone number to TinyPesa format (254XXXXXXXXX)
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

module.exports = TinyPesaAPI;