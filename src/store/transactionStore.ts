import { create } from 'zustand';
import axios from 'axios';
import { Transaction, CreateTransactionDTO } from '../types/transaction';

interface BulkImportResult {
  success_count: number;
  failed_count: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

interface FetchTransactionsParams {
  skip?: number;
  limit?: number;
  search?: string;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
}

interface TransactionStore {
  transactions: Transaction[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetchParams: FetchTransactionsParams;
  fetchTransactions: (params?: FetchTransactionsParams) => Promise<void>;
  addTransaction: (transaction: CreateTransactionDTO) => Promise<void>;
  updateTransaction: (id: number, transaction: Partial<Transaction>) => Promise<void>;
  bulkImportTransactions: (transactions: CreateTransactionDTO[]) => Promise<BulkImportResult>;
  importFromCSV: (file: File) => Promise<BulkImportResult>;
}

// const API_URL = 'https://erpprojectbe-production-f59b.up.railway.app/api/v1/financial';
const API_URL = "http://127.0.0.1:8000/api/v1/financial"


export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  totalCount: 0,
  isLoading: false,
  error: null,
  lastFetchParams: {},

  fetchTransactions: async (params: FetchTransactionsParams = {}) => {
    set({ isLoading: true, lastFetchParams: params });
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      
      // Add filter parameters
      if (params.search) queryParams.append('search', params.search);
      if (params.transactionType) queryParams.append('transaction_type', params.transactionType);
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);

      const response = await axios.get(`${API_URL}/transactions?${queryParams.toString()}`);
      
      if (response.data.items && response.data.total !== undefined) {
        set({ 
          transactions: response.data.items, 
          totalCount: response.data.total,
          isLoading: false 
        });
      } else {
        set({ 
          transactions: response.data, 
          totalCount: response.data.length,
          isLoading: false 
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      set({ 
        error: 'Failed to fetch transactions', 
        isLoading: false,
        transactions: [],
        totalCount: 0
      });
    }
  },

  addTransaction: async (transaction) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/transactions`, transaction);
      
      // Refresh the current page after adding
      const state = get();
      await state.fetchTransactions(state.lastFetchParams);
      
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to add transaction', isLoading: false });
      throw error;
    }
  },

  updateTransaction: async (id: number, transaction: Partial<Transaction>) => {
    set({ isLoading: true });
    try {
      const response = await axios.put(`${API_URL}/transactions/${id}`, transaction);
      
      // Update the transaction in the current list
      set((state) => ({
        transactions: state.transactions.map(t => 
          t.id === id ? { ...t, ...response.data } : t
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update transaction', isLoading: false });
      throw error;
    }
  },

  bulkImportTransactions: async (transactions: CreateTransactionDTO[]): Promise<BulkImportResult> => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/transactions/bulk-import`, {
        transactions
      });
      
      // Refresh the transactions list after successful import
      if (response.data.success_count > 0) {
        await get().fetchTransactions();
      }
      
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ error: 'Failed to import transactions', isLoading: false });
      throw error;
    }
  },

  importFromCSV: async (file: File): Promise<BulkImportResult> => {
    set({ isLoading: true });
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_URL}/transactions/import-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh the transactions list after successful import
      if (response.data.success_count > 0) {
        await get().fetchTransactions();
      }
      
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ error: 'Failed to import CSV', isLoading: false });
      throw error;
    }
  },
}));