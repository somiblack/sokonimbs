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
const LIPIA_API_KEY = '79233999f4f4b0e88c6db407d978d439790e5ada';

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/stk-push', async (req, res) => {
  try {
    const { amount, phone } = req.body;
    
    // Format phone number for Lipia API (07XXXXXXXX format)
    let formattedPhone = phone;
    if (phone.startsWith('254')) {
      formattedPhone = '0' + phone.slice(3);
    }
    
    const response = await axios.post(
      `${LIPIA_BASE_URL}/request/stk`,
      {
        phone: formattedPhone,
        amount: amount.toString()
      },
      {
        headers: {
          'Authorization': `Bearer ${LIPIA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

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