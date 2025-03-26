/*
  # Initial Schema Setup for ERP System

  1. New Tables
    - `users`
      - Extended user profile data
    - `transactions`
      - Financial transactions (income & expenses)
    - `invoices`
      - Invoice management
    - `invoice_items`
      - Line items for invoices
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table extension
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  role text CHECK (role IN ('admin', 'accountant', 'user')) DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  type text CHECK (type IN ('income', 'expense')),
  amount decimal(12,2) NOT NULL,
  category text NOT NULL,
  description text,
  date date NOT NULL,
  attachment_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  number text UNIQUE NOT NULL,
  client_name text NOT NULL,
  amount decimal(12,2) NOT NULL,
  status text CHECK (status IN ('paid', 'pending', 'overdue')) DEFAULT 'pending',
  due_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer NOT NULL,
  unit_price decimal(12,2) NOT NULL,
  amount decimal(12,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own invoice items"
  ON invoice_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);