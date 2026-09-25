// server.js - SokoniMBS M-Pesa API + Supabase
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();

// --- CORS CONFIGURATION ---
// Allow localhost for testing + your Render frontend + custom domain
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:3000',
    'https://sokonimbs-frontend.onrender.com',
    'https://your-custom-domain.com'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            console.warn('⚠️ CORS blocked origin:', origin);
            return callback(null, true); // For testing: allow all. Restrict in production.
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log('✅ Supabase client initialized');
} else {
    console.warn('⚠️ Supabase credentials missing — transactions will not be saved');
}

// --- DARAJA CONFIGURATION ---
const DARAJA_CONFIG = {
    consumerKey: process.env.DARAJA_CONSUMER_KEY,
    consumerSecret: process.env.DARAJA_CONSUMER_SECRET,
    passkey: process.env.DARAJA_PASSKEY,
    shortCode: process.env.DARAJA_SHORTCODE || '174379',
    environment: process.env.DARAJA_ENVIRONMENT || 'production'
};

// Validate Daraja credentials
const requiredConfig = ['consumerKey', 'consumerSecret', 'passkey'];
const missingConfig = requiredConfig.filter(key => !DARAJA_CONFIG[key]);

if (missingConfig.length > 0) {
    console.error('❌ Missing Daraja environment variables:', missingConfig.join(', '));
    console.error('Please check your .env file or Render environment settings');
} else {
    console.log('✅ DARAJA Configuration loaded');
}

console.log(`🔧 Environment: ${DARAJA_CONFIG.environment}`);
console.log(`📱 Shortcode: ${DARAJA_CONFIG.shortCode}`);

