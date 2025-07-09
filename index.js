const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// STK Push endpoint
app.post('/stk-push', async (req, res) => {
  try {
    const { phone, amount, type, offerName, recipientPhone, points } = req.body;
    
    // Format phone number
    let formattedPhone = phone.replace(/[^\d]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    let formattedRecipientPhone = recipientPhone || formattedPhone;
    if (recipientPhone) {
      formattedRecipientPhone = recipientPhone.replace(/[^\d]/g, '');
      if (formattedRecipientPhone.startsWith('0')) {
        formattedRecipientPhone = '254' + formattedRecipientPhone.slice(1);
      } else if (!formattedRecipientPhone.startsWith('254')) {
        formattedRecipientPhone = '254' + formattedRecipientPhone;
      }
    }

    // Generate unique account reference
    const accountRef = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Insert transaction into database
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          payer_phone: formattedPhone,
          recipient_phone: formattedRecipientPhone,
          amount: amount,
          type: type,
          offer_name: offerName,
          status: 'PENDING',
          account_ref: accountRef,
          customer_message: `Payment for ${offerName}`,
          response_code: '0',
          response_description: 'Payment request initiated successfully'
        }
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        ResponseCode: '1',
        ResponseDescription: 'Failed to process request'
      });
    }

    // Simulate STK push response
    res.json({
      ResponseCode: '0',
      ResponseDescription: 'Payment request sent successfully',
      CheckoutRequestID: `ws_CO_${Date.now()}`,
      MerchantRequestID: `mr_${Date.now()}`,
      CustomerMessage: `Payment request sent to ${formattedPhone}. Please complete the payment on your phone.`
    });

  } catch (error) {
    console.error('STK Push error:', error);
    res.status(500).json({
      ResponseCode: '1',
      ResponseDescription: 'Internal server error'
    });
  }
});

// Get transaction history endpoint
app.get('/api/transactions/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    // Format phone number
    let formattedPhone = phone.replace(/[^\d]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Set the current user phone for RLS
    await supabase.rpc('set_config', {
      setting_name: 'app.current_user_phone',
      setting_value: formattedPhone,
      is_local: true
    });

    // Query transactions for the user
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`payer_phone.eq.${formattedPhone},recipient_phone.eq.${formattedPhone}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch transactions'
      });
    }

    // Format the response
    const formattedTransactions = data.map(transaction => ({
      id: transaction.id,
      offerName: transaction.offer_name,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      payerPhone: transaction.payer_phone,
      recipientPhone: transaction.recipient_phone,
      responseDescription: transaction.response_description,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at
    }));

    res.json({
      success: true,
      transactions: formattedTransactions
    });

  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the application`);
});