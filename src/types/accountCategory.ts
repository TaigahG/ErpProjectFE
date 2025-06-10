export type TransactionType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

export interface AccountCategory {
  id: number;
  name: string;
  code: string;
  type: TransactionType;
  parent_id: number | null;
}

export type CreateAccountCategoryDTO = Omit<AccountCategory, 'id'>;

