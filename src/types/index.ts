export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'accountant' | 'user';
  created_at: string;
}


export interface Invoice {
  id: string;
  number: string;
  client_name: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  due_date: string;
  items: InvoiceItem[];
  user_id: string;
  created_at: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}