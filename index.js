require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const TinyPesaAPI = require('./lib/tinypesa');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lyeypdcwsxbrjethaefj.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize TinyPesa API
const tinyPesa = new TinyPesaAPI();

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// STK Push endpoint
app.post('/stk-push', async (req, res) => {
  try {
    const { phone, amount, type, offerName, recipientPhone, points } = req.body;
    
    // Validate and format phone numbers
    const formattedPhone = tinyPesa.formatPhoneNumber(phone);
    
    if (!tinyPesa.isValidPhoneNumber(formattedPhone)) {
      return res.status(400).json({
        ResponseCode: '1',
        ResponseDescription: 'Invalid phone number format. Please use a valid Kenyan mobile number.'
      });
    }

    let formattedRecipientPhone = formattedPhone;
    if (recipientPhone) {
      formattedRecipientPhone = tinyPesa.formatPhoneNumber(recipientPhone);
      if (!tinyPesa.isValidPhoneNumber(formattedRecipientPhone)) {
        return res.status(400).json({
          ResponseCode: '1',
          ResponseDescription: 'Invalid recipient phone number format.'
        });
      }
    }

    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        ResponseCode: '1',
        ResponseDescription: 'Invalid amount. Amount must be greater than 0.'
      });
    }

    // Generate unique account reference
    const accountRef = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Insert transaction into database with PENDING status
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          payer_phone: formattedPhone,
          recipient_phone: formattedRecipientPhone,
          amount: numericAmount,
          type: type,
          offer_name: offerName,
          status: 'PENDING',
          account_ref: accountRef,
          customer_message: `Payment for ${offerName}`
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

    // Initiate TinyPesa STK Push
    const stkResponse = await tinyPesa.stkPush({
      amount: numericAmount,
      msisdn: formattedPhone,
      account_no: accountRef
    });

    console.log('TinyPesa Response:', stkResponse);

    // Update transaction with TinyPesa response
    const updateData = {
      response_code: stkResponse.success ? '0' : '1',
      response_description: stkResponse.message || stkResponse.error || 'Unknown response'
    };

    if (stkResponse.success) {
      updateData.checkout_request_id = stkResponse.request_id;
      updateData.merchant_request_id = stkResponse.request_id; // TinyPesa uses same ID
    } else {
      updateData.status = 'FAILED';
    }

    await supabase
      .from('transactions')
      .update(updateData)
      .eq('account_ref', accountRef);

    // Return response to client
    if (stkResponse.success) {
      res.json({
        ResponseCode: '0',
        ResponseDescription: 'Payment request sent successfully',
        CheckoutRequestID: stkResponse.request_id,
        MerchantRequestID: stkResponse.request_id,
        CustomerMessage: `Payment request sent to ${formattedPhone}. Please complete the payment on your phone.`,
        AccountReference: accountRef
      });
    } else {
      res.status(400).json({
        ResponseCode: '1',
        ResponseDescription: stkResponse.error || 'Failed to initiate payment',
        ErrorDetails: stkResponse
      });
    }

  } catch (error) {
    console.error('STK Push error:', error);
    res.status(500).json({
      ResponseCode: '1',
      ResponseDescription: 'Internal server error'
    });
  }
});

// Callback endpoint for TinyPesa
app.post('/callback/tinypesa', async (req, res) => {
  try {
    console.log('TinyPesa Callback received:', req.body);
    
    const callbackData = req.body;
    const { account_no, msisdn, amount, receipt, status } = callbackData;

    if (!account_no) {
      console.error('No account reference in callback');
      return res.status(400).json({ error: 'Missing account reference' });
    }

    // Update transaction status based on callback
    const transactionStatus = status === 'success' ? 'SUCCESS' : 'FAILED';
    
    const { data, error } = await supabase
      .from('transactions')
      .update({
        status: transactionStatus,
        callback_data: callbackData,
        response_description: status === 'success' 
          ? `Payment completed successfully. Receipt: ${receipt}` 
          : 'Payment failed or was cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('account_ref', account_no)
      .select();

    if (error) {
      console.error('Failed to update transaction:', error);
      return res.status(500).json({ error: 'Failed to update transaction' });
    }

    if (!data || data.length === 0) {
      console.error('Transaction not found for account_no:', account_no);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    console.log('Transaction updated successfully:', data[0]);
    res.json({ success: true, message: 'Callback processed successfully' });

  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check transaction status endpoint
app.get('/api/transaction-status/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Check status with TinyPesa
    const statusResponse = await tinyPesa.checkStatus(requestId);
    
    // Also get transaction from database
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('checkout_request_id', requestId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch transaction'
      });
    }

    res.json({
      success: true,
      tinypesa_status: statusResponse,
      transaction: data
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
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