// Supabase client configuration
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration:');
  console.error('   SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('   SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'MISSING');
  console.error('Please add these to your .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Transaction management functions
class TransactionManager {
  
  // Create a new transaction record
  static async createTransaction(transactionData) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          payer_phone: transactionData.payer_phone,
          recipient_phone: transactionData.recipient_phone,
          amount: transactionData.amount,
          type: transactionData.type,
          offer_name: transactionData.offer_name,
          status: 'PENDING',
          account_ref: transactionData.account_ref,
          customer_message: transactionData.customer_message
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating transaction:', error);
        throw error;
      }

      console.log('✅ Transaction created:', data.id);
      return data;
    } catch (error) {
      console.error('💥 Failed to create transaction:', error);
      throw error;
    }
  }

  // Update transaction with TinyPesa response
  static async updateTransactionWithResponse(accountRef, responseData) {
    try {
      const updateData = {
        checkout_request_id: responseData.CheckoutRequestID,
        merchant_request_id: responseData.MerchantRequestID,
        response_code: responseData.ResponseCode,
        response_description: responseData.ResponseDescription,
        updated_at: new Date().toISOString()
      };

      // Update status based on response code
      if (responseData.ResponseCode === '0') {
        updateData.status = 'PENDING'; // Still pending until callback confirms
      } else {
        updateData.status = 'FAILED';
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('account_ref', accountRef)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating transaction:', error);
        throw error;
      }

      console.log('✅ Transaction updated with response:', data.id);
      return data;
    } catch (error) {
      console.error('💥 Failed to update transaction:', error);
      throw error;
    }
  }

  // Update transaction with callback data
  static async updateTransactionWithCallback(checkoutRequestId, callbackData) {
    try {
      const stkCallback = callbackData.Body?.stkCallback;
      if (!stkCallback) {
        throw new Error('Invalid callback data structure');
      }

      const updateData = {
        status: stkCallback.ResultCode === 0 ? 'SUCCESS' : 'FAILED',
        response_code: stkCallback.ResultCode?.toString(),
        response_description: stkCallback.ResultDesc,
        callback_data: callbackData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('checkout_request_id', checkoutRequestId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating transaction with callback:', error);
        throw error;
      }

      console.log('✅ Transaction updated with callback:', data.id, 'Status:', updateData.status);
      return data;
    } catch (error) {
      console.error('💥 Failed to update transaction with callback:', error);
      throw error;
    }
  }

  // Get transactions for a phone number
  static async getTransactionsByPhone(phone, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`payer_phone.eq.${phone},recipient_phone.eq.${phone}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching transactions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('💥 Failed to fetch transactions:', error);
      throw error;
    }
  }

  // Get transaction by account reference
  static async getTransactionByAccountRef(accountRef) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_ref', accountRef)
        .single();

      if (error) {
        console.error('❌ Error fetching transaction by account ref:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('💥 Failed to fetch transaction by account ref:', error);
      throw error;
    }
  }

  // Get recent transactions (for admin/monitoring)
  static async getRecentTransactions(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching recent transactions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('💥 Failed to fetch recent transactions:', error);
      throw error;
    }
  }

  // Get transaction statistics
  static async getTransactionStats() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('status, type, amount')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (error) {
        console.error('❌ Error fetching transaction stats:', error);
        throw error;
      }

      const stats = {
        total: data.length,
        successful: data.filter(t => t.status === 'SUCCESS').length,
        failed: data.filter(t => t.status === 'FAILED').length,
        pending: data.filter(t => t.status === 'PENDING').length,
        totalAmount: data.filter(t => t.status === 'SUCCESS').reduce((sum, t) => sum + parseFloat(t.amount), 0),
        byType: {}
      };

      // Group by type
      data.forEach(transaction => {
        if (!stats.byType[transaction.type]) {
          stats.byType[transaction.type] = 0;
        }
        stats.byType[transaction.type]++;
      });

      return stats;
    } catch (error) {
      console.error('💥 Failed to fetch transaction stats:', error);
      throw error;
    }
  }
}

module.exports = {
  supabase,
  TransactionManager
};