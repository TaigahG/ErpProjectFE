import { create } from 'zustand';
import axios from 'axios';
import { Invoice, CreateInvoiceDTO } from '../types/invoice';

interface InvoiceStore {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  fetchInvoices: () => Promise<void>;
  addInvoice: (invoice: CreateInvoiceDTO) => Promise<void>;
}

// const API_URL = 'http://127.0.0.1:8000/api/v1/invoice';
const API_URL = 'https://erpprojectbe-production-f59b.up.railway.app/api/v1/invoice';

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  invoices: [],
  isLoading: false,
  error: null,

  fetchInvoices: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/invoices`);
      set({ invoices: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch invoices', isLoading: false });
    }
  },

  addInvoice: async (invoice) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/invoices`, invoice);
      set((state) => ({
        invoices: [...state.invoices, response.data],
        isLoading: false
      }));
      return response.data;
    } catch (error: any) {
      console.error('Invoice creation error:', error.response?.data);
      if (error.response?.data?.detail) {
        // Check if it's an array
        if (Array.isArray(error.response.data.detail)) {
          error.response.data.detail.forEach((err: any) => {
            console.error('Validation error:', err);
          });
        } else {
          console.error('Error detail:', error.response.data.detail);
        }
      }
      set({ error: 'Failed to add invoice', isLoading: false });
      throw error;
    }
  },
}));