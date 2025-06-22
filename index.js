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

// Lipia API configuration
const LIPIA_BASE_URL = 'https://lipia-api.kreativelabske.com/api';
const LIPIA_API_KEY = process.env.VITE_LIPIA_API_KEY || 'b7c94be90840bf90881d351ded5ffaf740070501';

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/stk-push', async (req, res) => {
  try {
    const { amount, phone, recipientPhone, type, originalAmount, discount } = req.body;
    
    // Format phone number for Lipia API (07XXXXXXXX format)
    let formattedPayerPhone = phone;
    if (phone.startsWith('254')) {
      formattedPayerPhone = '0' + phone.slice(3);
    }
    
    // The payment request goes to the payer's phone
    const response = await axios.post(
      `${LIPIA_BASE_URL}/request/stk`,
      {
        phone: formattedPayerPhone,
        amount: amount.toString()
      },
      {
        headers: {
          'Authorization': `Bearer ${LIPIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout to prevent socket hang up
      }
    );

    // Log the transaction details for reference
    const transactionDetails = {
      payer: formattedPayerPhone,
      recipient: recipientPhone ? ('0' + recipientPhone.slice(3)) : formattedPayerPhone,
      amount: amount,
      timestamp: new Date().toISOString()
    };

    // Add specific details based on transaction type
    if (type === 'airtime') {
      transactionDetails.type = 'Discounted Airtime';
      transactionDetails.originalAmount = originalAmount;
      transactionDetails.discount = `${discount}%`;
      transactionDetails.savings = originalAmount - amount;
    } else {
      transactionDetails.type = 'Data Bundle';
    }

    console.log('Transaction Details:', transactionDetails);

    // Return success response in format expected by frontend
    res.json({
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      ...response.data
    });

  } catch (error) {
    console.error('Lipia API Error:', error.response?.data || error.message);
    
    // Return error response in format expected by frontend
    res.status(500).json({
      ResponseCode: '1',
      ResponseDescription: 'Failed',
      errorMessage: error.response?.data?.message || 'Payment request failed'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});