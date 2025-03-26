export interface Transaction {
id: number;
amount: number;
transaction_type: 'INCOME' | 'EXPENSE';
description: string;
category: string;
transaction_date: string;
region?: string;
notes?: string;
}
  
export type CreateTransactionDTO = Omit<Transaction, 'id'>;