// --- Helper: Get Access Token ---
async function getAccessToken() {
    const auth = Buffer.from(
        DARAJA_CONFIG.consumerKey + ':' + DARAJA_CONFIG.consumerSecret
    ).toString('base64');
    
    const baseUrl = DARAJA_CONFIG.environment === 'production' 
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';
    
    try {
        const response = await fetch(
            `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
            {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + auth
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.access_token) {
            throw new Error('No access token received');
        }
        
        console.log('✅ Access token generated successfully');
        return data.access_token;
    } catch (error) {
        console.error('❌ Failed to get access token:', error.message);
        throw error;
    }
}

// --- Helper: Generate Timestamp ---
function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// --- Helper: Generate Password ---
function generatePassword(shortcode, passkey, timestamp) {
    const passwordString = shortcode + passkey + timestamp;
    return Buffer.from(passwordString).toString('base64');
}

// --- Helper: Save Transaction to Supabase ---
async function saveTransaction(data) {
    if (!supabase) {
        console.warn('⚠️ Supabase not configured — skipping transaction save');
        return null;
    }
    
    try {
        const { data: result, error } = await supabase
            .from('transactions')
            .insert([data])
            .select();
        
        if (error) {
            console.error('❌ Supabase insert error:', error.message);
            return null;
        }
        
        console.log('✅ Transaction saved to Supabase');
        return result;
    } catch (err) {
        console.error('❌ Supabase exception:', err.message);
        return null;
    }
}

// --- Helper: Update Transaction Status ---
async function updateTransactionStatus(checkoutRequestID, status, metadata = {}) {
    if (!supabase) {
        console.warn('⚠️ Supabase not configured — skipping status update');
        return null;
    }
    
    try {
        const { data: result, error } = await supabase
            .from('transactions')
            .update({ 
                status: status,
                updated_at: new Date().toISOString(),
                ...metadata
            })
            .eq('checkout_request_id', checkoutRequestID)
            .select();
        
        if (error) {
            console.error('❌ Supabase update error:', error.message);
            return null;
        }
        
        console.log(`✅ Transaction ${checkoutRequestID} updated to ${status}`);
        return result;
    } catch (err) {
        console.error('❌ Supabase exception:', err.message);
        return null;
    }
}

// --- 1. STK Push Endpoint ---
app.post('/stk-push', async (req, res) => {
    try {
        const { phone, amount, type, offerName } = req.body;
        
        console.log('📱 Incoming request:', { phone, amount, type, offerName });
        
        // Validate input
        if (!phone || !amount) {
            return res.status(400).json({ 
                success: false,
                message: 'Phone number and amount are required' 
            });
        }
        
        // Clean phone number
        let cleanPhone = String(phone).replace(/\s/g, '');
        if (!cleanPhone.startsWith('254')) {
            if (cleanPhone.startsWith('0')) {
                cleanPhone = '254' + cleanPhone.substring(1);
            } else {
                cleanPhone = '254' + cleanPhone;
            }
        }
        
        console.log(`📱 Processing payment for ${cleanPhone} amount: ${amount}`);
        
        const accessToken = await getAccessToken();
        const timestamp = getTimestamp();
        const password = generatePassword(
            DARAJA_CONFIG.shortCode,
            DARAJA_CONFIG.passkey,
            timestamp
        );
        
        const baseUrl = DARAJA_CONFIG.environment === 'production' 
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
        
        const accountReference = 'SokoniMBS-' + Date.now();
        
        const requestBody = {
            BusinessShortCode: DARAJA_CONFIG.shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: cleanPhone,
            PartyB: DARAJA_CONFIG.shortCode,
            PhoneNumber: cleanPhone,
            CallBackURL: process.env.DARAJA_CALLBACK_URL || 'https://your-domain.com/api/callback',
            AccountReference: accountReference,
            TransactionDesc: offerName || 'Data Bundle Purchase'
        };
        
        console.log('📤 Sending STK push request...');
        
        const response = await fetch(
            `${baseUrl}/mpesa/stkpush/v1/processrequest`,
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            }
        );
        
        const data = await response.json();
        
        console.log('📥 STK Response:', data);
        
        if (data.ResponseCode === '0') {
            console.log('✅ STK push sent successfully');
            
            // Save transaction to Supabase
            await saveTransaction({
                phone: cleanPhone,
                amount: Number(amount),
                offer_name: offerName || 'Data Bundle',
                status: 'pending',
                checkout_request_id: data.CheckoutRequestID,
                merchant_request_id: data.MerchantRequestID,
                account_reference: accountReference,
                created_at: new Date().toISOString()
            });
            
            res.json({ 
                success: true, 
                message: 'STK push sent! Check your phone to complete payment.',
                data: data
            });
        } else {
            console.error('❌ STK push failed:', data.ResponseDescription || data.errorMessage);
            res.json({ 
                success: false, 
                message: data.ResponseDescription || data.errorMessage || 'Payment request failed',
                data: data
            });
        }
        
    } catch (error) {
        console.error('❌ STK Push error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Payment processing failed',
            details: error.message 
        });
    }
});

// --- 2. Query STK Status ---
app.post('/stk-query', async (req, res) => {
    try {
        const { checkoutRequestID } = req.body;
        
        if (!checkoutRequestID) {
            return res.status(400).json({ 
                success: false,
                message: 'CheckoutRequestID is required' 
            });
        }
        
        console.log(`🔍 Querying status for: ${checkoutRequestID}`);
        
        const accessToken = await getAccessToken();
        const timestamp = getTimestamp();
        const password = generatePassword(
            DARAJA_CONFIG.shortCode,
            DARAJA_CONFIG.passkey,
            timestamp
        );
        
        const baseUrl = DARAJA_CONFIG.environment === 'production' 
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
        
        const requestBody = {
            BusinessShortCode: DARAJA_CONFIG.shortCode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestID
        };
        
        const response = await fetch(
            `${baseUrl}/mpesa/stkpushquery/v1/query`,
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            }
        );
        
        const data = await response.json();
        
        console.log('📥 Query Response:', data);
        
        if (data.ResultCode === '0') {
            res.json({ 
                success: true, 
                message: 'Payment completed successfully',
                data: data
            });
        } else if (data.ResultCode === '1032') {
            res.json({ 
                success: false, 
                message: 'Transaction cancelled by user',
                data: data
            });
        } else {
            res.json({ 
                success: false, 
                message: data.ResultDesc || 'Payment status unknown',
                data: data
            });
        }
        
    } catch (error) {
        console.error('❌ STK Query error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to query payment status',
            details: error.message 
        });
    }
});

// --- 3. Callback endpoint (M-Pesa sends confirmation here) ---
app.post('/api/callback', async (req, res) => {
    try {
        console.log('📥 Received callback from M-Pesa');
        console.log('Callback Body:', JSON.stringify(req.body, null, 2));
        
        const { Body } = req.body;
        if (Body && Body.stkCallback) {
            const { 
                ResultCode, 
                ResultDesc, 
                CheckoutRequestID,
                CallbackMetadata 
            } = Body.stkCallback;
            
            console.log(`📊 Transaction ${CheckoutRequestID}`);
            console.log(`📊 Result Code: ${ResultCode}`);
            console.log(`📊 Result Description: ${ResultDesc}`);
            
            // Determine status
            const status = ResultCode === 0 ? 'success' : 'failed';
            
            // Extract metadata if successful
            let metadata = {};
            if (ResultCode === 0 && CallbackMetadata && CallbackMetadata.Item) {
                CallbackMetadata.Item.forEach(item => {
                    metadata[item.Name] = item.Value;
                });
                console.log('📊 Metadata:', metadata);
            }
            
            // Update transaction in Supabase
            await updateTransactionStatus(CheckoutRequestID, status, {
                result_code: ResultCode,
                result_desc: ResultDesc,
                mpesa_receipt: metadata.MpesaReceiptNumber || null,
                transaction_date: metadata.TransactionDate || null,
                phone: metadata.PhoneNumber || null
            });
            
            // TODO: Allocate bundle to user here
            // TODO: Send confirmation SMS
        }
        
        // Always respond with success to M-Pesa
        res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
        
    } catch (error) {
        console.error('❌ Callback error:', error);
        res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    }
});

// --- 4. Get Transaction History (for frontend) ---
app.get('/transactions/:phone', async (req, res) => {
    try {
        const { phone } = req.params;
        
        if (!supabase) {
            return res.status(503).json({ 
                success: false, 
                message: 'Database not configured' 
            });
        }
        
        let cleanPhone = phone.replace(/\s/g, '');
        if (!cleanPhone.startsWith('254')) {
            if (cleanPhone.startsWith('0')) {
                cleanPhone = '254' + cleanPhone.substring(1);
            } else {
                cleanPhone = '254' + cleanPhone;
            }
        }
        
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('phone', cleanPhone)
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (error) throw error;
        
        res.json({ 
            success: true, 
            transactions: data || [] 
        });
        
    } catch (error) {
        console.error('❌ History error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch transactions',
            details: error.message 
        });
    }
});

// --- 5. Health check ---
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        environment: DARAJA_CONFIG.environment,
        shortcode: DARAJA_CONFIG.shortCode,
        supabase: supabase ? 'connected' : 'not configured',
        timestamp: new Date().toISOString()
    });
});

// --- 6. Root endpoint ---
app.get('/', (req, res) => {
    res.json({ 
        message: 'SokoniMBS M-Pesa API',
        version: '1.0.0',
        endpoints: {
            stkPush: 'POST /stk-push',
            stkQuery: 'POST /stk-query',
            callback: 'POST /api/callback',
            history: 'GET /transactions/:phone',
            health: 'GET /health'
        }
    });
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${DARAJA_CONFIG.environment}`);
    console.log(`📱 Shortcode: ${DARAJA_CONFIG.shortCode}`);
    console.log(`📍 http://localhost:${PORT}`);
});