// stkPush.js
const axios = require('axios');
const moment = require('moment');
const { getAccessToken } = require('./daraja');
require('dotenv').config();

const initiateSTKPush = async ({ amount, phone }) => {
  const token = await getAccessToken();

  const timestamp = moment().format('YYYYMMDDHHmmss');
  const password = Buffer.from(
    process.env.BUSINESS_SHORTCODE + process.env.PASSKEY + timestamp
  ).toString('base64');

  const payload = {
    BusinessShortCode: process.env.BUSINESS_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phone,
    PartyB: process.env.BUSINESS_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: process.env.CALLBACK_URL,
    AccountReference: 'SokoniMbs',
    TransactionDesc: 'Bundle Purchase'
  };

  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { initiateSTKPush };
