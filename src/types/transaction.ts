export interface Transaction {
  id: number;
  amount: number;
  transaction_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  description: string;
  category: string;
  transaction_date: string;
  region?: string;
  notes?: string;
  account_category_id?: number; 
}
  
export type CreateTransactionDTO = Omit<Transaction, 'id'>;