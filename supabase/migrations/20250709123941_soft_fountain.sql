/*
  # Create transactions table for order history

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `payer_phone` (text, phone number of person paying)
      - `recipient_phone` (text, phone number receiving the bundle)
      - `amount` (numeric, transaction amount)
      - `type` (text, transaction type: data, renewable, monthly, minutes, sms, airtime, bonga)
      - `offer_name` (text, name of the bundle/offer purchased)
      - `status` (text, transaction status: PENDING, SUCCESS, FAILED, CANCELLED)
      - `account_ref` (text, unique reference for the transaction)
      - `checkout_request_id` (text, TinyPesa checkout request ID)
      - `merchant_request_id` (text, TinyPesa merchant request ID)
      - `customer_message` (text, message shown to customer)
      - `response_code` (text, response code from payment gateway)
      - `response_description` (text, response description from payment gateway)
      - `callback_data` (jsonb, full callback data from TinyPesa)
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for users to read their own transactions based on phone number
    - Add indexes for better query performance

  3. Additional Features
    - Trigger to automatically update `updated_at` timestamp
    - Index on phone numbers and status for faster queries
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payer_phone text NOT NULL,
  recipient_phone text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('data', 'renewable', 'monthly', 'minutes', 'sms', 'airtime', 'bonga')),
  offer_name text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
  account_ref text UNIQUE NOT NULL,
  checkout_request_id text,
  merchant_request_id text,
  customer_message text,
  response_code text,
  response_description text,
  callback_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  USING (
    payer_phone = current_setting('app.current_user_phone', true) OR
    recipient_phone = current_setting('app.current_user_phone', true)
  );

-- Create policy for the application to insert transactions
CREATE POLICY "Application can insert transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (true);

-- Create policy for the application to update transactions
CREATE POLICY "Application can update transactions"
  ON transactions
  FOR UPDATE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_payer_phone ON transactions(payer_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_recipient_phone ON transactions(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account_ref ON transactions(account_ref);
CREATE INDEX IF NOT EXISTS idx_transactions_checkout_request_id ON transactions(checkout_request_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();