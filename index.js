// index.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { getAccessToken } = require('./daraja');
const { initiateSTKPush } = require('./stkpush'); // Fixed: changed from './stkPush' to './stkpush'

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Daraja API is live!');
});

app.get('/access-token', async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ access_token: token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get access token' });
  }
});

app.post('/stk-push', async (req, res) => {
  try {
    const response = await initiateSTKPush(req.body);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to initiate STK Push' });
  }
});

app.post('/access', async (req, res) => {
  const { amount, phone } = req.body;

  try {
    const result = await initiateSTKPush({ amount, phone });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'STK Push failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});