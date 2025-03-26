// src/types/invoice.ts
export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  inventory_item_id?: number;
  transaction_id?: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  client_name: string | null;
  client_email: string | null;
  client_address: string | null;
  issue_date: string;
  due_date: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  payment_terms: 'NET_7' | 'NET_15' | 'NET_30' | 'NET_60';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'IDR';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes?: string;
  pdf_url?: string;
  items: InvoiceItem[];
}

export interface CreateInvoiceDTO {
  client_name?: string | null;
  client_email?: string | null;
  client_address?: string | null;
  issue_date?: string;
  due_date: string;
  payment_terms: 'NET_7' | 'NET_15' | 'NET_30' | 'NET_60';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'IDR';
  tax_rate: number;
  subtotal?: number;
  tax_amount?: number;
  total?: number;
  notes?: string;
  items: InvoiceItem[];
  transaction_ids?: number[];
}