import { create } from 'zustand';
import axios from 'axios';
import { Transaction, CreateTransactionDTO } from '../types/transaction';

interface TransactionStore {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: CreateTransactionDTO) => Promise<void>;
  updateTransaction: (id: number, transaction: Partial<Transaction>) => Promise<void>;
}

const API_URL = 'https://erpprojectbe-production-f59b.up.railway.app/api/v1/financial';

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      set({ transactions: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch transactions', isLoading: false });
    }
  },

  addTransaction: async (transaction) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/transactions`, transaction);
      set((state) => ({
        transactions: [...state.transactions, response.data],
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to add transaction', isLoading: false });
    }
  },

  updateTransaction: async (id: number, transaction: Partial<Transaction>) => {
    set({ isLoading: true });
    try {
      const response = await axios.put(`${API_URL}/transactions/${id}`, transaction);
      set((state) => ({
        transactions: state.transactions.map(t => 
          t.id === id ? { ...t, ...response.data } : t
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update transaction', isLoading: false });
    }
  },
}));

