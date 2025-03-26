import { Transaction, Invoice, InvoiceItem } from '../types';

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 5000.00,
    category: 'Sales',
    description: 'Product sales - Q1',
    date: '2024-02-18',
    user_id: '1',
    created_at: '2024-02-18T10:00:00Z'
  },
  {
    id: '2',
    type: 'expense',
    amount: 150.25,
    category: 'Office Supplies',
    description: 'Printer paper and ink',
    date: '2024-02-17',
    user_id: '1',
    created_at: '2024-02-17T15:30:00Z'
  },
  {
    id: '3',
    type: 'income',
    amount: 3500.00,
    category: 'Consulting',
    description: 'Technical consulting services',
    date: '2024-02-16',
    user_id: '1',
    created_at: '2024-02-16T09:15:00Z'
  }
];

// Mock Invoice Items
const mockInvoiceItems: InvoiceItem[] = [
  {
    description: 'Web Development Services',
    quantity: 80,
    unit_price: 75.00,
    amount: 6000.00
  },
  {
    description: 'UI/UX Design',
    quantity: 40,
    unit_price: 100.00,
    amount: 4000.00
  }
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-2024-001',
    client_name: 'Acme Corp',
    amount: 2500.00,
    status: 'paid',
    due_date: '2024-03-01',
    items: mockInvoiceItems,
    user_id: '1',
    created_at: '2024-02-15T08:00:00Z'
  },
  {
    id: '2',
    number: 'INV-2024-002',
    client_name: 'TechStart Inc',
    amount: 1800.00,
    status: 'pending',
    due_date: '2024-03-15',
    items: mockInvoiceItems,
    user_id: '1',
    created_at: '2024-02-16T10:30:00Z'
  }
];